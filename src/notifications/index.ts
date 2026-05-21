import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
  AlarmType,
} from 'react-native-notify-kit';
import { Platform } from 'react-native';

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
      if (String(dataTodoId) === todoIdStr) {
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
      if (String(dataTodoId) === todoIdStr) {
        await notifee.cancelTriggerNotification(n.notification.id);
      }
    }
  } catch {
    // Silently fail
  }
}

export async function checkMissedNotifications() {
  if (Platform.OS !== 'android') return;

  try {
    const existing = await notifee.getTriggerNotifications();
    const nowMs = Date.now();

    for (const n of existing) {
      const trigger = n.notification.android?.trigger;
      if (trigger && trigger.type === TriggerType.TIMESTAMP && trigger.timestamp) {
        const triggerMs = trigger.timestamp;
        if (triggerMs <= nowMs) {
          const body = n.notification.body || '';
          console.log(`[Notifications] Missed notification: ${body}`);

          await notifee.displayNotification({
            title: n.notification.title || 'Todo Reminder',
            body,
            data: n.notification.data,
            android: {
              channelId: 'default',
              pressAction: { id: 'default' },
            },
          });

          await notifee.cancelTriggerNotification(n.notification.id);
        }
      }
    }
  } catch (e) {
    console.error('[Notifications] Error checking missed notifications:', e);
  }
}

export async function checkBatteryOptimization() {
  if (Platform.OS !== 'android') return false;

  try {
    const enabled = await notifee.isBatteryOptimizationEnabled();
    return enabled;
  } catch {
    return false;
  }
}

export async function openBatteryOptimizationSettings() {
  if (Platform.OS !== 'android') return;

  try {
    await notifee.openBatteryOptimizationSettings();
  } catch {
    console.error('[Notifications] Failed to open battery optimization settings');
  }
}
