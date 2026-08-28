import type { UserId, WeightEntry } from '@/types';
import { createId } from '@/utils';
import { getDatabase } from './database';

export interface AddWeightEntryInput {
  userId: UserId;
  weightKg: number;
  recordedAt: number;
}

const isValidWeight = (weightKg: number): boolean =>
  Number.isFinite(weightKg) && weightKg > 0 && weightKg <= 500;

export const addWeightEntry = async (
  input: AddWeightEntryInput,
  createdAt = Date.now(),
): Promise<WeightEntry> => {
  if (!isValidWeight(input.weightKg)) {
    throw new Error('Informe um peso entre 0,1 e 500 kg.');
  }
  if (!Number.isFinite(input.recordedAt)) {
    throw new Error('Informe uma data de pesagem válida.');
  }

  const entry: WeightEntry = {
    id: createId(`weight-${input.userId}`, createdAt),
    userId: input.userId,
    weightKg: input.weightKg,
    recordedAt: input.recordedAt,
    createdAt,
  };
  const database = await getDatabase();
  await database.put('weightEntries', entry);
  return entry;
};

export const listWeightEntries = async (userId?: UserId): Promise<WeightEntry[]> => {
  const database = await getDatabase();
  const entries = userId
    ? await database.getAllFromIndex('weightEntries', 'by-user', userId)
    : await database.getAll('weightEntries');

  return entries.sort(
    (left, right) => left.recordedAt - right.recordedAt || left.createdAt - right.createdAt,
  );
};
