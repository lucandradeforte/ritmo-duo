import { deleteDB, openDB, type IDBPDatabase } from 'idb';
import { users } from '@/data/users';
import type { AppPreferences } from '@/types';
import { applyMigrations, DATABASE_NAME, STORAGE_VERSION } from './migrations';
import type { RitmoDuoSchema } from './schema';

let databasePromise: Promise<IDBPDatabase<RitmoDuoSchema>> | null = null;

export const createDefaultPreferences = (now = Date.now()): AppPreferences => ({
  id: 'app',
  theme: 'system',
  lastUserId: null,
  soundEnabled: false,
  wakeLockEnabled: false,
  installHelpDismissed: false,
  updatedAt: now,
});

const ensureSeedData = async (database: IDBPDatabase<RitmoDuoSchema>): Promise<void> => {
  const transaction = database.transaction(['metadata', 'users', 'preferences'], 'readwrite');
  const metadataStore = transaction.objectStore('metadata');
  const usersStore = transaction.objectStore('users');
  const preferencesStore = transaction.objectStore('preferences');

  await Promise.all(
    users.map(async (profile) => {
      if (!(await usersStore.get(profile.id))) {
        await usersStore.put(profile);
      }
    }),
  );

  if (!(await preferencesStore.get('app'))) {
    await preferencesStore.put(createDefaultPreferences());
  }

  await metadataStore.put({ key: 'storageVersion', value: STORAGE_VERSION });
  await transaction.done;
};

export const getDatabase = (): Promise<IDBPDatabase<RitmoDuoSchema>> => {
  databasePromise ??= openDB<RitmoDuoSchema>(DATABASE_NAME, STORAGE_VERSION, {
    upgrade(database, oldVersion) {
      applyMigrations(database, oldVersion);
    },
    blocked() {
      window.dispatchEvent(new CustomEvent('ritmo-duo:storage-blocked'));
    },
    blocking() {
      window.dispatchEvent(new CustomEvent('ritmo-duo:storage-upgrade-requested'));
    },
  })
    .then(async (database) => {
      await ensureSeedData(database);
      return database;
    })
    .catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });

  return databasePromise;
};

export const initializeStorage = async (): Promise<void> => {
  await getDatabase();
};

export const closeStorage = async (): Promise<void> => {
  if (!databasePromise) {
    return;
  }

  const database = await databasePromise;
  database.close();
  databasePromise = null;
};

export const deleteStorageDatabase = async (): Promise<void> => {
  await closeStorage();
  await deleteDB(DATABASE_NAME);
};
