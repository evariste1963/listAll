import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';
import migrationStatements from './migrations';

const expoDb = openDatabaseSync('listAll.db', { enableChangeListener: true });
const db = drizzle(expoDb, { schema });

const DBContext = createContext<typeof db>(db);

export function useDB() {
  return useContext(DBContext);
}

export async function vacuumDatabase() {
  await expoDb.execAsync('VACUUM');
}

interface DBProviderProps {
  children: ReactNode;
}

export function DBProvider({ children }: DBProviderProps) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function runMigrations() {
      try {
        for (const stmt of migrationStatements) {
          await expoDb.execAsync(stmt);
        }
        await seedListTypes();
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Migration failed');
      }
    }
    runMigrations();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Migration error: {error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Setting up database...</Text>
      </View>
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