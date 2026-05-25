# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

All data is stored locally on-device in a SQLite database. No data is transmitted
to external servers. If you discover a vulnerability related to local data storage,
privacy, or notification permissions, please open an issue at:

https://github.com/evariste1963/listAll/issues

We will respond within 5 business days with an assessment and timeline for a fix.

## Data Privacy

- **No data collection**: listAll does not collect, transmit, or share any user data.
- **Local-only storage**: All lists, todos, memos, and preferences are stored exclusively
  in a local SQLite database on your device.
- **No network access**: The app operates fully offline with no network permissions
  (except for optional notification scheduling).
- **Notifications**: Notification scheduling uses Android's local `AlarmManager` — no
  push notification servers or remote services are involved.

## Permissions

- **Notifications** (Android 13+): `SCHEDULE_EXACT_ALARM` is requested solely for
  precise local reminder timing. No notification data leaves the device.
