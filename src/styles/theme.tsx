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

  if (img) {
    return (
      <ImageBackground
        source={img}
        style={styles.fill}
        resizeMode="repeat"
        imageStyle={styles.fill}
      >
        <View style={[styles.fill, { backgroundColor: colors.pageBackground, opacity: 0.92 }]}>
          {children}
        </View>
      </ImageBackground>
    );
  }

  return <View style={[styles.fill, { backgroundColor: colors.pageBackground }]}>{children}</View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

export { themes, getTheme };
export type { ThemeName, ThemeColors };