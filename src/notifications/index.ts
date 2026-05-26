import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
  AlarmType,
} from 'react-native-notify-kit';
import { Platform, PermissionsAndroid } from 'react-native';

export interface NotificationInterval {
  label: string;
  days: number;
}

export const AVAILABLE_INTERVALS: NotificationInterval[] = [
  { label: 'On due date', days: 0 },
  { label: '1 day before', days: -1 },
  { label: '2 days before', days: -2 },
  { label: '1 week before', days: -7 },
];

export const DEFAULT_INTERVALS: number[] = [0, -1, -2, -7];

const MS_IN_DAY = 86_400_000;
const ANDROID_API_31 = 31;

function getDueMessage(daysUntil: number): string {
  if (daysUntil <= 0) return 'is due now';
  if (daysUntil === 1) return 'is due tomorrow';
  if (daysUntil < 7) return `is due in ${daysUntil} days`;
  const weeksUntil = Math.round(daysUntil / 7);
  if (weeksUntil === 1) return 'is due in 1 week';
  return `is due in ${weeksUntil} weeks`;
}

async function createDefaultChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Todo Reminders',
    importance: AndroidImportance.HIGH,
    vibration: true,
    lights: true,
    lightColor: '#2E5A88',
  });
}

async function requestNotificationPermissions() {
  await notifee.requestPermission();

  if (Platform.OS === 'android' && Platform.Version >= ANDROID_API_31) {
    try {
      const granted = await PermissionsAndroid.request(
        'android.permission.SCHEDULE_EXACT_ALARM' as any,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('[Notifications] SCHEDULE_EXACT_ALARM not granted');
      }
    } catch (e) {
      console.error('[Notifications] Error requesting exact alarm permission:', e);
    }
  }
}

async function fireMissedTriggers() {
  try {
    const triggers = await notifee.getTriggerNotifications();
    for (const t of triggers) {
      if (t.trigger.type === TriggerType.TIMESTAMP && t.trigger.timestamp <= Date.now()) {
        console.log(`[Notifications] Firing missed trigger: "${t.notification.title}"`);
        await notifee.displayNotification(t.notification);
        if (t.notification.id) {
          await notifee.cancelTriggerNotification(t.notification.id);
        }
      }
    }
  } catch {
    // Silently fail - missed triggers will be handled next app launch
  }
}

export async function initNotifications() {
  await createDefaultChannel();
  await requestNotificationPermissions();
  await fireMissedTriggers();
}

async function cancelNotificationsForTodo(todoId: number): Promise<void> {
  const existing = await notifee.getTriggerNotifications();
  const todoIdStr = String(todoId);
  for (const n of existing) {
    const dataTodoId = n.notification.data?.todoId;
    if (String(dataTodoId) === todoIdStr && n.notification.id) {
      await notifee.cancelTriggerNotification(n.notification.id);
    }
  }
}

function buildNotifPayload(
  todoIdStr: string,
  body: string,
  listName?: string,
  id?: string,
) {
  return {
    ...(id && { id }),
    title: listName ?? 'Todo Reminder',
    body,
    data: { todoId: todoIdStr },
    android: {
      channelId: 'default',
      pressAction: { id: 'default' },
    },
  };
}

export async function scheduleTodoNotifications(
  todoId: number,
  title: string,
  dueDateTimestamp: number,
  intervalDays: number[],
  listName?: string
): Promise<string[]> {
  try {
    await cancelNotificationsForTodo(todoId);

    const todoIdStr = String(todoId);
    const ids: string[] = [];

    const dueDate = new Date(dueDateTimestamp);
    dueDate.setHours(0, 0, 0, 0);
    const dueMidnightMs = dueDate.getTime();
    const nowMs = Date.now();

    const now = new Date();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    nowMidnight.setHours(0, 0, 0, 0);
    const actualDaysUntilDue = Math.round((dueMidnightMs - nowMidnight.getTime()) / MS_IN_DAY);

    // Phase 1: fire immediate notification for the most relevant past offset
    for (const offset of intervalDays) {
      const triggerMs = dueMidnightMs + offset * MS_IN_DAY;
      if (triggerMs <= nowMs) {
        if (offset === 0) {
          const body = `"${title}" is due now`;
          console.log(`[Notifications] Displaying immediate "${body}"`);
          await notifee.displayNotification(buildNotifPayload(todoIdStr, body, listName));
          ids.push(`immediate-${todoIdStr}`);
          break;
        } else if (actualDaysUntilDue > 0 && -offset >= actualDaysUntilDue) {
          const body = `"${title}" ${getDueMessage(actualDaysUntilDue)}`;
          console.log(`[Notifications] Displaying immediate "${body}"`);
          await notifee.displayNotification(buildNotifPayload(todoIdStr, body, listName));
          ids.push(`immediate-${todoIdStr}-${offset}`);
          break;
        }
      }
    }

    // Phase 2: schedule future notifications
    for (const offset of intervalDays) {
      const triggerMs = dueMidnightMs + offset * MS_IN_DAY;
      if (triggerMs > nowMs) {
        const daysUntil = -offset;
        const body = `"${title}" ${getDueMessage(daysUntil)}`;
        console.log(`[Notifications] Scheduling "${body}"`);

        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerMs,
          alarmManager: {
            type: AlarmType.SET_ALARM_CLOCK,
          },
        };

        const id = await notifee.createTriggerNotification(
          buildNotifPayload(todoIdStr, body, listName, `todo-${todoIdStr}-${offset}`),
          trigger,
        );
        ids.push(id);
      }
    }

    return ids;
  } catch (e) {
    console.error('[Notifications] Error:', e);
    return [];
  }
}

export async function cancelTodoNotifications(todoId: number) {
  try {
    await cancelNotificationsForTodo(todoId);
  } catch {
    // Silently fail
  }
}
