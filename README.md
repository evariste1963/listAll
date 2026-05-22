# listAll — User Guide

listAll is a personal list manager with three list types: Shopping, Memos, and Todos. All data is stored locally on your device in a SQLite database.

---

## App Startup

- App initializes in this order: `DBProvider` → `ThemeProvider` → `PreferencesProvider` → `NotificationInitializer` → Navigation
- Database is auto-created and migrated on first launch
- When app goes to background, database is auto-vacuumed (debounced 5s) to reclaim space
- Status bar style (light/dark) adjusts to current theme

---

## Home Dashboard

The Home tab is your navigation hub with 5 cards:

| Card | Action |
|------|--------|
| 🛒 Shopping | Switches to Shopping tab |
| 📝 Memos | Switches to Memos tab |
| ✓ Todos | Switches to Todos tab |
| ⚙️ Preferences | Switches to Prefs tab |
| 📖 Guide | Opens this guide as a separate screen |

The header shows the app logo (adapts to theme) and "Your personal list manager" subtitle.

---

## Shopping Lists

### List Management
- **Only one active shopping list at a time** — create a new one to start fresh
- **Create**: Tap + on the Shopping tab (if no active list) or tap + from the summary view. Default shops from Settings auto-populate the new list
- **Summary view**: Shows all shops with remaining/total counts and circle badges (✓ if fully done)
- **Delete list**: Long-press the summary title (blocked if any shop has items)

### Shops
- **Add shop**: Tap + Add in the shop tabs row inside a list, or use `showAddShop` from summary
- **Duplicate detection**: Adding a shop with the same name (case-insensitive) is blocked
- **Delete shop**: Long-press a shop tab
  - Blocked if shop has items ("Delete all items first")
  - Blocked if shop is a default shop ("Remove from defaults first")
- **Default shops**: Shops configured in Settings auto-populate new lists. New defaults sync into your active list when added in Settings
  - Tapping +/- on a summary shop card adds/removes it from defaults (with confirmation alert)

### Items
- **Add**: Select a shop tab, type your item, press + or Enter
- **Duplicate detection**: Case-insensitive duplicate check within the current shop
- **Toggle**: Tap O to mark pending, ✓ to mark done
- **Delete completed**: Tap 🗑️ trash icon (appears only when at least one item is done)
- **Delete individual**: Tap ✕ button on any item
- **Edit**: Tap any item text to open inline rename modal
- **Summary bar**: Shows "X of Y items remaining" across all shops
- **Shop badges**: Each tab shows its remaining item count

### Deep Linking
- Opening a list with `activeTabId` param navigates directly to that shop tab
- Opening with `showAddShop: true` immediately opens the Add Shop modal

---

## Memos

### List Management
- **Create**: Tap + on the Memos tab, enter a title
- **Duplicate detection**: Case-insensitive title check (blocked)
- **Delete**: Long-press a memo card (blocked if it has items)
- **Card view**: Shows title, remaining count, and creation date

### Items (Notes)
- **Add**: Type and press Enter
- **Toggle**: Tap O / ✓ to mark complete
- **Inline title editing**: Tap the memo title to rename it
- **Edit notes**: Tap any note text to rename it
- **Delete**: Tap ✕ button on any note
- **Empty state**: "No notes yet"

---

## Todos

### List Management
- **Create**: Tap + on the Todos tab, enter a title
- **Duplicate detection**: Case-insensitive title check (blocked)
- **Delete**: Long-press a todo card (blocked if it has items)
- **Card view**: Shows title, remaining count, priority badges, and overdue badge

### Tasks
- **Add**: Type your task, press + or Enter
- **Due dates**: Tap the calendar button to pick an optional due date (today to 5 years out)
- **Priority**: Tap the flag icon to cycle: None → Low → Medium → High
- **Auto-sort**: Items with due dates appear first (earliest first), undated items last
- **Toggle**: Tap O / ✓ to mark tasks complete
- **Inline title editing**: Tap the todo list title to rename it
- **Edit tasks**: Tap any task to open a modal — change text, priority, and due date simultaneously
- **Delete**: Tap ✕ button on any task

### Card Priority Badges
Each todo card on the main list shows remaining counts by priority:
- **Red** badge = High priority
- **Yellow/Amber** badge = Medium priority
- **Green** badge = Low priority
- Only shown if count > 0 for that priority level

