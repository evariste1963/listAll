import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
  AlarmType,
} from 'react-native-notify-kit';
import { Platform, PermissionsAndroid } from 'react-native';

export interface NotificationInterval {
  label: string;
  seconds: number;
}

export const AVAILABLE_INTERVALS: NotificationInterval[] = [
  { label: 'At due time', seconds: 0 },
  { label: '1 day before', seconds: -86400 },
  { label: '2 days before', seconds: -172800 },
  { label: '1 week before', seconds: -604800 },
];

export const DEFAULT_INTERVALS: number[] = [0, -86400, -172800, -604800];

function getDueMessage(secondsUntil: number): string {
  const daysUntil = Math.round(secondsUntil / 86400);
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
}

export async function scheduleTodoNotifications(
  todoId: number,
  title: string,
  dueDateTimestamp: number,
  intervalSeconds: number[]
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
    const dueDateMs = dueDateTimestamp;
    const nowMs = Date.now();

    for (const offset of intervalSeconds) {
      const triggerMs = dueDateMs + offset * 1000;
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

      const secondsUntil = Math.round((triggerMs - nowMs) / 1000);
      const body = `"${title}" ${getDueMessage(secondsUntil)}`;

      console.log(`[Notifications] Scheduling "${body}" in ${secondsUntil}s`);

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerMs,
        alarmManager: {
          type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
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
