export {
  getConfigFromPreset,
  validateConfig,
} from './lib/config';
export { Database } from './lib/database';
export {
  closeAllDatabases,
  closeDatabaseInstance,
  configureDatabaseLogger,
  createDatabase,
  createDatabaseFromPreset,
  getDatabaseInstance} from './lib/factory';
export {
  buildInsertStatement,
  buildUpdateStatement,
  buildWhereClause,
  escapeIdentifier,
  formatSqlQuery,
  getFirstRow,
  getRowCount,
  getRows} from './lib/helpers';
export {
  createQueryProfiler,
  getLogger,
  setLogger} from './lib/logger';
export type {
  BulkInsertOptions,
  DatabaseConfig,
  DatabaseConfigPreset,
  DatabaseInstance,
  DatabaseLogger,
  QueryOptions,
  QueryProfiler,
} from './lib/types';
export type { PoolConfig, QueryResult } from 'pg';
