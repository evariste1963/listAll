import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../styles/theme';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const handleShoppingPress = () => {
    navigation.navigate('MainTabs', { screen: 'ShoppingTab' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
          <Text style={styles.logo}>📋</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>listAll</Text>
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>Your personal list manager</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={handleShoppingPress}
        >
          <Text style={styles.cardIcon}>🛒</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Shopping</Text>
          <Text style={[styles.cardDesc, { color: colors.textTertiary }]}>Manage your shopping lists</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'MemosTab' })}
        >
          <Text style={styles.cardIcon}>📝</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Memos</Text>
          <Text style={[styles.cardDesc, { color: colors.textTertiary }]}>Quick notes and reminders</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'TodosTab' })}
        >
          <Text style={styles.cardIcon}>✅</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Todos</Text>
          <Text style={[styles.cardDesc, { color: colors.textTertiary }]}>Track your tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'PreferencesTab' })}
        >
          <Text style={styles.cardIcon}>⚙️</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Preferences</Text>
          <Text style={[styles.cardDesc, { color: colors.textTertiary }]}>App settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  cardDesc: {
    fontSize: 12,
  },
  container: {
    flex: 1,
  },
});