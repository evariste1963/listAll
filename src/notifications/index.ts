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

function getDueMessage(daysUntil: number): string {
  if (daysUntil <= 0) return 'is due now';
  if (daysUntil === 1) return 'is due tomorrow';
  if (daysUntil < 7) return `is due in ${daysUntil} days`;
  const weeksUntil = Math.round(daysUntil / 7);
  if (weeksUntil === 1) return 'is due in 1 week';
  return `is due in ${weeksUntil} weeks`;
}

export async function initNotifications() {
  await notifee.createChannel({
    id: 'default',
    name: 'Todo Reminders',
    importance: AndroidImportance.HIGH,
    vibration: true,
    lights: true,
    lightColor: '#2E5A88',
  });

  await notifee.requestPermission();

  if (Platform.OS === 'android' && Platform.Version >= 31) {
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

  // Fire any scheduled notifications whose trigger time has passed (missed triggers)
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

export async function scheduleTodoNotifications(
  todoId: number,
  title: string,
  dueDateTimestamp: number,
  intervalDays: number[]
): Promise<string[]> {
  try {
    const existing = await notifee.getTriggerNotifications();
    const todoIdStr = String(todoId);
    for (const n of existing) {
      const dataTodoId = n.notification.data?.todoId;
      if (String(dataTodoId) === todoIdStr && n.notification.id) {
        await notifee.cancelTriggerNotification(n.notification.id);
      }
    }

    const ids: string[] = [];
    const dueDate = new Date(dueDateTimestamp);
    dueDate.setHours(0, 0, 0, 0);
    const midnightMs = dueDate.getTime();
    const nowMs = Date.now();

    for (const offset of intervalDays) {
      const triggerMs = midnightMs + offset * 86400000;
      if (triggerMs <= nowMs) {
        if (offset === 0) {
          console.log(`[Notifications] Displaying immediate "${title}" is due now`);
          await notifee.displayNotification({
            title: 'Todo Reminder',
            body: `"${title}" is due now`,
            data: { todoId: todoIdStr },
            android: {
              channelId: 'default',
              pressAction: { id: 'default' },
            },
          });
          ids.push(`immediate-${todoIdStr}`);
        }
        continue;
      }

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
        {
          id: `todo-${todoIdStr}-${offset}`,
          title: 'Todo Reminder',
          body,
          data: { todoId: todoIdStr },
          android: {
            channelId: 'default',
            pressAction: { id: 'default' },
          },
        },
        trigger,
      );
      ids.push(id);
    }

    return ids;
  } catch (e) {
    console.error('[Notifications] Error:', e);
    return [];
  }
}

export async function cancelTodoNotifications(todoId: number) {
  try {
    const existing = await notifee.getTriggerNotifications();
    const todoIdStr = String(todoId);
    for (const n of existing) {
      const dataTodoId = n.notification.data?.todoId;
      if (String(dataTodoId) === todoIdStr && n.notification.id) {
        await notifee.cancelTriggerNotification(n.notification.id);
      }
    }
  } catch {
    // Silently fail
  }
}
