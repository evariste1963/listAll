import React from 'react';
import { Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../styles/theme';
import { createThemedStyles } from '../styles/global';

function SectionTitle({ children, color, s }: { children: string; color: string; s: ReturnType<typeof createThemedStyles> }) {
  return <Text style={[s.guideSectionTitle, { color }]}>{children}</Text>;
}

function BulletItem({ text, color, s }: { text: string; color: string; s: ReturnType<typeof createThemedStyles> }) {
  return <Text style={[s.guideBullet, { color }]}>{'•  '}{text}</Text>;
}

export default function GuideScreen() {
  const { colors } = useTheme();
  const s = createThemedStyles(colors);

  return (
    <SafeAreaView style={s.guideContainer} edges={['left', 'right', 'bottom']}>
      <ScrollView style={s.guideScrollView} contentContainerStyle={s.guideContent}>
        <Text style={[s.guideMainTitle, { color: colors.primaryText }]}>listAll</Text>
        <Text style={[s.guideIntro, { color: colors.secondaryText }]}>
          Your personal list manager with three list types: Shopping, Memos, and Todos.
          All data is stored locally on your device.
        </Text>

        <SectionTitle color={colors.accentColor} s={s}>Getting Started</SectionTitle>
        <BulletItem color={colors.primaryText} s={s} text="Open the app to the Home dashboard." />
        <BulletItem color={colors.primaryText} s={s} text="Tap any card (Shopping, Memos, Todos, Prefs) to jump to that section." />
        <BulletItem color={colors.primaryText} s={s} text="Use the bottom tab bar to switch between list types anytime." />

        <SectionTitle color={colors.accentColor} s={s}>Shopping Lists</SectionTitle>
        <BulletItem color={colors.primaryText} s={s} text="Create: Tap + on the Shopping tab. Name your list." />
        <BulletItem color={colors.primaryText} s={s} text="Default shops: Pre-configured shops from Prefs auto-populate your first list." />
        <BulletItem color={colors.primaryText} s={s} text="Add shops: Tap + Add in the shop tabs row inside a list." />
        <BulletItem color={colors.primaryText} s={s} text="Duplicate shops: Adding a shop with the same name (case-insensitive) is blocked." />
        <BulletItem color={colors.primaryText} s={s} text="Delete shops: Long-press a shop tab (blocked if it has items or is a default shop)." />
        <BulletItem color={colors.primaryText} s={s} text="Add items: Select a shop tab, type your item, press + or Enter." />
        <BulletItem color={colors.primaryText} s={s} text="Duplicate items: Adding an item with the same name (case-insensitive) is blocked." />
        <BulletItem color={colors.primaryText} s={s} text="Toggle: Tap O to mark pending, ✓ to mark done." />
        <BulletItem color={colors.primaryText} s={s} text="Delete completed: Tap the trash icon to remove all checked items in the current tab." />
        <BulletItem color={colors.primaryText} s={s} text="Delete individual: Tap the ✕ button on any item." />
        <BulletItem color={colors.primaryText} s={s} text="Edit items: Tap on any item text to rename it." />
        <BulletItem color={colors.primaryText} s={s} text="Summary bar: Shows remaining/total count across all tabs." />
        <BulletItem color={colors.primaryText} s={s} text="Shop badges: Each tab shows its item count." />

        <SectionTitle color={colors.accentColor} s={s}>Memos</SectionTitle>
        <BulletItem color={colors.primaryText} s={s} text="Create: Tap + on the Memos tab, enter a title." />
        <BulletItem color={colors.primaryText} s={s} text="Duplicate lists: Creating a memo with the same name (case-insensitive) is blocked." />
        <BulletItem color={colors.primaryText} s={s} text="Add lines: Type and press Enter." />
        <BulletItem color={colors.primaryText} s={s} text="Toggle: Tap O / ✓ to mark lines complete." />
        <BulletItem color={colors.primaryText} s={s} text="Edit title: Tap the memo title to rename it inline." />
        <BulletItem color={colors.primaryText} s={s} text="Edit lines: Tap any line to rename it." />
        <BulletItem color={colors.primaryText} s={s} text="Delete lines: Tap the ✕ button on any line." />
        <BulletItem color={colors.primaryText} s={s} text="Delete memo: Long-press a memo card (blocked if it has items)." />
        <BulletItem color={colors.primaryText} s={s} text="Card view: Each memo shows title, remaining count, and creation date." />

        <SectionTitle color={colors.accentColor} s={s}>Todos</SectionTitle>
        <BulletItem color={colors.primaryText} s={s} text="Create: Tap + on the Todos tab, enter a title." />
        <BulletItem color={colors.primaryText} s={s} text="Duplicate lists: Creating a todo list with the same name (case-insensitive) is blocked." />
        <BulletItem color={colors.primaryText} s={s} text="Add tasks: Type your task, press + or Enter." />
        <BulletItem color={colors.primaryText} s={s} text="Due dates: Tap the calendar button to pick an optional due date (today to 5 years out)." />
        <BulletItem color={colors.primaryText} s={s} text="Priority: Tap the flag icon to cycle None / Low / Medium / High." />
        <BulletItem color={colors.primaryText} s={s} text="Auto-sort: Items with due dates appear first (earliest first), undated items last." />
        <BulletItem color={colors.primaryText} s={s} text="Priority badges: Todo cards show color-coded counts (red=high, yellow=medium, green=low)." />
        <BulletItem color={colors.primaryText} s={s} text="Toggle: Tap O / ✓ to mark tasks complete." />
        <BulletItem color={colors.primaryText} s={s} text="Edit title: Tap the todo list title to rename it inline." />
        <BulletItem color={colors.primaryText} s={s} text="Edit tasks: Tap any task to change text, priority, and due date." />
        <BulletItem color={colors.primaryText} s={s} text="Delete tasks: Tap the ✕ button on any task." />
        <BulletItem color={colors.primaryText} s={s} text="Delete list: Long-press a todo card (blocked if it has items)." />

        <SectionTitle color={colors.accentColor} s={s}>Settings (Prefs Tab)</SectionTitle>
        <BulletItem color={colors.primaryText} s={s} text="Theme: Switch between Dark, Green (Mid), and Light themes." />
        <BulletItem color={colors.primaryText} s={s} text="Default shops: Add shops that auto-populate new shopping lists." />
        <BulletItem color={colors.primaryText} s={s} text="Manage defaults: Add via + button, remove with long-press or ✕." />
        <BulletItem color={colors.primaryText} s={s} text="Sync: New default shops are added to your active shopping list automatically." />

        <SectionTitle color={colors.accentColor} s={s}>Navigation</SectionTitle>
        <BulletItem color={colors.primaryText} s={s} text="Home dashboard: Tap the logo card on any tab to return home." />
        <BulletItem color={colors.primaryText} s={s} text="Back: Swipe from screen edge or tap the back button." />
        <BulletItem color={colors.primaryText} s={s} text="Tabs: Use the bottom tab bar to switch between Shopping, Memos, Todos, and Prefs." />

        <SectionTitle color={colors.accentColor} s={s}>Tips</SectionTitle>
        <BulletItem color={colors.primaryText} s={s} text="Long-press cards and items to reveal delete options." />
        <BulletItem color={colors.primaryText} s={s} text="Lists persist locally — data survives app restarts." />
        <BulletItem color={colors.primaryText} s={s} text="UI refreshes automatically when you return to a tab (focus-effect)." />
        <BulletItem color={colors.primaryText} s={s} text="Only one active shopping list at a time — create a new one to start fresh." />
      </ScrollView>
    </SafeAreaView>
  );
}
