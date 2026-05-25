# listAll

A personal list manager for Android with Shopping Lists, Memos, and Todos. Built with Expo (React Native) and SQLite.

## Tech Stack

- **Framework**: Expo SDK 55 (React Native)
- **Language**: TypeScript
- **Database**: expo-sqlite + Drizzle ORM
- **Navigation**: React Navigation (Native Stack + swipeable tabs)
- **Notifications**: react-native-notify-kit (Android AlarmManager)

## Features

### Shopping Lists

- **Single active list** at a time — creating a new one starts fresh
- **Multi-shop tabs** within a list (e.g., Walmart, Target)
- **Default shops** configured in Settings auto-populate new lists
- **Duplicate detection** (case-insensitive) for shops and items
- Per-shop remaining item counts, summary bar across all shops
- Inline rename for shops and items
- Delete completed items in bulk

### Memos

- Create multiple memo lists
- Notes with optional checkable mode
- Inline title editing
- Remaining count, creation date display

### Todos

- Create multiple todo lists
- **Due dates**: Optional date picker (today to 5 years out)
- **Priority levels**: Low, Medium, High (color-coded badges)
- **Auto-sort**: Task with earliest due dates first, undated last
- **Overdue detection**: ⚠️ badge with count on todo list cards
- **Overdue filter**: Tap the badge to view only overdue items
- **Notifications**: Local reminders at configurable intervals
- Task count by priority level displayed on list cards

### Notifications

Scheduled when you create or edit a todo with a due date. Configurable intervals:

| Interval | When it fires |
|----------|---------------|
| On due date | At midnight on the due date |
| 1 day before | 1 day before due date |
| 2 days before | 2 days before due date |
| 1 week before | 7 days before due date |

Notification messages are dynamic based on remaining time:
- "is due now" — due date is today or past
- "is due tomorrow" — 1 day remaining
- "is due in X days" — 2–6 days remaining
- "is due in 1 week" — 7–13 days remaining
- "is due in X weeks" — 14+ days remaining

Notifications auto-cancel when:
- Task is marked done
- Task is deleted
- Due date is changed or removed

On Android 13+, `SCHEDULE_EXACT_ALARM` permission is requested for precise timing.

### Themes

Three themes available in Preferences:
- **Dark** (#000 background, blue accent) — default
- **Green** (#1A3D1A background, leafy wallpaper, blue accent)
- **Light** (#f5f5f5 background, red accent)

### Navigation

- Horizontal swipeable tabs between Home, Shopping, Memos, Todos, Prefs
- Tap tabs or swipe to switch
- Home button in headers returns to dashboard

## Data

- All data stored locally in SQLite (`listAll.db`)
- Data persists across restarts
- UI refreshes automatically on focus
- Database auto-vacuumed on background (debounced)

## Getting Started

```bash
# Install dependencies
npm install

# Start Metro bundler
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

### Build APK

```bash
npx expo prebuild --clean
cd android
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

Install via ADB:

```bash
adb install -r android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

## Project Structure

```
listAll/
├── App.tsx                    # Entry point, providers, navigation
├── SwipeableTabs.tsx          # Bottom tab bar with horizontal swipe
├── src/
│   ├── db/                    # SQLite schema, migrations, provider
│   │   ├── schema.ts          # Drizzle table definitions
│   │   ├── index.ts           # Database initialization
│   │   ├── provider.tsx       # React context provider
│   │   └── migrations.ts      # Schema migrations
│   ├── screens/               # All screen components
│   │   ├── HomeTabScreen.tsx
│   │   ├── ShoppingTabScreen.tsx
│   │   ├── ShoppingDetailScreen.tsx
│   │   ├── MemosTabScreen.tsx
│   │   ├── MemoDetailScreen.tsx
│   │   ├── TodosTabScreen.tsx
│   │   ├── TodoDetailScreen.tsx
│   │   ├── PreferencesTabScreen.tsx
│   │   ├── GuideScreen.tsx
│   │   ├── CreateMemoListScreen.tsx
│   │   └── CreateTodoListScreen.tsx
│   ├── notifications/         # Local notification scheduling
│   ├── preferences/           # User preferences provider
│   ├── styles/                # Themes and shared styles
│   └── navigation/            # Navigation type definitions
├── assets/                    # Images, icons, fonts
├── plugins/                   # Expo config plugins
└── app.json                   # Expo configuration
```
