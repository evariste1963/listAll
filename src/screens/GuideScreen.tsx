import React from 'react';
import { Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ThemedBackground } from '../styles/theme';
import { createThemedStyles } from '../styles/global';

function SectionTitle({ children, color, s }: { children: string; color: string; s: ReturnType<typeof createThemedStyles> }) {
  return <Text style={[s.guideSectionTitle, { color }]}>{children}</Text>;
}

function BulletItem({ text, color, s }: { text: string; color: string; s: ReturnType<typeof createThemedStyles> }) {
  return <Text style={[s.guideBullet, { color }]}>{'•  '}{text}</Text>;
}

function SubBulletItem({ text, color, s }: { text: string; color: string; s: ReturnType<typeof createThemedStyles> }) {
  return <Text style={[s.guideBullet, { color, marginLeft: 16 }]}>{'  ◦ '}{text}</Text>;
}

export default function GuideScreen() {
  const { colors } = useTheme();
  const s = createThemedStyles(colors);

  return (
    <ThemedBackground colors={colors}>
      <SafeAreaView style={s.guideContainer} edges={['left', 'right', 'bottom']}>
        <ScrollView style={s.guideScrollView} contentContainerStyle={s.guideContent}>
          <Text style={[s.guideMainTitle, { color: colors.primaryText }]}>listAll</Text>
          <Text style={[s.guideIntro, { color: colors.secondaryText }]}>
            Personal list manager: Shopping, Memos, Todos. All data stored locally on your device.
          </Text>

          <SectionTitle color={colors.accentColor} s={s}>Home Dashboard</SectionTitle>
          <BulletItem color={colors.primaryText} s={s} text="5 navigation cards: Shopping, Memos, Todos, Preferences, Guide" />
          <BulletItem color={colors.primaryText} s={s} text="Logo + subtitle header, theme-adaptive logo" />
          <BulletItem color={colors.primaryText} s={s} text="Tap any card to jump to that section" />

          <SectionTitle color={colors.accentColor} s={s}>Shopping Lists</SectionTitle>
          <BulletItem color={colors.primaryText} s={s} text="Only one active shopping list at a time" />
          <BulletItem color={colors.primaryText} s={s} text="Create: Tap +, default shops auto-populate from Settings" />
          <BulletItem color={colors.primaryText} s={s} text="Delete list: Long-press summary title (blocked if shops have items)" />
          <BulletItem color={colors.primaryText} s={s} text="Summary view: shop cards with remaining/total counts, done badges" />
          <BulletItem color={colors.primaryText} s={s} text="Shops: Add via + Add, long-press to delete (validated)" />
          <BulletItem color={colors.primaryText} s={s} text="Duplicate shop/items: Case-insensitive blocked" />
          <BulletItem color={colors.primaryText} s={s} text="Items: Add, toggle O/✓, tap to rename, ✕ to delete" />
          <BulletItem color={colors.primaryText} s={s} text="Delete completed: 🗑️ button (appears when items done)" />
          <BulletItem color={colors.primaryText} s={s} text="Summary bar: shop item counts across all tabs" />
          <BulletItem color={colors.primaryText} s={s} text="Default shop sync: +/− on shop card adds/removes from defaults" />
          <BulletItem color={colors.primaryText} s={s} text="Deep links: activeTabId and showAddShop route params" />

          <SectionTitle color={colors.accentColor} s={s}>Memos</SectionTitle>
          <BulletItem color={colors.primaryText} s={s} text="Create from + button, duplicate title blocked" />
          <BulletItem color={colors.primaryText} s={s} text="Add lines via text input + Enter" />
          <BulletItem color={colors.primaryText} s={s} text="Toggle O/✓, edit title inline, tap text to rename" />
          <BulletItem color={colors.primaryText} s={s} text="Delete long-press card (blocked if has items), ✕ on lines" />
          <BulletItem color={colors.primaryText} s={s} text="Card view shows title, remaining count, creation date" />

          <SectionTitle color={colors.accentColor} s={s}>Todos</SectionTitle>
          <BulletItem color={colors.primaryText} s={s} text="Create from + button, duplicate title blocked" />
          <BulletItem color={colors.primaryText} s={s} text="Add tasks with text + Enter" />
          <BulletItem color={colors.primaryText} s={s} text="Due dates: calendar picker (today to 5 years)" />
          <BulletItem color={colors.primaryText} s={s} text="Priority: cycle None → Low → Medium → High" />
          <BulletItem color={colors.primaryText} s={s} text="Auto-sort: due dates first (earliest first), undated last" />
          <BulletItem color={colors.primaryText} s={s} text="Toggle O/✓, edit title inline, tap task to edit text/priority/date" />
          <BulletItem color={colors.primaryText} s={s} text="Delete long-press card (blocked if has items), ✕ on tasks" />
          <BulletItem color={colors.primaryText} s={s} text="Priority badges on cards: red=high, yellow=medium, green=low" />
          <BulletItem color={colors.primaryText} s={s} text="Overdue badge: ⚠️ count for past-due undone tasks" />
          <BulletItem color={colors.primaryText} s={s} text="Tap overdue badge: opens filtered view showing only overdue items" />
          <BulletItem color={colors.primaryText} s={s} text="Overdue = due date before start of today, task not done" />

          <SectionTitle color={colors.accentColor} s={s}>Notifications</SectionTitle>
          <BulletItem color={colors.primaryText} s={s} text="Local notifications for todos with due dates" />
          <BulletItem color={colors.primaryText} s={s} text="4 configurable intervals: at due, 1 day, 2 days, 1 week before" />
          <BulletItem color={colors.primaryText} s={s} text="Dynamic messages: due now / tomorrow / in X days / in X weeks" />
          <BulletItem color={colors.primaryText} s={s} text="Auto-cancelled on done, delete, or due date change" />
          <BulletItem color={colors.primaryText} s={s} text="Permissions: requested once on Android 13+" />

          <SectionTitle color={colors.accentColor} s={s}>Settings (Prefs)</SectionTitle>
          <BulletItem color={colors.primaryText} s={s} text="Theme: Dark, Green (leafy background), Light" />
          <BulletItem color={colors.primaryText} s={s} text="Todo reminders: enable/disable each interval (can't deselect all)" />
          <BulletItem color={colors.primaryText} s={s} text="Default shops: add/remove shops that auto-populate new lists" />
          <BulletItem color={colors.primaryText} s={s} text="New defaults sync to active shopping list automatically" />

          <SectionTitle color={colors.accentColor} s={s}>Navigation</SectionTitle>
          <BulletItem color={colors.primaryText} s={s} text="Bottom tabs: Home, Shopping, Memos, Todos, Prefs" />
          <BulletItem color={colors.primaryText} s={s} text="Swipe horizontally or tap tabs to switch" />
          <BulletItem color={colors.primaryText} s={s} text="🏠 header button returns to Home" />
          <BulletItem color={colors.primaryText} s={s} text="Swipe back or tap back button on detail screens" />

          <SectionTitle color={colors.accentColor} s={s}>Edge Cases</SectionTitle>
          <BulletItem color={colors.primaryText} s={s} text="Delete blocked if list/shop has items" />
          <BulletItem color={colors.primaryText} s={s} text="Duplicate names blocked (case-insensitive) everywhere" />
          <BulletItem color={colors.primaryText} s={s} text="Empty states shown per list type" />
          <BulletItem color={colors.primaryText} s={s} text="Buttons disabled when input empty or data loading" />
          <BulletItem color={colors.primaryText} s={s} text="DB auto-vacuumed on background" />
          <BulletItem color={colors.primaryText} s={s} text="Notification errors caught silently (never block UI)" />
          <BulletItem color={colors.primaryText} s={s} text="All data persists in local SQLite, survives restarts" />

          <Text style={[s.guideBullet, { color: colors.mutedText, textAlign: 'center', marginTop: 32 }]}>
            coded by this.me
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ThemedBackground>
  );
}
