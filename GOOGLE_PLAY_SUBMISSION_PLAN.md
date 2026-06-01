# Google Play Submission Plan — listAll

Generated: 2026-06-01

---

## Overview

listAll is an Expo SDK 55 / React Native app using local SQLite (via `expo-sqlite` + Drizzle ORM). No backend, no cloud sync, no accounts, no analytics. Data stays entirely on-device.

---

## 1. Prerequisites

| Item | Cost | Notes |
|---|---|---|
| Google Play Developer account | $25 (one-time) | Personal account |
| Apple Developer account (iOS) | $99/yr | Separate submission — not covered here |
| Privacy policy URL | Free | Host on GitHub Pages, Netlify, or similar |
| Screenshots + graphics | Free (DIY) | Phone + tablet sizes |
| Closed testers (if new account) | $0-25 | 12+ testers for 14 days |

---

## 2. Account Setup

**Create account:** [play.google.com/console](https://play.google.com/console)

- Account type: **Personal**
- Payment: $25 one-time registration fee
- Since account is new (post-Nov 13, 2023): **Closed testing requirement applies**

**Required acknowledgments on first login:**
- [ ] Accept Developer Program Policies
- [ ] Accept US export laws
- [ ] Accept Play App Signing Terms of Service
- [ ] Set up 2-factor authentication (recommended)

---

## 3. Closed Testing Requirement (Critical)

**Applies because:** Personal account created after Nov 13, 2023.

Until this is satisfied, **Production and Pre-registration tracks are locked.**

### Timeline

| Step | Action | When |
|---|---|---|
| 1 | Upload AAB to **Closed Testing** track | Day 1 |
| 2 | Recruit **≥12 testers** (aim for 20-25 as buffer) | Days 1-3 |
| 3 | Testers opt in via Google Group, install app | Days 1-3 |
| 4 | Maintain ≥12 opted-in testers for **14 consecutive days** | Days 3-17 |
| 5 | Push at least 1 update during testing | Day ~7 |
| 6 | Collect feedback from testers | Throughout |
| 7 | Submit **Production Access Questionnaire** | Days 17-18 |
| 8 | Google reviews (1-7 days typical) | Days 18-25 |
| 9 | Production unlocked | Day 25+ |

### Key Rules

- If tester count drops **below 12** at any point, the 14-day clock **resets to zero**
- Testers must stay opted-in — no gaps
- Google evaluates tester engagement, not just headcount
- Internal testing does **not** count — must be Closed Testing track

### Tester Sources

- Friends/family (need Google account emails)
- Online services: PrimeTestLab (~$15-25)
- Dev communities: Reddit r/androiddev, Discord servers

---

## 4. Store Listing Metadata

| Field | Value |
|---|---|
| **App name** | listAll |
| **Short description** | ≤80 chars |
| **Full description** | ≤4000 chars |
| **Category** | Productivity |
| **Tags** | shopping list, memo, todo, notes, task manager |
| **Contact email** | [your email] |
| **Website** | [optional] |
| **Developer name** | [your name or company] |

### Required Graphics

| Asset | Size | Format |
|---|---|---|
| Phone screenshots | min 320px, max 3840px side | JPEG/PNG, 2-8 images |
| Tablet screenshots | same | same |
| Feature graphic | 1024×500 | PNG/JPEG |
| App icon | 512×512 | 32-bit PNG |
| Adaptive icon foreground | 1024×1024 (no alpha) | PNG |
| Adaptive icon background | 1024×1024 (no alpha) | PNG |

---

## 5. Privacy Policy

**Required even though app collects no data.** Must be on a public HTTPS URL (not a PDF, not geofenced). Link must appear in Play Console and optionally within the app.

### Suggested hosting: GitHub Pages

1. Create repo: `listall-privacy` (or use existing)
2. Enable GitHub Pages from a `docs/` folder or `gh-pages` branch
3. URL: `https://<username>.github.io/listall-privacy/`

### Content Outline

```
# Privacy Policy for listAll

Last updated: [date]

## Data Collection
This app does NOT collect, transmit, or share any personal data.
All user content (shopping lists, memos, todos, preferences) is stored
exclusively in a local SQLite database on your device.

## Network Access
The only network request the app makes is a user-initiated link preview
fetch — when you paste a URL into a memo item, the app retrieves Open
Graph metadata from that URL. No data is sent to any server we control.

## Third-Party SDKs
- expo-notifications transitively bundles Firebase Cloud Messaging (FCM).
  No Firebase project is configured. The SDK is inactive and does not
  transmit data.
- No analytics, crash reporting, or advertising SDKs are used.

## Data Retention & Deletion
All data remains on your device until you:
- Delete it within the app, or
- Clear app data via system settings, or
- Uninstall the app

## Children's Privacy
This app is not directed at children under 13. We do not knowingly
collect any data from children.

## Contact
Developer: [your name]
Email: [your email]
```

---

## 6. Data Safety Form (Play Console)

For listAll, the app collects **no user data**. Fill in Play Console as follows:

### Data Collection

| Data Type | Collected? | Shared? | Notes |
|---|---|---|---|
| Location | No | No | No location permissions |
| Personal info | No | No | No accounts, no names |
| Financial info | No | No | No payments |
| Health/fitness | No | No | — |
| Messages | No | No | — |
| Photos/videos | No (ephemeral) | No | Image picker — user selects locally, never uploaded |
| Audio files | No | No | — |
| Files and docs | No | No | SQLite DB local only |
| Calendar | No | No | — |
| App activity | No | No | No analytics |
| Web browsing | No | No | Link preview is user-initiated fetch, not browsing |
| App performance | No | No | No crash reporting |
| Device IDs | No | No | No Advertising ID usage |
| Contacts | No | No | — |

### Security Practices

| Question | Answer |
|---|---|
| Encryption in transit | N/A (no data transmitted by app) |
| Users can request data deletion | Yes — clear app data or uninstall |
| Independent security review | No |

### Other Declarations

| Question | Answer |
|---|---|
| Contains ads | No |
| Target audience | General (13+) — not primarily children |
| News app declaration | No |

---

## 7. Content Rating (IARC Questionnaire)

Complete in Play Console's App content page.

### Expected Answers

| Question | Answer |
|---|---|
| Violence / Gore | None |
| Sexual content | None |
| Inappropriate language | None |
| Tobacco / Drugs / Alcohol | None |
| Gambling | None / Not present |
| User-generated content | Users create personal lists — no public sharing, not social |
| Unrestricted web access | No (link preview is limited, user-supplied URL, not a browser) |
| Sharing location | No |
| In-app purchases | No |
| Digital rights | No |

Expected rating: **Everyone (3+)** or **Everyone 10+**

---

## 8. Permissions Declaration

| Permission | Purpose | Risk Level |
|---|---|---|
| `INTERNET` | Link preview fetch (user pastes URL) | Low |
| `READ_EXTERNAL_STORAGE` (maxSdkVersion=32) | Image picker — Android ≤12 | Low |
| `WRITE_EXTERNAL_STORAGE` (maxSdkVersion=32) | Image picker — Android ≤12 | Low |
| `POST_NOTIFICATIONS` | Local todo reminders (runtime perm) | Normal |
| `SCHEDULE_EXACT_ALARM` | Precise reminder timing | **May trigger extra review** |
| `RECEIVE_BOOT_COMPLETED` | Reschedule alarms after reboot | Normal |
| `VIBRATE` | Notification vibration | Normal |
| `WAKE_LOCK` | Wake device for notification | Normal |
| `FOREGROUND_SERVICE` | Notification delivery | Normal |
| `ACCESS_NETWORK_STATE` | Notification library | Low |
| `ACCESS_NOTIFICATION_POLICY` | Xiaomi heads-up notifications | Low |

**Action item:** `SCHEDULE_EXACT_ALARM` may require a Permissions Declaration Form in Play Console. Prepare a justification: "Used solely for user-requested local todo reminders via Android AlarmManager."

No SMS, Call Log, Location, or Contacts permissions — clean.

---

## 9. Build Requirements

| Requirement | Status |
|---|---|
| **Target API level** | Must target Android 15 (API 35) — enforced since Aug 31, 2025. Expo SDK 55 defaults to this ✅ |
| **Play App Signing** | Required for new apps — opt in during first upload |
| **App Bundle format** | Must use `.aab` (Android App Bundle), not `.apk` |
| **Max download size** | 200MB compressed for AAB — should be well under (Expo + SQLite ~20-50MB) |
| **Version code** | Max 2,100,000,000 |
| **Key validity** | Must expire after Oct 22, 2033 |

### EAS Build Config

Create `eas.json` in project root:

```json
{
  "cli": {
    "version": ">= 3.0"
  },
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Build Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build production AAB
eas build --platform android --profile production

# Upload to Play Console
eas submit --platform android --profile production
```

---

## 10. Complete Submission Order

### Phase 1 — Prep (Do Now)

- [ ] Create Play Console account ($25)
- [ ] Write privacy policy HTML, host at public URL
- [ ] Prepare screenshots (phone + tablet)
- [ ] Prepare app icon + feature graphic
- [ ] Create store listing (name, description, category)
- [ ] Create `eas.json` build config
- [ ] Update `app.json` with version/bundle info
- [ ] Recruit pool of 20-25 closed testers

### Phase 2 — Build & Closed Test

- [ ] Build production AAB: `eas build --platform android`
- [ ] Upload AAB to Internal Testing track first (smoke test)
- [ ] Verify permissions on real device
- [ ] Upload AAB to Closed Testing track
- [ ] Share opt-in link with testers
- [ ] Maintain ≥12 opted-in testers for 14 consecutive days
- [ ] Push at least 1 update during testing
- [ ] Collect tester feedback

### Phase 3 — Policy Declarations

- [ ] Complete Data Safety form (all local, no collection)
- [ ] Paste privacy policy URL in designated field
- [ ] Complete Content Rating (IARC) questionnaire
- [ ] Declare ads: No
- [ ] Declare target audience: 13+
- [ ] Complete Permissions Declaration (SCHEDULE_EXACT_ALARM justification)

### Phase 4 — Production Release

- [ ] Apply for Production Access (via Dashboard questionnaire)
  - Answers must describe testing process, feedback received, improvements made
- [ ] Wait for Google review (1-7 days typical)
- [ ] Once approved: Create production release
- [ ] Submit for final review (1-7 days)
- [ ] App live on Google Play

---

## 11. Future Considerations

| Feature | Impact |
|---|---|
| **Cloud sync** | Would change Data Safety entirely — need server, account system, privacy policy rewrite |
| **Analytics/crash reporting** | Adding Firebase, Sentry, etc. requires updating Data Safety form |
| **Ads** | Would require updating Data Safety + Content Rating |
| **iOS App Store** | Separate submission process, different requirements |
