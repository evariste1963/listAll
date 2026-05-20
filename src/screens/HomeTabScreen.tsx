import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../styles/theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

interface TabItem {
  index: number;
  icon: string;
  title: string;
  desc: string;
  iconBg?: string;
}

const TABS: TabItem[] = [
  { index: 1, icon: '🛒', title: 'Shopping', desc: 'Manage your shopping lists' },
  { index: 2, icon: '📝', title: 'Memos', desc: 'Quick notes and reminders' },
  { index: 3, icon: '✓', title: 'Todos', desc: 'Track your tasks', iconBg: 'priorityLow' },
  { index: 4, icon: '⚙️', title: 'Preferences', desc: 'App settings' },
  { index: -1, icon: '📖', title: 'Guide', desc: 'How to use listAll' },
];

interface NavigationCardProps {
  tab: TabItem;
  onPress: () => void;
  iconBgColor?: string;
  iconColor?: string;
  colors: ReturnType<typeof useTheme>['colors'];
}

function NavigationCard({ tab, onPress, iconBgColor, iconColor, colors }: NavigationCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
    >
      <View style={[styles.cardIconWrapper, iconBgColor && { backgroundColor: iconBgColor }]}>
        <Text style={[styles.cardIcon, iconColor && { color: iconColor }]}>{tab.icon}</Text>
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, { color: colors.primaryText }]}>{tab.title}</Text>
        <Text style={[styles.cardDesc, { color: colors.tertiaryText }]}>{tab.desc}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface HomeTabScreenProps {
  onTabChange?: (index: number, animated?: boolean) => void;
}

export default function HomeTabScreen({ onTabChange }: HomeTabScreenProps) {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.cardBackground }]}>
            <Image source={require('../../assets/listAll_logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={[styles.subtitle, { color: colors.tertiaryText }]}>Your personal list manager</Text>
        </View>

        <View style={styles.cardsContainer}>
          {TABS.map((tab) => (
            <NavigationCard
              key={tab.title}
              tab={tab}
              colors={colors}
              iconBgColor={tab.iconBg ? colors[tab.iconBg as keyof typeof colors] : undefined}
              iconColor={tab.iconBg ? '#fff' : undefined}
              onPress={() =>
                tab.index === -1
                  ? navigation.navigate('Guide')
                  : onTabChange?.(tab.index, false)
              }
            />
          ))}
        </View>
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
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  logo: {
    width: 135,
    height: 135,
  },
  subtitle: {
    fontSize: 14,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
  },
  cardIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 11,
    marginTop: 2,
  },
});
