import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { ThemeName, ThemeColors, getTheme, themes } from './global';

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
  const [theme, setThemeState] = useState<ThemeName>('dark');

  const colors = getTheme(theme);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
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
