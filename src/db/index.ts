import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import * as schema from './schema';

const expoDb = openDatabaseSync('listAll.db', { enableChangeListener: true });
export const db = drizzle(expoDb, { schema });

export { schema };