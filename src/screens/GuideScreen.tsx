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

function BulletItem({ text }: { text: string }) {
  return <Text style={styles.bulletItem}>{'•  '}{text}</Text>;
}

export default function GuideScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={[styles.mainTitle, { color: colors.primaryText }]}>listAll</Text>
        <Text style={[styles.intro, { color: colors.secondaryText }]}>
          Your personal list manager with three list types: Shopping, Memos, and Todos.
        </Text>

        <SectionTitle color={colors.accentColor}>Shopping Lists</SectionTitle>
        <BulletItem text="Create: Tap + on the Shopping tab. Name your list and add shops." />
        <BulletItem text="Add items: Select a shop tab, type your item, press + or Enter." />
        <BulletItem text="Toggle: Tap O to mark pending, ✓ to mark done." />
        <BulletItem text="Delete completed: Tap the trash icon to remove checked items." />
        <BulletItem text="Add shops: Tap + Add in the shop tabs row." />
        <BulletItem text="Delete shops: Long-press a shop tab." />
        <BulletItem text="Edit items: Tap on any item text to rename it." />

        <SectionTitle color={colors.accentColor}>Memos</SectionTitle>
        <BulletItem text="Create: Tap + on the Memos tab, enter a title." />
        <BulletItem text="Add lines: Type and press Enter." />
        <BulletItem text="Toggle: Tap O / ✓ to mark lines complete." />
        <BulletItem text="Delete: Long-press a memo card." />

        <SectionTitle color={colors.accentColor}>Todos</SectionTitle>
        <BulletItem text="Create: Tap + on the Todos tab, enter a title." />
        <BulletItem text="Add tasks: Type your task, press + or Enter." />
        <BulletItem text="Due dates: Tap the date button to set an optional date." />
        <BulletItem text="Priority: Tap the flag icon to cycle Low / Medium / High." />
        <BulletItem text="Toggle/Delete/Edit: Same as Memos." />

        <SectionTitle color={colors.accentColor}>Settings</SectionTitle>
        <BulletItem text="Access via the Prefs tab." />
        <BulletItem text="Theme: Switch between Dark, Mid (green), and Light." />
        <BulletItem text="Default shops: Manage shops that auto-populate new lists." />

        <SectionTitle color={colors.accentColor}>Tips</SectionTitle>
        <BulletItem text="Swipe or tap Back to navigate between screens." />
        <BulletItem text="Long-press cards and items to reveal delete options." />
        <BulletItem text="Lists persist locally — data is saved automatically." />
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