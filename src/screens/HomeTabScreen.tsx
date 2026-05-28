import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, ThemedBackground } from '../styles/theme';
import { createThemedStyles } from '../styles/global';
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
  s: ReturnType<typeof createThemedStyles>;
}

function NavigationCard({ tab, onPress, iconBgColor, iconColor, colors, s }: NavigationCardProps) {
  return (
    <TouchableOpacity
      style={[s.homeCard, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
    >
      <View style={[s.cardIconWrapper, iconBgColor && { backgroundColor: iconBgColor }]}>
        <Text style={[s.cardIcon, iconColor && { color: iconColor }]}>{tab.icon}</Text>
      </View>
      <View style={s.cardText}>
        <Text style={[s.cardTitle, { color: colors.primaryText }]}>{tab.title}</Text>
        <Text style={[s.cardDesc, { color: colors.secondaryText }]}>{tab.desc}</Text>
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
  const s = createThemedStyles(colors);

  return (
    <ThemedBackground colors={colors}>
      <SafeAreaView style={s.container}>
        <ScrollView style={s.guideScrollView} contentContainerStyle={s.homeContent}>
          <View style={s.homeHeader}>
            <View style={[s.logoContainer, { backgroundColor: colors.cardBackground }]}>
              <Image source={colors.logoAsset} style={s.logo} resizeMode="contain" />
            </View>
            <Text style={[s.homeSubtitle, { color: colors.tertiaryText }]}>Your personal list manager</Text>
          </View>

          <View style={s.cardsContainer}>
            {TABS.map((tab) => (
              <NavigationCard
                key={tab.title}
                tab={tab}
                colors={colors}
                s={s}
                iconBgColor={tab.iconBg ? (tab.title === 'Todos' ? colors.todoIconBg : colors[tab.iconBg as keyof typeof colors]) : undefined}
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
    </ThemedBackground>
  );
}
