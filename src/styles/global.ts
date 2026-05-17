export type ThemeName = 'dark' | 'green' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  success: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  border: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  danger: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  dark: {
    background: '#1a1a2e',
    surface: '#16213e',
    surfaceAlt: '#0f3460',
    primary: '#e94560',
    success: '#4ade80',
    text: '#fff',
    textSecondary: '#aaa',
    textTertiary: '#888',
    textMuted: '#666',
    border: '#0f3460',
    priorityHigh: '#e94560',
    priorityMedium: '#f59e0b',
    priorityLow: '#10b981',
    danger: '#e94560',
  },
  green: {
    background: '#0d1f0d',
    surface: '#152615',
    surfaceAlt: '#1e3a1e',
    primary: '#4ade80',
    success: '#22c55e',
    text: '#e8f5e8',
    textSecondary: '#a8d4a8',
    textTertiary: '#6b9c6b',
    textMuted: '#4a6b4a',
    border: '#1e3a1e',
    priorityHigh: '#ef4444',
    priorityMedium: '#f59e0b',
    priorityLow: '#22c55e',
    danger: '#ef4444',
  },
  light: {
    background: '#f5f5f5',
    surface: '#ffffff',
    surfaceAlt: '#e5e5e5',
    primary: '#dc2626',
    success: '#16a34a',
    text: '#1f2937',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textMuted: '#d1d5db',
    border: '#e5e5e5',
    priorityHigh: '#dc2626',
    priorityMedium: '#d97706',
    priorityLow: '#16a34a',
    danger: '#dc2626',
  },
};

export const getTheme = (name: ThemeName = 'dark'): ThemeColors => themes[name];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 20,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 22,
  xxxl: 28,
  title: 36,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: 'bold' as const,
};

export const createThemedStyles = (theme: ThemeColors) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: spacing.lg,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: theme.text,
  },
  homeButton: {
    fontSize: 24,
  },
  addButton: {
    fontSize: 28,
    color: theme.primary,
    fontWeight: fontWeight.bold,
  },
  list: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: theme.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: fontSize.md,
    color: theme.textTertiary,
  },
  input: {
    backgroundColor: theme.surfaceAlt,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    color: theme.text,
    fontSize: fontSize.base,
    borderWidth: 1,
    borderColor: theme.border,
  },
  inputRow: {
    flexDirection: 'row' as const,
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  itemInput: {
    flex: 1,
    backgroundColor: theme.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    color: theme.text,
    marginRight: spacing.sm,
  },
  button: {
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    color: theme.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButton: {
    backgroundColor: theme.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center' as const,
  },
  primaryButtonText: {
    color: theme.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  secondaryButton: {
    marginTop: spacing.md,
    alignItems: 'center' as const,
  },
  secondaryButtonText: {
    color: theme.textTertiary,
    fontSize: fontSize.base,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: theme.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: theme.textTertiary,
    marginBottom: spacing.xxl,
    textAlign: 'center' as const,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: theme.primary,
    marginBottom: spacing.md,
    textTransform: 'uppercase' as const,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface,
  },
  checkbox: {
    marginRight: spacing.md,
    width: 32,
    height: 32,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkboxUnchecked: {
    fontSize: 24,
    color: theme.textSecondary,
  },
  checkboxChecked: {
    fontSize: 24,
    color: theme.success,
  },
  itemTitle: {
    flex: 1,
  },
  itemText: {
    fontSize: fontSize.base,
    color: theme.text,
  },
  itemDone: {
    textDecorationLine: 'line-through' as const,
    color: theme.textMuted,
  },
  deleteItem: {
    padding: spacing.sm,
  },
  deleteItemText: {
    color: theme.danger,
    fontSize: 18,
  },
  emptyItems: {
    textAlign: 'center' as const,
    color: theme.textMuted,
    marginTop: spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '80%',
  },
  modalContentWide: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '85%',
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: theme.text,
    marginBottom: spacing.lg,
  },
  modalInput: {
    backgroundColor: theme.surfaceAlt,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    color: theme.text,
    fontSize: fontSize.base,
    marginBottom: spacing.lg,
  },
  modalLabel: {
    color: theme.textSecondary,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
  },
  modalButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },
  modalButtonPrimary: {
    backgroundColor: theme.primary,
    borderRadius: borderRadius.md,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: theme.textSecondary,
    fontSize: fontSize.base,
  },
  modalButtonTextPrimary: {
    color: theme.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  titleInput: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: theme.text,
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 200,
  },
  countText: {
    color: theme.textSecondary,
    fontSize: fontSize.md,
  },
  placeholderText: {
    color: theme.textMuted,
  },
});

export type ThemedStyles = ReturnType<typeof createThemedStyles>;