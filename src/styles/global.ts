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
  priorityOverdue: string;
  deleteColor: string;
  backgroundImage?: string;
  logoAsset: any;
  todoIconBg: string;
  accentText: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  dark: {
    pageBackground: '#000000',
    cardBackground: '#1C1C1E',
    inputBackground: '#2C2C2E',
    accentColor: '#2E5A88',
    completedColor: '#4A7A6A',
    primaryText: '#B8B8B8',
    secondaryText: '#98989D',
    tertiaryText: '#636366',
    mutedText: '#48484A',
    dividerColor: '#38383A',
    priorityHigh: '#8B4A5A',
    priorityMedium: '#8B7A4A',
    priorityLow: '#4A7A6A',
    priorityOverdue: '#AA3A3A',
    deleteColor: '#AA5A6A',
    backgroundImage: undefined,
    logoAsset: require('../../assets/listAll_logo.png'),
    todoIconBg: '#4A7A6A',
    accentText: '#ffffff',
  },
  green: {
    pageBackground: '#1A3D1A',
    cardBackground: '#245A24',
    inputBackground: '#2E6B2E',
    // accentColor: '#2E5A88',
    accentColor: '#6b9c6b',
    completedColor: '#7ED57E',
    primaryText: '#E8F8E8',
    secondaryText: '#A8D0A8',
    tertiaryText: '#6B9C6B',
    mutedText: '#4A7A4A',
    dividerColor: '#3A6B3A',
    priorityHigh: '#8B3A3A',
    priorityMedium: '#8B6A3A',
    priorityLow: '#5A7A4A',
    priorityOverdue: '#AA2A2A',
    deleteColor: '#FF6B6B',
    backgroundImage: 'leafs',
    logoAsset: require('../../assets/listAll_logo_green.png'),
    todoIconBg: '#2E5A88',
    accentText: '#ffffff',
  },
  light: {
    pageBackground: '#f5f5f5',
    cardBackground: '#ffffff',
    inputBackground: '#e5e5e5',
    //accentColor: '#dc2626',
    accentColor: '#2971ab',
    completedColor: '#16a34a',
    primaryText: '#1f2937',
    secondaryText: '#6b7280',
    tertiaryText: '#9ca3af',
    mutedText: '#d1d5db',
    dividerColor: '#e5e5e5',
    priorityHigh: '#dc2626',
    priorityMedium: '#d97706',
    priorityLow: '#16a34a',
    priorityOverdue: '#B91C1C',
    deleteColor: '#dc2626',
    backgroundImage: undefined,
    logoAsset: require('../../assets/listAll_logo.png'),
    todoIconBg: '#16a34a',
    accentText: '#ffffff',
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
  },
  containerPadded: {
    flex: 1,
    padding: spacing.xxxl,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  headerCenter: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  headerTitleSm: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  headerTitleLg: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    textAlign: 'center' as const,
  },
  homeButton: {
    fontSize: fontSize.xxl,
  },
  addButton: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  list: {
    padding: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  cardRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: fontSize.md,
  },
  cardIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: spacing.md,
  },
  cardIcon: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  cardText: {
    flex: 1,
  },
  cardDesc: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  input: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    fontSize: fontSize.base,
  },
  searchBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  searchInput: {
    fontSize: fontSize.base,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  inputRow: {
    flexDirection: 'row' as const,
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  itemInput: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  addIconButton: {
    width: 48,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: borderRadius.md,
  },
  addIconButtonText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  button: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButton: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center' as const,
  },
  primaryButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  secondaryButton: {
    marginTop: spacing.md,
    alignItems: 'center' as const,
  },
  secondaryButtonText: {
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
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  emptyIconLarge: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xxl,
    textAlign: 'center' as const,
  },
  emptyItems: {
    textAlign: 'center' as const,
    marginTop: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontStyle: 'italic' as const,
    marginBottom: spacing.sm,
  },
  createButton: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  createButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
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
  },
  itemRowStart: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  checkbox: {
    marginRight: spacing.md,
    width: 32,
    height: 32,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkboxUnchecked: {
    fontSize: fontSize.xxl,
  },
  checkboxChecked: {
    fontSize: fontSize.xxl,
  },
  itemTitle: {
    flex: 1,
  },
  itemText: {
    fontSize: fontSize.base,
  },
  itemMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  deleteItem: {
    padding: spacing.sm,
  },
  deleteItemText: {
    fontSize: 18,
  },
  toggleModeButton: {
    padding: spacing.sm,
  },
  toggleModeIcon: {
    fontSize: 16,
  },
  moveButtons: {
    flexDirection: 'row' as const,
    marginRight: spacing.xs,
  },
  moveButton: {
    padding: spacing.xs,
  },
  moveButtonText: {
    fontSize: 12,
  },
  countText: {
    fontSize: fontSize.md,
  },
  titleInput: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 200,
  },
  loadingText: {
    textAlign: 'center' as const,
    marginTop: 50,
  },
  summary: {
    padding: spacing.sm,
  },
  summaryText: {
    textAlign: 'center' as const,
  },
  tabBar: {
    maxHeight: 60,
  },
  tabBarContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center' as const,
  },
  tab: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  tabText: {
    fontSize: fontSize.md,
  },
  tabCount: {
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
  },
  addTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.full,
    borderStyle: 'dashed' as const,
  },
  addTabText: {
    fontSize: fontSize.md,
  },
  priorityRow: {
    flexDirection: 'row' as const,
    gap: 8,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  priorityText: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase' as const,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  priorityOption: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
  },
  priorityOptionText: {
    textTransform: 'capitalize' as const,
  },
  overdueBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  overdueIcon: {
    fontSize: fontSize.sm,
  },
  overdueText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  circleBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  circleBadgeText: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.md,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  shopItems: {
    fontSize: fontSize.md,
  },
  shopActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  defaultButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  defaultButtonText: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
  },
  deleteButton: {
    fontSize: 18,
    padding: spacing.xs,
  },
  shopItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  hintText: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  addItemButton: {
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
  },
  addItemButtonText: {
    fontSize: fontSize.base,
  },
  dueDate: {
    fontSize: fontSize.sm,
  },
  dateButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  dateButtonText: {
    textAlign: 'center' as const,
  },
  dateRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: spacing.lg,
  },
  clearDateText: {
    fontSize: fontSize.md,
    marginLeft: spacing.md,
  },
  deleteCompleted: {
    alignSelf: 'flex-end' as const,
    marginBottom: spacing.sm,
  },
  deleteCompletedText: {
    fontSize: fontSize.md,
  },
  noShops: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  noShopsText: {
    fontSize: fontSize.base,
    marginBottom: spacing.lg,
  },
  addShopButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  addShopButtonText: {
    fontSize: fontSize.base,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContent: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '80%' as any,
  },
  modalContentWide: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '85%' as any,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  modalInput: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: fontSize.base,
    marginBottom: spacing.lg,
  },
  modalLabel: {
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
    borderRadius: borderRadius.md,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    fontSize: fontSize.base,
  },
  modalButtonTextPrimary: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  themeRow: {
    flexDirection: 'row' as const,
    gap: spacing.md,
  },
  themeOption: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
  },
  themeOptionText: {
    fontSize: fontSize.md,
    textTransform: 'capitalize' as const,
  },
  appName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  version: {
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  infoText: {
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  createScreenContainer: {
    flex: 1,
    padding: spacing.xxl,
    justifyContent: 'center' as const,
  },
  createScreenTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center' as const,
  },
  createScreenSubtitle: {
    fontSize: fontSize.base,
    marginBottom: spacing.xxxl,
    textAlign: 'center' as const,
  },
  createScreenInputContainer: {
    marginBottom: spacing.xxl,
  },
  createScreenInput: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    borderWidth: 1,
  },
  createScreenButton: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center' as const,
  },
  createScreenButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  createScreenCancelButton: {
    marginTop: spacing.lg,
    alignItems: 'center' as const,
  },
  createScreenCancelText: {
    fontSize: fontSize.base,
  },
  guideContainer: {
    flex: 1,
  },
  guideScrollView: {
    flex: 1,
  },
  homeContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 80,
  },
  guideContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + spacing.md,
  },
  guideMainTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  guideIntro: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  guideSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  guideBullet: {
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  homeHeader: {
    alignItems: 'center' as const,
    paddingVertical: 30,
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 18,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.md,
    overflow: 'hidden' as const,
  },
  logo: {
    width: 135,
    height: 135,
  },
  homeSubtitle: {
    fontSize: fontSize.md,
  },
  cardsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  homeCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: spacing.lg,
    borderRadius: 14,
  },
  tabBarContainer: {
    flexDirection: 'row' as const,
    borderTopWidth: 1,
    paddingTop: spacing.xs,
  },
  tabBarButton: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.sm,
  },
  tabBarIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tabBarIcon: {
    fontSize: fontSize.xxl,
  },
  tabBarLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  swipePage: {
    width: 0,
  },
  placeholderText: {
    color: theme.mutedText,
  },
});

export type ThemedStyles = ReturnType<typeof createThemedStyles>;
