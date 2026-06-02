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
          <FeatureCard icon="🛒" title="Shopping" desc="One active shopping list with shop tabs, default shops auto-sync, item CRUD, bulk delete completed, and duplicate prevention." colors={colors} />
          <FeatureCard icon="📝" title="Memos" desc="Multiple memo lists with Markdown, link preview, image attachments, checkable items, tags, pin, archive, reorder, and search with clear." colors={colors} />
          <FeatureCard icon="✓" title="Todos" desc="Full task management with due dates, priority levels (Low/Med/High), overdue detection, search, and local notification reminders." colors={colors} iconColor={colors.todoIconBg} />
          <FeatureCard icon="⚙️" title="Preferences" desc="Three themes (Dark, Green, Light). Configure notification intervals. Manage default shops." colors={colors} />
          <FeatureCard icon="📖" title="Guide" desc="This page — a reference for all app features and behavior." colors={colors} />

          <SectionHeader title="Shopping" color={colors.accentColor} />

          <FeatureCard icon="➕" title="Create a List" desc="Tap + on the Shopping tab. Default shops from Settings are added automatically. Three empty states guide you step by step." colors={colors} />
          <FeatureCard icon="🏪" title="Shop Tabs" desc="Add shops inside a list. Each shop has its own item list. Tap a tab to switch. Auto-sync inserts missing default shops from Settings." colors={colors} />
          <FeatureCard icon="📋" title="Items" desc="Add items with automatic ordering. Toggle done with O/✓, tap to rename, ✕ to delete. Bulk delete all completed items at once." colors={colors} />
          <FeatureCard icon="🗑️" title="Delete a Shop" desc="Long-press a shop tab. Blocked if the shop has items or is a default shop. Confirmation required." colors={colors} />
          <FeatureCard icon="⭐" title="Default Shops" desc="Configure in Settings. Tap +/− on a shop card to add/remove from defaults. New defaults auto-sync to your active list." colors={colors} />
          <FeatureCard icon="🚫" title="Duplicate Prevention" desc="Shop names and item names are checked case-insensitively. Duplicates are blocked." colors={colors} />
          <FeatureCard icon="⏳" title="Loading State" desc="Shows 'Loading...' while the database query is in progress." colors={colors} />

          <SectionHeader title="Todos" color={colors.accentColor} />

          <FeatureCard icon="🔍" title="Search" desc="Pill-shaped search bar with 🔍 icon, ✕ clear button, and accent focus highlight. Searches list titles and item titles. Clears on tab switch." colors={colors} />
          <FeatureCard icon="📅" title="Due Dates" desc="Optional date picker when adding or editing a task. Range: today to 5 years out. Cleared, rescheduled, or cancelled via inline date control." colors={colors} />
          <FeatureCard icon="🚩" title="Priority" desc="Set Low/Medium/High when adding or editing. Color-coded badges with counts shown on each list card." colors={colors} />
          <FeatureCard icon="🔔" title="Notifications" desc="4 configurable intervals: at due date, 1 day, 2 days, 1 week before. Messages adapt to timing. Auto-cancel when toggled done, reschedule when undone." colors={colors} />
          <FeatureCard icon="⚠️" title="Overdue Detection" desc="Lists show an overdue badge with count. Tap to navigate to a filtered view of only overdue items, sorted by due date ascending." colors={colors} />
          <FeatureCard icon="↕️" title="Auto-Sort" desc="Tasks with due dates appear first (earliest first), undated tasks last. Overdue filter sorts by due date ascending." colors={colors} />
          <FeatureCard icon="✏️" title="Add/Edit Modal" desc="Full modal for adding or editing todos with title, priority toggles, and optional date picker. Same layout for both add and edit." colors={colors} />
          <FeatureCard icon="🗑️" title="Delete Protection" desc="Long-press a list to delete. Blocked if the list still has items. Must delete all items first." colors={colors} />

          <SectionHeader title="Memos" color={colors.accentColor} />

          <FeatureCard icon="🔍" title="Search" desc="Pill-shaped search bar with 🔍 icon, ✕ clear button, and accent focus highlight. Searches memo titles and note content. Clears on tab switch." colors={colors} />
          <FeatureCard icon="📝" title="Notes & Markdown" desc="Add text notes with full Markdown rendering (**bold**, *italic*, `code`, [links](), headings, lists, blockquotes). Tap the ☐ icon to make a note checkable." colors={colors} />
          <FeatureCard icon="🏷️" title="Tags" desc="Add comma-separated tags to any memo. Filter by tag using the chip bar below the search bar." colors={colors} />
          <FeatureCard icon="📌" title="Pin" desc="Tap the pin icon 📌 to keep a memo at the top of the list. Pinned memos sort first, then by creation date." colors={colors} />
          <FeatureCard icon="📦" title="Archive" desc="Long-press a memo to archive or unarchive it. Archived memos are hidden by default — toggle 'Show Archived' to view and restore them." colors={colors} />
          <FeatureCard icon="🔗" title="Link Preview" desc="Paste a URL when adding a note. The app fetches OG tags (title, description, image) and shows a preview. Confirm to add as a tappable link item." colors={colors} />
          <FeatureCard icon="🖼️" title="Image Attachment" desc="Tap the 🖼 button to pick an image from your gallery. Add an optional caption. Tap an image item to view it fullscreen." colors={colors} />
          <FeatureCard icon="↕️" title="Reorder" desc="Tap the ● selector to pick a note, then use ▲/▼ to move it. Selection auto-deselects after 10 seconds." colors={colors} />
          <FeatureCard icon="✏️" title="Inline Editing" desc="Tap the memo title or a note to edit inline. For image items, the caption is editable." colors={colors} />
          <FeatureCard icon="☐" title="Checklist Toggle" desc="When editing a note, toggle ☐ to make it a checklist item with a checkbox." colors={colors} />
          <FeatureCard icon="🗑️" title="Bulk Delete" desc="Tap 'Delete done' in the memo header to remove all completed items at once. Shows the count of items to be deleted." colors={colors} />
          <FeatureCard icon="🛡️" title="Delete Protection" desc="Long-press a memo to Archive or Delete. Delete is blocked if the memo still has items." colors={colors} />

          <SectionHeader title="Navigation" color={colors.accentColor} />

          <FeatureCard icon="👆" title="Tabs & Swipe" desc="Bottom tab bar switches between 5 sections: Home, Shopping, Memos, Todos, Preferences. Swipe horizontally or tap a tab. Active tab highlighted in accent color." colors={colors} />
          <FeatureCard icon="🏠" title="Home Button" desc="The 🏠 button in any section header returns you to the Home dashboard." colors={colors} />
          <FeatureCard icon="↩️" title="Gestures" desc="Swipe from the screen edge to go back. Long-press lists, shops, or cards for delete/archive actions. Tap titles to rename." colors={colors} />

          <SectionHeader title="Security & Privacy" color={colors.accentColor} />

          <FeatureCard icon="🔒" title="Local Storage" desc="All data is stored in a local SQLite database on your device. No data is transmitted to any server." colors={colors} />
          <FeatureCard icon="📡" title="No Network" desc="listAll operates fully offline. No internet permission, no analytics, no tracking, no account required." colors={colors} />
          <FeatureCard icon="🗑️" title="Data Cleanup" desc="Deleted items are fully removed from the database. The database is auto-vacuumed in the background to reclaim space." colors={colors} />
          <TouchableOpacity onPress={() => Linking.openURL('https://github.com/evariste1963/listAll/blob/main/SECURITY.md')}>
            <FeatureCard icon="🛡️" title="Security Policy" desc="Data handling, permissions, and vulnerability reporting." colors={colors} titleColor={colors.priorityMedium} descColor={colors.priorityMedium} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://github.com/evariste1963/listAll/blob/main/PRIVACY.md')}>
            <FeatureCard icon="📄" title="Privacy Policy" desc="Data collection, permissions, and local-only storage." colors={colors} titleColor={colors.priorityMedium} descColor={colors.priorityMedium} />
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
