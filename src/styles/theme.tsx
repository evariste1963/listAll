import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { ThemeName, ThemeColors, getTheme, themes } from './global';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { eq } from 'drizzle-orm';

interface ThemeContextType {
  theme: ThemeName;
  colors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const db = useDB();
  const [theme, setThemeState] = useState<ThemeName>('dark');

  useEffect(() => {
    async function load() {
      try {
        const row = await db.select().from(schema.preference)
          .where(eq(schema.preference.key, 'defaultTheme'))
          .get();
        if (row && (row.value === 'dark' || row.value === 'green' || row.value === 'light')) {
          setThemeState(row.value as ThemeName);
        }
      } catch {}
    }
    load();
  }, [db]);

  const colors = getTheme(theme);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    db.insert(schema.preference)
      .values({ key: 'defaultTheme', value: newTheme })
      .onConflictDoUpdate({
        target: schema.preference.key,
        set: { value: newTheme },
      })
      .run();
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

const bgImages: Record<string, any> = {
  leafs: require('../../assets/leafs.png'),
};

interface ThemedBackgroundProps {
  colors: ThemeColors;
  children: ReactNode;
}

export function ThemedBackground({ colors, children }: ThemedBackgroundProps) {
  const img = colors.backgroundImage ? bgImages[colors.backgroundImage] : null;

  return (
    <ImageBackground
      source={img ?? undefined}
      style={styles.fill}
      resizeMode="repeat"
      imageStyle={styles.fill}
    >
      <View style={[styles.fill, { backgroundColor: colors.pageBackground, opacity: img ? 0.85 : 1 }]}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

export { themes, getTheme };
export type { ThemeName, ThemeColors };
