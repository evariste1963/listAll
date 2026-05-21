import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { eq } from 'drizzle-orm';
import { DEFAULT_INTERVALS } from '../notifications';

interface PreferencesContextType {
  notificationIntervals: number[];
  setNotificationIntervals: (intervals: number[]) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

interface PreferencesProviderProps {
  children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const db = useDB();
  const [notificationIntervals, setNotificationIntervalsState] = useState<number[]>(DEFAULT_INTERVALS);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const result = await db.select().from(schema.preference).where(eq(schema.preference.key, 'notificationIntervals')).get();
        if (result) {
          const parsed = JSON.parse(result.value);
          if (Array.isArray(parsed)) {
            setNotificationIntervalsState(parsed);
          }
        }
      } catch {
        // Use defaults
      }
    }
    loadPreferences();
  }, [db]);

  const setNotificationIntervals = async (intervals: number[]) => {
    setNotificationIntervalsState(intervals);
    await db.insert(schema.preference)
      .values({ key: 'notificationIntervals', value: JSON.stringify(intervals) })
      .onConflictDoUpdate({
        target: schema.preference.key,
        set: { value: JSON.stringify(intervals) },
      })
      .run();
  };

  return (
    <PreferencesContext.Provider value={{ notificationIntervals, setNotificationIntervals }}>
      {children}
    </PreferencesContext.Provider>
  );
}
