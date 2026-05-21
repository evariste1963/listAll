# Dead Code Report — listAll

Generated: 2026-05-21

---

## Unused Imports (2)

| # | File | Line | Dead Import |
|---|------|------|-------------|
| 1 | `src/styles/theme.tsx` | 1 | `useEffect` |
| 2 | `src/db/index.ts` | 3 | `useMigrations` |

---

## Unused Exported Functions/Variables (5)

| # | File | Line | Dead Export |
|---|------|------|-------------|
| 3 | `src/db/provider.tsx` | 18 | `vacuumDatabase()` |
| 4 | `src/db/provider.tsx` | 80 | `db` instance |
| 5 | `src/db/index.ts` | 7 | `db` instance (duplicate of provider's) |
| 6 | `src/styles/theme.tsx` | 71 | `themes` re-export |
| 7 | `src/styles/theme.tsx` | 71 | `getTheme` re-export |

---

## Unused Types/Interfaces (14)

| # | File | Lines | Dead Export |
|---|------|-------|-------------|
| 8 | `src/db/schema.ts` | 68 | `ShoppingList` |
| 9 | `src/db/schema.ts` | 69 | `ShopTab` |
| 10 | `src/db/schema.ts` | 70 | `MemoList` |
| 11 | `src/db/schema.ts` | 71 | `TodoList` |
| 12 | `src/db/schema.ts` | 72 | `ShoppingItem` |
| 13 | `src/db/schema.ts` | 73 | `MemoItem` |
| 14 | `src/db/schema.ts` | 74 | `TodoItem` |
| 15 | `src/db/schema.ts` | 75 | `DefaultShop` |
| 16 | `src/db/schema.ts` | 76 | `Preference` |
| 17 | `src/navigation/types.ts` | 16 | `TabParamList` |
| 18 | `src/navigation/types.ts` | 23 | `RootStackScreenProps` |
| 19 | `src/navigation/types.ts` | 26 | `TabScreenProps` |
| 20 | `src/styles/global.ts` | 778 | `ThemedStyles` |
| 21 | `src/notifications/index.ts` | 9 | `NotificationInterval` |

---

## Unused Styles (11)

All in `src/styles/global.ts` within `createThemedStyles`:

| # | Line | Style Name |
|---|------|------------|
| 22 | 126 | `containerPadded` |
| 23 | 183 | `cardSubtitle` |
| 24 | 205 | `input` |
| 25 | 232 | `button` |
| 26 | 237 | `buttonText` |
| 27 | 244 | `primaryButton` |
| 28 | 249 | `primaryButtonText` |
| 29 | 253 | `secondaryButton` |
| 30 | 257 | `secondaryButtonText` |
| 31 | 770 | `swipePage` |
| 32 | 773 | `placeholderText` |

---

## Dead Navigation Route (1)

| # | File | Line | Dead Route | Reason |
|---|------|------|------------|--------|
| 33 | `src/navigation/types.ts` | 10 | `CreateShoppingList: undefined` | No screen component exists, no `navigation.navigate()` call, no `<Stack.Screen>` in App.tsx |

---

**Total: 33 findings**
