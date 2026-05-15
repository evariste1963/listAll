# listAll - Project Plan

## Overview
Rewrite ShoppingList2024 (.NET MAUI/Blazor) into Expo React Native with scalable architecture supporting Shopping Lists, Memos, and Todos.

## Tech Stack
- **Framework:** Expo SDK 54 (latest)
- **Language:** TypeScript
- **Database:** expo-sqlite + Drizzle ORM
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **UI:** React Native core + expo-linear-gradient

## Data Architecture

### Schema

```sql
-- ListType (templates - pre-seeded)
ListType: id, name, icon, fields_config (JSON)

-- Memo/Todo Lists (multi-instance)
MemoList: id, title, created_at
TodoList: id, title, created_at

-- Shopping List (single active at a time)
ShoppingList: id, title, is_active, created_at
ShopTab: id, list_id (FK), name, order

-- Items (shared across all list types)
ListItem: id, list_id (FK), shop_tab_id (nullable FK), title, is_done, order, extra_fields (JSON)
```

### Templates

| Type | Icon | Extra Fields |
|------|------|--------------|
| shopping | 🛒 | - |
| memo | 📝 | is_checkable (bool) |
| todo | ✅ | due_date, priority (low/med/high) |

## App Flow

### Initial State
- Empty → User creates first Shopping List, or navigates to Memos/Todos

### Shopping List Screen
- Header: List title (editable) + item count summary
- Tab bar: Shop names (Walmart, Target...) + "Add Shop" button
- Body: Items for selected tab
- End List: Appears when tabs = 0

### End Shopping List Flow
- All tabs deleted → Prompt: "End Shopping List?"
- Yes → clear list → return to initial state
- No → stay, allow adding new tab

### Memos/Todos
- Standard list management (create, open, delete)
- Each list shows items below

## Project Structure

```
listAll/
├── App.tsx                 # Entry, providers, navigation
├── src/
│   ├── db/
│   │   ├── schema.ts       # Drizzle tables
│   │   ├── seed.ts         # Seed default templates
│   │   └── index.ts        # DB + migrations
│   ├── context/
│   │   └── AppContext.tsx  # Global state
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Initial - create/select list
│   │   ├── ShoppingListScreen.tsx # Shop tabs + items
│   │   ├── MemoListScreen.tsx    # All memos
│   │   ├── MemoDetailScreen.tsx   # Items in memo
│   │   ├── TodoListScreen.tsx     # All todos
│   │   ├── TodoDetailScreen.tsx   # Items in todo
│   │   └── PreferencesScreen.tsx
│   ├── components/
│   │   ├── ListCard.tsx
│   │   ├── ShopTabBar.tsx
│   │   ├── ItemRow.tsx
│   │   ├── AddItemInput.tsx
│   │   └── ...
│   ├── hooks/
│   │   └── useListOperations.ts
│   └── utils/
│       └── constants.ts
```

## Phases

| Phase | Focus |
|-------|-------|
| 1 | Setup, Drizzle schema, migrations, navigation |
| 2 | Home screen, create list flow |
| 3 | Shopping list: summary view, tabs, items |
| 4 | Memo/Todo screens with extra fields |
| 5 | Preferences, polish, build |

## Scalability Points

1. **New template:** Add row to `ListType` + define fields + create screen component
2. **New field:** Add to `fields_config` JSON + render in detail screen
3. **Shop tabs:** Add/remove `ShopTab` rows freely