import type { IDBPDatabase } from 'idb';
import type { RitmoDuoSchema } from './schema';

export const STORAGE_VERSION = 2;
export const DATABASE_NAME = 'ritmo-duo';

const migrateToVersion1 = (database: IDBPDatabase<RitmoDuoSchema>): void => {
  database.createObjectStore('metadata', { keyPath: 'key' });
  database.createObjectStore('users', { keyPath: 'id' });
  database.createObjectStore('preferences', { keyPath: 'id' });

  const sessions = database.createObjectStore('workoutSessions', { keyPath: 'id' });
  sessions.createIndex('by-user', 'userId');
  sessions.createIndex('by-status', 'status');
  sessions.createIndex('by-started-at', 'startedAt');

  database.createObjectStore('activeWorkout', { keyPath: 'id' });

  const progress = database.createObjectStore('exerciseProgress', { keyPath: 'id' });
  progress.createIndex('by-user', 'userId');
  progress.createIndex('by-exercise', 'exerciseId');
};

const migrateToVersion2 = (database: IDBPDatabase<RitmoDuoSchema>): void => {
  const entries = database.createObjectStore('weightEntries', { keyPath: 'id' });
  entries.createIndex('by-user', 'userId');
  entries.createIndex('by-recorded-at', 'recordedAt');
};

export const applyMigrations = (
  database: IDBPDatabase<RitmoDuoSchema>,
  oldVersion: number,
): void => {
  if (oldVersion < 1) {
    migrateToVersion1(database);
  }
  if (oldVersion < 2) {
    migrateToVersion2(database);
  }
};
