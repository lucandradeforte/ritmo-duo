import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getWorkoutTemplate } from '@/data';
import type { UserId } from '@/types';
import { createActiveWorkout } from '@/utils';
import {
  addWeightEntry,
  clearUserWorkoutHistory,
  closeStorage,
  completeActiveWorkout,
  createBackup,
  deleteStorageDatabase,
  getActiveWorkout,
  getExerciseProgress,
  getPreferences,
  importBackup,
  initializeStorage,
  listExerciseProgress,
  listUserProfiles,
  listWeightEntries,
  listWorkoutSessions,
  parseBackup,
  saveActiveWorkout,
  serializeBackup,
  updatePreferences,
} from './index';

const completeWorkoutForUser = async (userId: UserId, startedAt: number): Promise<string> => {
  const template = getWorkoutTemplate(userId, 'A');
  if (!template) throw new Error(`Ficha A de ${userId} não encontrada`);

  const activeWorkout = createActiveWorkout([template], { now: startedAt });
  const session = activeWorkout.sessions[userId];
  const exercise = session?.exercises[0];
  const firstSet = exercise?.sets[0];
  if (!session || !exercise || !firstSet) {
    throw new Error(`Sessão de teste de ${userId} incompleta`);
  }

  firstSet.loadKg = 10;
  firstSet.repetitions = 10;
  firstSet.rir = 3;
  firstSet.completed = true;
  firstSet.completedAt = startedAt + 30_000;
  activeWorkout.sessions[userId] = {
    ...session,
    cardio: session.cardio
      ? {
          ...session.cardio,
          completedAt: startedAt + 50_000,
          durationSeconds: 300,
        }
      : null,
    feedback: { feeling: 'good', overallRpe: 6, notes: '' },
  };

  await saveActiveWorkout(activeWorkout);
  await completeActiveWorkout(startedAt + 60_000);
  return exercise.exerciseId;
};

