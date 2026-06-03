import { useMemo } from 'react';
import { useTheme } from './theme';
import { createThemedStyles as createStyles } from './global';

export function useThemedStyles() {
  const { colors } = useTheme();
  return useMemo(() => createStyles(colors), [colors]);
}