### Overdue Detection
- **Overdue badge**: ⚠️ icon with count, shown on todo cards when items are past due
- Overdue = due date is before the start of today (midnight), task is not done
- **Tappable**: Tap the overdue badge to open the list filtered to show only overdue items
  - The detail screen receives `filter: 'overdue'` and hides all non-overdue items
  - Filtered items are still sorted earliest-first by due date

### Notifications
Local notifications are scheduled when you create or edit a task with a due date. See the Notifications section below.

---

## Notifications

### Setup
- Notifications use `expo-notifications` with the `notifee` API
- Android notification channel created: "Todo Reminders" (HIGH importance, vibration, blue light)
- On Android 13+, `SCHEDULE_EXACT_ALARM` permission is requested for precise timing

### Scheduling
When you add or edit a todo with a due date, notifications are scheduled at configurable intervals:

| Interval | Offset |
|----------|--------|
| At due time | 0s |
| 1 day before | -86400s |
| 2 days before | -172800s |
| 1 week before | -604800s |

Each notification includes dynamic messaging based on how far away the due date is:
- "is due now" (≤ 0 seconds away)
- "is due tomorrow" (~1 day)
- "is due in X days" (2–6 days)
- "is due in 1 week" (7–13 days)
- "is due in X weeks" (14+ days)

### Cancellation
Notifications are automatically cancelled when:
- Toggling a task to done
- Deleting a task
- Editing a task's due date (old notifications cancelled, new ones scheduled)
- Saving an edit with no due date

### Permission
Android notification permission is requested once on first install.

---

## Settings (Prefs Tab)

Five sections:

### About
App name and version (1.0.0).

### Theme
Three themes:
- **Dark** — black background (#000), blue accent (#2E5A88)
- **Green** — dark green (#1A3D1A), leafy background image, blue accent
- **Light** — light gray (#f5f5f5), red accent (#dc2626)

The logo adapts: green theme uses `listAll_logo_green.png`, others use the standard logo.

### Todo Reminders
Checkboxes to enable/disable each of the 4 notification intervals.
- **Cannot deselect all**: if you uncheck every box, defaults are restored automatically

### Default Shops
Manage shops that auto-populate when creating a new shopping list.
- **Add**: Tap +, enter a name
- **Delete**: Long-press or tap ✕
- New defaults sync to your active shopping list immediately

### Info
Quick reference: multi-shop tabs, inline title editing, due dates & priorities, local storage.

---

## Navigation

- **Bottom tab bar**: Switch between Home, Shopping, Memos, Todos, and Prefs
- **Tab tap**: Instant switch (no scroll animation)
- **Swipe**: Horizontal swipe between tabs
- **Home button**: 🏠 in any header returns to Home
- **Back**: Swipe from screen edge or tap back button
- **Guide**: 📖 Home card or bottom-sheet link

---

## Tips & Edge Cases

### Gestures
- **Tap any card** → opens detail (shopping list, memo, todo)
- **Long-press card** → delete (with protection if it has items)
- **Long-press shop tab** → delete shop (with validation)
- **Tap title text** → inline rename on memo/todo detail screens
- **Tap item text** → inline edit modal on all detail screens
- **Tap overdue badge** → filtered view of only overdue todos

### Delete Protection
- Can't delete a shopping list shop if it has items
- Can't delete a default shop from inside a shopping list
- Can't delete a memo/todo list if it has items

### Empty States
- **Shopping (no list)**: "No Active Shopping List" with create prompt
- **Shopping (no shops)**: "Add your first shop"
- **Memos (no lists)**: 📝 icon + "No Memos Yet"
- **Todos (no lists)**: ✓ icon + create button
- **All detail screens**: "No items yet" / "No notes yet" / "No todos yet"

### Loading
- **DB initializing**: "Setting up database..."
- **DB error**: "Migration error: {message}"
- **List detail loading**: "Loading..."

### Buttons
- Buttons with empty text input are disabled (50% opacity)
- Create/Add buttons are disabled while a list is still loading

### Data
- All data stored in local SQLite database (`listAll.db`)
- Database auto-vacuumed on background to keep size small
- Data persists across app restarts
- UI refreshes automatically when you return to a tab (focus-effect)

### Notifications Behavior
- If a notification's trigger time is already in the past and offset is 0 (at-due-time), it fires immediately
- Notification schedule errors are caught silently (console.error) — they never block the UI
