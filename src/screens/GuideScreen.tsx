import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../styles/theme';

function SectionTitle({ children, color }: { children: string; color: string }) {
  return <Text style={[styles.sectionTitle, { color }]}>{children}</Text>;
}

function BodyText({ children }: { children: string }) {
  return <Text style={styles.bodyText}>{children}</Text>;
}

function BulletItem({ text, color }: { text: string; color: string }) {
  return <Text style={[styles.bulletItem, { color }]}>{'•  '}{text}</Text>;
}

export default function GuideScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={[styles.mainTitle, { color: colors.primaryText }]}>listAll</Text>
        <Text style={[styles.intro, { color: colors.secondaryText }]}>
          Your personal list manager with three list types: Shopping, Memos, and Todos.
          All data is stored locally on your device.
        </Text>

        <SectionTitle color={colors.accentColor}>Getting Started</SectionTitle>
        <BulletItem color={colors.primaryText} text="Open the app to the Home dashboard." />
        <BulletItem color={colors.primaryText} text="Tap any card (Shopping, Memos, Todos, Prefs) to jump to that section." />
        <BulletItem color={colors.primaryText} text="Use the bottom tab bar to switch between list types anytime." />

        <SectionTitle color={colors.accentColor}>Shopping Lists</SectionTitle>
        <BulletItem color={colors.primaryText} text="Create: Tap + on the Shopping tab. Name your list." />
        <BulletItem color={colors.primaryText} text="Default shops: Pre-configured shops from Prefs auto-populate your first list." />
        <BulletItem color={colors.primaryText} text="Add shops: Tap + Add in the shop tabs row inside a list." />
        <BulletItem color={colors.primaryText} text="Duplicate shops: Adding a shop with the same name (case-insensitive) is blocked." />
        <BulletItem color={colors.primaryText} text="Delete shops: Long-press a shop tab (blocked if it has items or is a default shop)." />
        <BulletItem color={colors.primaryText} text="Add items: Select a shop tab, type your item, press + or Enter." />
        <BulletItem color={colors.primaryText} text="Duplicate items: Adding an item with the same name (case-insensitive) is blocked." />
        <BulletItem color={colors.primaryText} text="Toggle: Tap O to mark pending, ✓ to mark done." />
        <BulletItem color={colors.primaryText} text="Delete completed: Tap the trash icon to remove all checked items in the current tab." />
        <BulletItem color={colors.primaryText} text="Delete individual: Tap the ✕ button on any item." />
        <BulletItem color={colors.primaryText} text="Edit items: Tap on any item text to rename it." />
        <BulletItem color={colors.primaryText} text="Summary bar: Shows remaining/total count across all tabs." />
        <BulletItem color={colors.primaryText} text="Shop badges: Each tab shows its item count." />

        <SectionTitle color={colors.accentColor}>Memos</SectionTitle>
        <BulletItem color={colors.primaryText} text="Create: Tap + on the Memos tab, enter a title." />
        <BulletItem color={colors.primaryText} text="Duplicate lists: Creating a memo with the same name (case-insensitive) is blocked." />
        <BulletItem color={colors.primaryText} text="Add lines: Type and press Enter." />
        <BulletItem color={colors.primaryText} text="Toggle: Tap O / ✓ to mark lines complete." />
        <BulletItem color={colors.primaryText} text="Edit title: Tap the memo title to rename it inline." />
        <BulletItem color={colors.primaryText} text="Edit lines: Tap any line to rename it." />
        <BulletItem color={colors.primaryText} text="Delete lines: Tap the ✕ button on any line." />
        <BulletItem color={colors.primaryText} text="Delete memo: Long-press a memo card (blocked if it has items)." />
        <BulletItem color={colors.primaryText} text="Card view: Each memo shows title, remaining count, and creation date." />

        <SectionTitle color={colors.accentColor}>Todos</SectionTitle>
        <BulletItem color={colors.primaryText} text="Create: Tap + on the Todos tab, enter a title." />
        <BulletItem color={colors.primaryText} text="Duplicate lists: Creating a todo list with the same name (case-insensitive) is blocked." />
        <BulletItem color={colors.primaryText} text="Add tasks: Type your task, press + or Enter." />
        <BulletItem color={colors.primaryText} text="Due dates: Tap the calendar button to pick an optional due date (today to 5 years out)." />
        <BulletItem color={colors.primaryText} text="Priority: Tap the flag icon to cycle None / Low / Medium / High." />
        <BulletItem color={colors.primaryText} text="Auto-sort: Items with due dates appear first (earliest first), undated items last." />
        <BulletItem color={colors.primaryText} text="Priority badges: Todo cards show color-coded counts (red=high, yellow=medium, green=low)." />
        <BulletItem color={colors.primaryText} text="Toggle: Tap O / ✓ to mark tasks complete." />
        <BulletItem color={colors.primaryText} text="Edit title: Tap the todo list title to rename it inline." />
        <BulletItem color={colors.primaryText} text="Edit tasks: Tap any task to change text, priority, and due date." />
        <BulletItem color={colors.primaryText} text="Delete tasks: Tap the ✕ button on any task." />
        <BulletItem color={colors.primaryText} text="Delete list: Long-press a todo card (blocked if it has items)." />

        <SectionTitle color={colors.accentColor}>Settings (Prefs Tab)</SectionTitle>
        <BulletItem color={colors.primaryText} text="Theme: Switch between Dark, Green (Mid), and Light themes." />
        <BulletItem color={colors.primaryText} text="Default shops: Add shops that auto-populate new shopping lists." />
        <BulletItem color={colors.primaryText} text="Manage defaults: Add via + button, remove with long-press or ✕." />
        <BulletItem color={colors.primaryText} text="Sync: New default shops are added to your active shopping list automatically." />

        <SectionTitle color={colors.accentColor}>Navigation</SectionTitle>
        <BulletItem color={colors.primaryText} text="Home dashboard: Tap the logo card on any tab to return home." />
        <BulletItem color={colors.primaryText} text="Back: Swipe from screen edge or tap the back button." />
        <BulletItem color={colors.primaryText} text="Tabs: Use the bottom tab bar to switch between Shopping, Memos, Todos, and Prefs." />

        <SectionTitle color={colors.accentColor}>Tips</SectionTitle>
        <BulletItem color={colors.primaryText} text="Long-press cards and items to reveal delete options." />
        <BulletItem color={colors.primaryText} text="Lists persist locally — data survives app restarts." />
        <BulletItem color={colors.primaryText} text="UI refreshes automatically when you return to a tab (focus-effect)." />
        <BulletItem color={colors.primaryText} text="Only one active shopping list at a time — create a new one to start fresh." />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  intro: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 2,
    paddingLeft: 4,
  },
});