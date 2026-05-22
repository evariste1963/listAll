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

## Build & Installation

### Prerequisites
- Node.js 18+
- Android SDK (for Android builds)
- Java 17+

### Development

```bash
# Install dependencies
cd listAll
npm install

# Start Metro bundler
npx expo start

# Run on Android
npx expo run:android
```

### Build APK

**Debug Build:**
```bash
cd android
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

**Release Build:**
```bash
cd android
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk
#         app/build/outputs/apk/release/app-armeabi-v7a-release.apk
#         app/build/outputs/apk/release/app-arm64-v8a-release.apk
#         app/build/outputs/apk/release/app-x86-release.apk
#         app/build/outputs/apk/release/app-x86_64-release.apk
```

### Build Optimizations

**ABI Splits:**
- Splits the APK into architecture-specific variants (armeabi-v7a, arm64-v8a, x86, x86_64)
- Each APK is smaller since it only includes native code for one architecture
- Universal APK (all architectures) is also generated
- Configured in `android/app/build.gradle` under `splits.abi`

**R8 Minification:**
- Enabled by default for release builds
- Strips unused code, obfuscates names, optimizes DEX
- Can be disabled in `gradle.properties`: `android.enableMinifyInReleaseBuilds=false`
- Add custom ProGuard rules in `android/app/proguard-rules.pro` if needed

### Install on Device

**Method 1: ADB (USB debugging)**
```bash
# Enable USB debugging on device: Settings > Developer Options > USB debugging

# List connected devices
adb devices

# Install debug APK
adb install app/build/outputs/apk/debug/app-debug.apk

# Install release APK
adb install app/build/outputs/apk/release/app-release.apk

# Install specific ABI APK (smaller size)
adb install app/build/outputs/apk/release/app-arm64-v8a-release.apk

# Reinstall (overwrite existing)
adb install -r app/build/outputs/apk/release/app-release.apk
```

**Method 2: Manual Transfer**
- Copy the APK file to your device
- Open file manager, tap the APK
- Enable "Install from unknown sources" if prompted

### Release Signing
The release build is configured with a default keystore. For production:
1. Generate your own keystore:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore myapp.keystore -alias myapp -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Update `android/app/build.gradle` with your keystore details

### check current scheduled notifications
adb shell dumpsys alarm | grep "Alarm{.*listAll}" | grep -oP 'origWhen \K[0-9]+' | while read ts; do python3 -c "import datetime; dt=datetime.datetime.fromtimestamp($ts/1000, tz=datetime.timezone.utc); print(dt.strftime('%Y-%m-%d %H:%M UTC'))"; done | sort | uniq -c

## Clone & Build on Fresh Machine

`android/` is gitignored — regenerated by `npx expo prebuild`. A config plugin (`plugins/withAndroidBuildOptimizations.js`) auto-applies build optimizations during prebuild so no manual edits to `android/` are needed.

```bash
# 1. Clone
git clone <repo-url> listAll
cd listAll

# 2. Install dependencies
npm install

# 3. Regenerate native projects (applies config plugin)
npx expo prebuild --clean

# 4. Build release APK (arm64-v8a only, minified, shrunk)
cd android
./gradlew assembleRelease

# Output:
#   app/build/outputs/apk/release/app-arm64-v8a-release.apk

# 5. Install on device
adb install -r android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

**What the config plugin does automatically:**
- Sets `reactNativeArchitectures=arm64-v8a` (single ABI)
- Enables R8 minification, resource shrinking, JS bundle compression
- Adds ABI splits block for arm64-v8a
- Disables unused GIF/WebP image format support

## Moving android/ to Another Machine

You can copy the `android/` directory to another PC with the same project source and get a functionally identical build. Some caveats:

**What works:**
- `android/` is a self-contained Gradle project with all build configs, manifests, and dependencies baked in by the config plugin during `expo prebuild`
- Same `./gradlew assembleRelease` with same source input → practically same APK output

**Gotchas:**
- **local.properties**: Machine-specific SDK/NDK paths. Delete before copying if it exists. `ANDROID_HOME` env var handles this.
- **.gradle/cache**: Downloaded artifacts with machine-specific paths. Delete `android/.gradle/` before copying — it will redownload on first build.
- **Java version**: Must match (JDK 17+). Different versions can cause build failures or different bytecode.
- **Android SDK/NDK**: Target PC needs compileSdk 36, NDK 27.1.12297006 (matching `android/app/build.gradle` and `android/gradle.properties`).

**Recommended procedure:**
1. Delete `android/.gradle/` before copying
2. Delete `android/local.properties` if present
3. On target PC, set `ANDROID_HOME` and `JAVA_HOME` to correct paths
4. Run `cd android && ./gradlew assembleRelease` — missing dependencies download automatically

