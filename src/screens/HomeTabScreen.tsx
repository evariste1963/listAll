import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../styles/theme';

interface HomeTabScreenProps {
  onTabChange?: (index: number, animated?: boolean) => void;
  isHomeTab?: boolean;
}

export default function HomeTabScreen({ onTabChange }: HomeTabScreenProps) {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const tabs = [
    { index: 1, icon: '🛒', title: 'Shopping', desc: 'Manage your shopping lists' },
    { index: 2, icon: '📝', title: 'Memos', desc: 'Quick notes and reminders' },
    { index: 3, icon: '✅', title: 'Todos', desc: 'Track your tasks' },
    { index: 4, icon: '⚙️', title: 'Preferences', desc: 'App settings' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + 16 }}>
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.cardBackground }]}>
          <Image source={require('../../assets/listAll_logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={[styles.subtitle, { color: colors.tertiaryText }]}>Your personal list manager</Text>
      </View>

      <View style={styles.cardsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.title}
            style={[styles.card, { backgroundColor: colors.cardBackground }]}
            onPress={() => onTabChange?.(tab.index, false)}
          >
            <Text style={styles.cardIcon}>{tab.icon}</Text>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: colors.primaryText }]}>{tab.title}</Text>
              <Text style={[styles.cardDesc, { color: colors.tertiaryText }]}>{tab.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.cardBackground }]}
          onPress={() => navigation.navigate('Guide')}
        >
          <Text style={styles.cardIcon}>📖</Text>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: colors.primaryText }]}>Guide</Text>
            <Text style={[styles.cardDesc, { color: colors.tertiaryText }]}>How to use listAll</Text>
          </View>
        </TouchableOpacity>
      </View>
      </ScrollView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 14,
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