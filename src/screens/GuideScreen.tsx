import React from 'react';
import { Text, ScrollView, View, Image, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ThemedBackground } from '../styles/theme';
import { createThemedStyles } from '../styles/global';
import { APP_VERSION } from '../config';

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 10 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.3 }} />
      <Text style={{ fontSize: 15, fontWeight: '600', color, marginHorizontal: 12, letterSpacing: 0.5 }}>
        {title.toUpperCase()}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.3 }} />
    </View>
  );
}

function FeatureCard({ icon, title, desc, colors, iconColor, titleColor, descColor }: { icon: string; title: string; desc: string; colors: any; iconColor?: string; titleColor?: string; descColor?: string }) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginBottom: 6,
      backgroundColor: colors.cardBackground,
      borderRadius: 10,
    }}>
      <Text style={{ fontSize: 18, marginRight: 12, marginTop: 1, color: iconColor }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: titleColor || colors.primaryText, marginBottom: 2 }}>{title}</Text>
        <Text style={{ fontSize: 13, lineHeight: 18, color: descColor || colors.secondaryText }}>{desc}</Text>
      </View>
    </View>
  );
}

export default function GuideScreen() {
  const { colors } = useTheme();
  const s = createThemedStyles(colors);

  return (
    <ThemedBackground colors={colors}>
      <SafeAreaView style={s.guideContainer} edges={['left', 'right', 'bottom']}>
        <ScrollView style={s.guideScrollView} contentContainerStyle={s.guideContent}>

          <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
            <Image source={colors.logoAsset} style={{ width: 120, height: 120 }} resizeMode="contain" />
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.primaryText, marginTop: 8 }}>Guide</Text>
            <Text style={{ fontSize: 12, color: colors.tertiaryText, letterSpacing: 0.3, marginTop: 2 }}>Version {APP_VERSION}</Text>
          </View>

          <SectionHeader title="Getting Started" color={colors.accentColor} />

          <FeatureCard icon="🏠" title="Home Dashboard" desc="Navigation hub with cards for Shopping, Memos, Todos, Preferences, and this Guide." colors={colors} />
          <FeatureCard icon="🛒" title="Shopping" desc="Create one active shopping list with multiple shop tabs. Auto-populate from default shops in Settings. Track remaining items per shop." colors={colors} />
          <FeatureCard icon="📝" title="Memos" desc="Create multiple memo lists with checkable or plain notes. Inline editing for titles and items." colors={colors} />
          <FeatureCard icon="✓" title="Todos" desc="Full task management with due dates, priority levels (Low/Med/High), auto-sort by date, and local notification reminders." colors={colors} iconColor={colors.todoIconBg} />
          <FeatureCard icon="⚙️" title="Preferences" desc="Three themes (Dark, Green, Light). Configure notification intervals. Manage default shops." colors={colors} />
          <FeatureCard icon="📖" title="Guide" desc="This page — a reference for all app features and behavior." colors={colors} />

          <SectionHeader title="Shopping" color={colors.accentColor} />

          <FeatureCard icon="➕" title="Create a List" desc="Tap + on the Shopping tab. Default shops from Settings are added automatically." colors={colors} />
          <FeatureCard icon="🏪" title="Shop Tabs" desc="Add shops inside a list. Each shop has its own item list. Tap a shop tab to switch." colors={colors} />
          <FeatureCard icon="🗑️" title="Delete a Shop" desc="Long-press a shop tab. Blocked if the shop has items or is a default shop." colors={colors} />
          <FeatureCard icon="📋" title="Items" desc="Add items, toggle done with O/✓, tap to rename, ✕ to delete. Delete completed items in bulk." colors={colors} />
          <FeatureCard icon="⭐" title="Default Shops" desc="Configure in Settings. Tap +/− on a shop card in the summary to add/remove from defaults. New defaults sync to your active list." colors={colors} />
          <FeatureCard icon="🚫" title="Duplicate Prevention" desc="Shop names and item names are checked case-insensitively. Duplicates are blocked." colors={colors} />

          <SectionHeader title="Todos" color={colors.accentColor} />

          <FeatureCard icon="📅" title="Due Dates" desc="Optional date picker when adding or editing a task. Range: today to 5 years out." colors={colors} />
          <FeatureCard icon="🚩" title="Priority" desc="Cycle through None → Low → Medium → High. Color-coded badges on the list view." colors={colors} />
          <FeatureCard icon="🔔" title="Notifications" desc="4 configurable intervals: at due date, 1 day before, 2 days before, 1 week before. Messages adapt (due now/tomorrow/in X days/in X weeks). Notifications auto-cancel when toggled done or deleted." colors={colors} />
          <FeatureCard icon="⚠️" title="Overdue Detection" desc="Lists show an overdue badge with count. Tap it to filter and view only overdue items." colors={colors} />
          <FeatureCard icon="↕️" title="Auto-Sort" desc="Tasks with due dates appear first (earliest first), undated tasks last." colors={colors} />

          <SectionHeader title="Memos" color={colors.accentColor} />

          <FeatureCard icon="📝" title="Notes" desc="Add text lines to any memo. Lines start as plain text — tap the ☐ icon to turn one into a checklist item, or use the edit modal." colors={colors} />
          <FeatureCard icon="✏️" title="Inline Editing" desc="Tap the memo title to rename. Tap any note text to edit it." colors={colors} />

          <SectionHeader title="Navigation" color={colors.accentColor} />

          <FeatureCard icon="👆" title="Tabs & Swipe" desc="Bottom tab bar switches between sections. Swipe horizontally or tap a tab." colors={colors} />
          <FeatureCard icon="🏠" title="Home Button" desc="The 🏠 button in any section header returns you to the Home dashboard." colors={colors} />
          <FeatureCard icon="↩️" title="Gestures" desc="Swipe from the screen edge to go back. Long-press cards to delete (with confirmation). Tap titles to rename." colors={colors} />

          <SectionHeader title="Security & Privacy" color={colors.accentColor} />

          <FeatureCard icon="🔒" title="Local Storage" desc="All data is stored in a local SQLite database on your device. No data is transmitted to any server." colors={colors} />
          <FeatureCard icon="📡" title="No Network" desc="listAll operates fully offline. No internet permission, no analytics, no tracking, no account required." colors={colors} />
          <FeatureCard icon="🗑️" title="Data Cleanup" desc="Deleted items are fully removed from the database. The database is auto-vacuumed in the background to reclaim space." colors={colors} />
          <TouchableOpacity onPress={() => Linking.openURL('https://github.com/evariste1963/listAll/blob/main/SECURITY.md')}>
            <FeatureCard icon="📄" title="Security Policy" desc="Press here to read the full security statement for details on data handling, permissions, and vulnerability reporting." colors={colors} titleColor={colors.priorityMedium} descColor={colors.priorityMedium} />
          </TouchableOpacity>

          <SectionHeader title="Database" color={colors.accentColor} />

          <FeatureCard icon="💾" title="SQLite" desc="Uses expo-sqlite with Drizzle ORM. Configured with WAL mode for performance and auto_vacuum for space management." colors={colors} />
          <FeatureCard icon="📁" title="File" desc="Database file: listAll.db. Android backup is disabled (allowBackup=false)." colors={colors} />

          <SectionHeader title="Edge Cases" color={colors.accentColor} />

          <FeatureCard icon="🛡️" title="Delete Protection" desc="Cannot delete a list or shop that still has items. Must delete all items first." colors={colors} />
          <FeatureCard icon="📭" title="Empty States" desc="Every section shows a helpful empty state when no data exists, with a call to action." colors={colors} />
          <FeatureCard icon="⏳" title="Loading States" desc="Database initialization shows status. Buttons disabled while data is loading or input is empty." colors={colors} />
          <FeatureCard icon="🔁" title="Data Persistence" desc="All data persists across app restarts. UI refreshes automatically when you navigate back." colors={colors} />

          <View style={{
            marginTop: 32,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: colors.dividerColor,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 12, color: colors.mutedText, marginBottom: 4 }}>
              developed by this.me
            </Text>
            <Text style={{ fontSize: 11, color: colors.mutedText }}>
              © {new Date().getFullYear()} — MIT License
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ThemedBackground>
  );
}
