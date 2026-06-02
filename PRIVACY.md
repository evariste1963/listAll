# Privacy Policy

**Last updated: June 2, 2026**

## Data Collection

listAll does **not** collect, transmit, or share any personal data. The app operates fully offline.

## Local Storage

All data — shopping lists, memos, todos, notes, preferences, and settings — is stored exclusively in a local SQLite database on your device. No data ever leaves your device.

## Network Access

listAll has no internet permission and makes no network requests. Link preview fetching in Memos is the only feature that can access a URL, and it does so only when you explicitly paste a link and confirm the preview. No data from this action is transmitted anywhere beyond the fetch itself.

## Third-Party Services

listAll does not integrate any analytics, crash reporting, advertising, or third-party SDKs that collect data.

## Notifications

Optional reminder notifications use Android's local `AlarmManager` (or iOS equivalent). No push notification servers or remote services are involved. Notification data is generated and stored entirely on-device.

## Permissions

- **Notifications** (Android 13+): `SCHEDULE_EXACT_ALARM` is used solely for precise local reminder timing.
- **Media / Images** (optional): If you attach an image to a memo, the app requests read access to your photo library. Images are copied locally to the app's document directory. The original file is never uploaded or transmitted.

## Children's Privacy

listAll does not knowingly collect any data from children under 13. Since no data is collected, no special provisions are required.

## Changes to This Policy

If this policy changes, the "Last updated" date at the top will be revised. Continued use of the app after changes constitutes acceptance of the updated policy.

## Contact

For questions about this privacy policy, open an issue at:

https://github.com/evariste1963/listAll/issues