describe.sequential('persistência IndexedDB', () => {
  beforeEach(async () => {
    await deleteStorageDatabase();
    await initializeStorage();
  });

  afterEach(async () => {
    await closeStorage();
  });

  it('semeia perfis e persiste preferências separadas', async () => {
    await expect(listUserProfiles()).resolves.toHaveLength(2);
    await updatePreferences({ lastUserId: 'geovanna', theme: 'dark' }, 10_000);
    await expect(getPreferences()).resolves.toMatchObject({
      lastUserId: 'geovanna',
      theme: 'dark',
      updatedAt: 10_000,
    });
  });

  it('recupera uma sessão ativa depois de fechar e reabrir o banco', async () => {
    const template = getWorkoutTemplate('lucas', 'A');
    expect(template).toBeDefined();
    if (!template) return;

    const active = createActiveWorkout([template], { now: 20_000 });
    await saveActiveWorkout(active);
    await closeStorage();

    await expect(getActiveWorkout()).resolves.toMatchObject({
      id: active.id,
      activeUserId: 'lucas',
      startedAt: 20_000,
    });
  });

  it('finaliza a sessão de forma atômica e a move para o histórico', async () => {
    const template = getWorkoutTemplate('lucas', 'B');
    expect(template).toBeDefined();
    if (!template) return;

    const active = createActiveWorkout([template], { now: 30_000 });
    const exercise = active.sessions.lucas?.exercises[0];
    const firstSet = exercise?.sets[0];
    expect(exercise).toBeDefined();
    expect(firstSet).toBeDefined();
    if (!exercise || !firstSet) return;

    firstSet.loadKg = 10;
    firstSet.repetitions = 10;
    firstSet.rir = 3;
    firstSet.completed = true;
    firstSet.completedAt = 45_000;
    active.sessions.lucas = {
      ...active.sessions.lucas!,
      cardio: active.sessions.lucas?.cardio
        ? { ...active.sessions.lucas.cardio, completedAt: 80_000, durationSeconds: 600 }
        : null,
      feedback: { feeling: 'good', overallRpe: 6, notes: '' },
    };
    await saveActiveWorkout(active);
    const completed = await completeActiveWorkout(90_000);

    expect(completed).toHaveLength(1);
    expect(completed[0]).toMatchObject({ status: 'completed', durationSeconds: 60, programWeek: 1 });
    await expect(getActiveWorkout()).resolves.toBeNull();
    await expect(listWorkoutSessions({ userId: 'lucas' })).resolves.toHaveLength(1);
    await expect(getExerciseProgress('lucas', exercise.exerciseId)).resolves.toMatchObject({
      lastLoadKg: 10,
      lastRepetitions: 10,
      bestVolumeKg: 100,
    });
  });

  it('não finaliza o modo dupla enquanto um participante ainda está treinando', async () => {
    const lucasTemplate = getWorkoutTemplate('lucas', 'A');
    const geovannaTemplate = getWorkoutTemplate('geovanna', 'A');
    expect(lucasTemplate).toBeDefined();
    expect(geovannaTemplate).toBeDefined();
    if (!lucasTemplate || !geovannaTemplate) return;

    const active = createActiveWorkout([lucasTemplate, geovannaTemplate], { now: 30_000 });
    const lucas = active.sessions.lucas;
    if (!lucas?.cardio) throw new Error('Cardio do Lucas ausente');
    active.sessions.lucas = {
      ...lucas,
      cardio: { ...lucas.cardio, completedAt: 80_000, durationSeconds: 600 },
      feedback: { feeling: 'good', overallRpe: 6, notes: '' },
    };
    await saveActiveWorkout(active);

    await expect(completeActiveWorkout(90_000)).rejects.toThrow('participantes com treino pendente');
    await expect(getActiveWorkout()).resolves.toMatchObject({ mode: 'duo' });
    await expect(listWorkoutSessions()).resolves.toHaveLength(0);
  });

  it('limpa histórico e progresso de um perfil em uma única operação isolada', async () => {
    const lucasExerciseId = await completeWorkoutForUser('lucas', 100_000);
    const geovannaExerciseId = await completeWorkoutForUser('geovanna', 200_000);
    await addWeightEntry({ userId: 'lucas', weightKg: 109.4, recordedAt: 250_000 }, 260_000);
    await updatePreferences({ lastUserId: 'lucas', theme: 'dark' }, 270_000);

    const activeTemplate = getWorkoutTemplate('lucas', 'B');
    if (!activeTemplate) throw new Error('Ficha B do Lucas não encontrada');
    const activeWorkout = createActiveWorkout([activeTemplate], { now: 300_000 });
    await saveActiveWorkout(activeWorkout);

    await clearUserWorkoutHistory('lucas');

    await expect(listWorkoutSessions({ userId: 'lucas' })).resolves.toHaveLength(0);
    await expect(listExerciseProgress('lucas')).resolves.toHaveLength(0);
    await expect(getExerciseProgress('lucas', lucasExerciseId)).resolves.toBeUndefined();

    await expect(listWorkoutSessions({ userId: 'geovanna' })).resolves.toHaveLength(1);
    await expect(getExerciseProgress('geovanna', geovannaExerciseId)).resolves.toMatchObject({
      userId: 'geovanna',
      exerciseId: geovannaExerciseId,
    });
    await expect(listWeightEntries('lucas')).resolves.toMatchObject([
      { weightKg: 109.4, recordedAt: 250_000 },
    ]);
    await expect(getPreferences()).resolves.toMatchObject({
      lastUserId: 'lucas',
      theme: 'dark',
      updatedAt: 270_000,
    });
    await expect(getActiveWorkout()).resolves.toMatchObject({ id: activeWorkout.id });
    await expect(listUserProfiles()).resolves.toHaveLength(2);
  });

  it('exporta, valida e restaura backup versionado', async () => {
    await updatePreferences({ lastUserId: 'lucas', soundEnabled: true }, 40_000);
    await addWeightEntry({ userId: 'lucas', weightKg: 109.4, recordedAt: 30_000 }, 35_000);
    const backup = await createBackup(50_000);
    const serialized = serializeBackup(backup);
    expect(parseBackup(serialized)).toEqual(backup);
    expect(backup.data.weightEntries).toHaveLength(1);

    await updatePreferences({ lastUserId: 'geovanna', soundEnabled: false }, 60_000);
    const result = await importBackup(serialized);

    expect(result.users).toBe(2);
    expect(result.weightEntries).toBe(1);
    await expect(getPreferences()).resolves.toMatchObject({
      lastUserId: 'lucas',
      soundEnabled: true,
      updatedAt: 40_000,
    });
    await expect(listWeightEntries('lucas')).resolves.toMatchObject([
      { weightKg: 109.4, recordedAt: 30_000 },
    ]);
  });

  it('mantém pesagens separadas e ordenadas pela data da medição', async () => {
    await addWeightEntry({ userId: 'lucas', weightKg: 110, recordedAt: 30_000 }, 40_000);
    await addWeightEntry({ userId: 'lucas', weightKg: 109.5, recordedAt: 10_000 }, 50_000);
    await addWeightEntry({ userId: 'geovanna', weightKg: 70, recordedAt: 20_000 }, 60_000);

    await expect(listWeightEntries('lucas')).resolves.toMatchObject([
      { weightKg: 109.5, recordedAt: 10_000 },
      { weightKg: 110, recordedAt: 30_000 },
    ]);
    await expect(listWeightEntries('geovanna')).resolves.toMatchObject([
      { weightKg: 70, recordedAt: 20_000 },
    ]);
  });

  it('aceita backup da versão anterior sem histórico de peso', async () => {
    const backup = await createBackup(70_000);
    const legacy = JSON.stringify({
      ...backup,
      storageVersion: 1,
      data: {
        ...backup.data,
        weightEntries: undefined,
      },
    });

    expect(parseBackup(legacy)).toMatchObject({
      storageVersion: 2,
      data: { weightEntries: [] },
    });
  });

  it('recusa conteúdo que não corresponde ao schema do backup', () => {
    expect(() => parseBackup('{"app":"outro"}')).toThrow('Backup incompatível');
  });

  it('valida a semana persistida nas sessões do backup', async () => {
    const template = getWorkoutTemplate('lucas', 'A');
    expect(template).toBeDefined();
    if (!template) return;

    await saveActiveWorkout(createActiveWorkout([template], { now: 70_000, programWeek: 5 }));
    const serialized = serializeBackup(await createBackup(80_000));

    expect(serialized).toContain('"programWeek": 5');
    expect(() => parseBackup(serialized.replace('"programWeek": 5', '"programWeek": 9'))).toThrow(
      'Backup incompatível',
    );
  });

  it('recusa RIR e RPE fora da escala no backup', async () => {
    const template = getWorkoutTemplate('lucas', 'A');
    expect(template).toBeDefined();
    if (!template) return;

    await saveActiveWorkout(createActiveWorkout([template], { now: 90_000 }));
    const serialized = serializeBackup(await createBackup(100_000));

    expect(() =>
      parseBackup(serialized.replace('"rir": null', '"rir": 999')),
    ).toThrow('Backup incompatível');
    expect(() =>
      parseBackup(serialized.replace('"rpe": null', '"rpe": 0')),
    ).toThrow('Backup incompatível');
  });
});
