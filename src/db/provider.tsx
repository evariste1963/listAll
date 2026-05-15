import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import migrationStatements from './migrations';

const expoDb = openDatabaseSync('listAll.db', { enableChangeListener: true });
const db = drizzle(expoDb, { schema });

const DBContext = createContext<typeof db>(db);

export function useDB() {
  return useContext(DBContext);
}

interface DBProviderProps {
  children: ReactNode;
}

export function DBProvider({ children }: DBProviderProps) {
  const { success, error } = useMigrations(expoDb as unknown as ExpoSQLiteDatabase, migrationStatements);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (success) {
      seedListTypes();
      setReady(true);
    }
  }, [success]);

  if (error) {
    return (
      <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <p>Migration error: {error.message}</p>
      </div>
    );
  }

  if (!success || !ready) {
    return (
      <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <p>Setting up database...</p>
      </div>
    );
  }

  return <DBContext.Provider value={db}>{children}</DBContext.Provider>;
}

async function seedListTypes() {
  const existing = await db.select().from(schema.listType).limit(1).get();
  
  if (!existing) {
    await db.insert(schema.listType).values([
      { id: 1, name: 'shopping', icon: '🛒', fieldsConfig: '{}', isDefault: true },
      { id: 2, name: 'memo', icon: '📝', fieldsConfig: '{"isCheckable":true}', isDefault: true },
      { id: 3, name: 'todo', icon: '✅', fieldsConfig: '{"dueDate":true,"priority":true}', isDefault: true },
    ]).run();
  }
}

export { db };