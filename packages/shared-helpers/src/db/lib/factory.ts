import * as dotenv from 'dotenv';

import { getConfigFromPreset } from './config';
import { Database } from './database';
import { setLogger } from './logger';
import type {
  DatabaseConfig,
  DatabaseConfigPreset,
  DatabaseInstance,
  DatabaseLogger,
} from './types';

dotenv.config();

const databaseInstances = new Map<string, DatabaseInstance>();

export function createDatabase(getConfig: () => DatabaseConfig): DatabaseInstance {
  return new Database(getConfig);
}

export function createDatabaseFromPreset(
  preset: DatabaseConfigPreset,
  overrides?: Partial<DatabaseConfig>,
): DatabaseInstance {
  return createDatabase(() => ({ ...getConfigFromPreset(preset), ...overrides }));
}

export function getDatabaseInstance(
  name: string,
  config?: DatabaseConfig,
): DatabaseInstance {
  if (!databaseInstances.has(name)) {
    if (!config) {
      throw new Error(`Database instance '${name}' not found and no config provided`);
    }
    const instance = new Database(() => ({ ...config, name }));
    databaseInstances.set(name, instance);
  }
  return databaseInstances.get(name)!;
}

export async function closeDatabaseInstance(name: string): Promise<void> {
  const instance = databaseInstances.get(name);
  if (instance) {
    await instance.end();
    databaseInstances.delete(name);
  }
}

export async function closeAllDatabases(): Promise<void> {
  const promises = Array.from(databaseInstances.values()).map(instance =>
    instance.end(),
  );
  await Promise.all(promises);
  databaseInstances.clear();
}

export function configureDatabaseLogger(logger: DatabaseLogger): void {
  setLogger(logger);
}
