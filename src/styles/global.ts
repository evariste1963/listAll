export type ThemeName = 'dark' | 'green' | 'light';

export interface ThemeColors {
  pageBackground: string;
  cardBackground: string;
  inputBackground: string;
  accentColor: string;
  completedColor: string;
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  mutedText: string;
  dividerColor: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  deleteColor: string;
  gradientColors?: string[];
}

export const themes: Record<ThemeName, ThemeColors> = {
  dark: {
    pageBackground: '#000000',
    cardBackground: '#1C1C1E',
    inputBackground: '#2C2C2E',
    accentColor: '#2E5A88',
    completedColor: '#30D158',
    primaryText: '#FFFFFF',
    secondaryText: '#98989D',
    tertiaryText: '#636366',
    mutedText: '#48484A',
    dividerColor: '#38383A',
    priorityHigh: '#FF453A',
    priorityMedium: '#FF9F0A',
    priorityLow: '#32D74B',
    deleteColor: '#FF453A',
    gradientColors: ['#000000', '#1C1C1E', '#2C2C2E'],
  },
  green: {
    pageBackground: '#1A3D1A',
    cardBackground: '#245A24',
    inputBackground: '#2E6B2E',
    accentColor: '#5CCC5C',
    completedColor: '#7ED57E',
    primaryText: '#E8F8E8',
    secondaryText: '#A8D0A8',
    tertiaryText: '#6B9C6B',
    mutedText: '#4A7A4A',
    dividerColor: '#3A6B3A',
    priorityHigh: '#FF6B6B',
    priorityMedium: '#FFB84D',
    priorityLow: '#7ED57E',
    deleteColor: '#FF6B6B',
    gradientColors: ['#1A3D1A', '#3A7A3A', '#A8D8A8'],
  },
  light: {
    pageBackground: '#f5f5f5',
    cardBackground: '#ffffff',
    inputBackground: '#e5e5e5',
    accentColor: '#dc2626',
    completedColor: '#16a34a',
    primaryText: '#1f2937',
    secondaryText: '#6b7280',
    tertiaryText: '#9ca3af',
    mutedText: '#d1d5db',
    dividerColor: '#e5e5e5',
    priorityHigh: '#dc2626',
    priorityMedium: '#d97706',
    priorityLow: '#16a34a',
    deleteColor: '#dc2626',
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
    backgroundColor: theme.pageBackground,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: spacing.lg,
    backgroundColor: theme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.dividerColor,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: theme.primaryText,
  },
  homeButton: {
    fontSize: 24,
  },
  addButton: {
    fontSize: 28,
    color: theme.accentColor,
    fontWeight: fontWeight.bold,
  },
  list: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: theme.cardBackground,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: theme.primaryText,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: fontSize.md,
    color: theme.tertiaryText,
  },
  input: {
    backgroundColor: theme.inputBackground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    color: theme.primaryText,
    fontSize: fontSize.base,
    borderWidth: 1,
    borderColor: theme.dividerColor,
  },
  inputRow: {
    flexDirection: 'row' as const,
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  itemInput: {
    flex: 1,
    backgroundColor: theme.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    color: theme.primaryText,
    marginRight: spacing.sm,
  },
  button: {
    backgroundColor: theme.accentColor,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    color: theme.primaryText,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButton: {
    backgroundColor: theme.accentColor,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center' as const,
  },
  primaryButtonText: {
    color: theme.primaryText,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  secondaryButton: {
    marginTop: spacing.md,
    alignItems: 'center' as const,
  },
  secondaryButtonText: {
    color: theme.tertiaryText,
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
    color: theme.primaryText,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: theme.tertiaryText,
    marginBottom: spacing.xxl,
    textAlign: 'center' as const,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: theme.accentColor,
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
    borderBottomColor: theme.cardBackground,
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
    color: theme.secondaryText,
  },
  checkboxChecked: {
    fontSize: 24,
    color: theme.completedColor,
  },
  itemTitle: {
    flex: 1,
  },
  itemText: {
    fontSize: fontSize.base,
    color: theme.primaryText,
  },
  itemDone: {
    textDecorationLine: 'line-through' as const,
    color: theme.mutedText,
  },
  deleteItem: {
    padding: spacing.sm,
  },
  deleteItemText: {
    color: theme.deleteColor,
    fontSize: 18,
  },
  emptyItems: {
    textAlign: 'center' as const,
    color: theme.mutedText,
    marginTop: spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContent: {
    backgroundColor: theme.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '80%',
  },
  modalContentWide: {
    backgroundColor: theme.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '85%',
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: theme.primaryText,
    marginBottom: spacing.lg,
  },
  modalInput: {
    backgroundColor: theme.inputBackground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    color: theme.primaryText,
    fontSize: fontSize.base,
    marginBottom: spacing.lg,
  },
  modalLabel: {
    color: theme.secondaryText,
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
    backgroundColor: theme.accentColor,
    borderRadius: borderRadius.md,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: theme.secondaryText,
    fontSize: fontSize.base,
  },
  modalButtonTextPrimary: {
    color: theme.primaryText,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  titleInput: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: theme.primaryText,
    backgroundColor: theme.inputBackground,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 200,
  },
  countText: {
    color: theme.secondaryText,
    fontSize: fontSize.md,
  },
  placeholderText: {
    color: theme.mutedText,
  },
});

export type ThemedStyles = ReturnType<typeof createThemedStyles>;