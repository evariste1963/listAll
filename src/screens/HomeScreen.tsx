import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { eq } from 'drizzle-orm';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const db = useDB();

  const handleShoppingPress = async () => {
    navigation.navigate('MainTabs', { screen: 'ShoppingTab' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>📋</Text>
        </View>
        <Text style={styles.title}>listAll</Text>
        <Text style={styles.subtitle}>Your personal list manager</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={[styles.card, styles.shoppingCard]}
          onPress={handleShoppingPress}
        >
          <Text style={styles.cardIcon}>🛒</Text>
          <Text style={styles.cardTitle}>Shopping</Text>
          <Text style={styles.cardDesc}>Manage your shopping lists</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.memosCard]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'MemosTab' })}
        >
          <Text style={styles.cardIcon}>📝</Text>
          <Text style={styles.cardTitle}>Memos</Text>
          <Text style={styles.cardDesc}>Quick notes and reminders</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.todosCard]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'TodosTab' })}
        >
          <Text style={styles.cardIcon}>✅</Text>
          <Text style={styles.cardTitle}>Todos</Text>
          <Text style={styles.cardDesc}>Track your tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.prefsCard]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'PreferencesTab' })}
        >
          <Text style={styles.cardIcon}>⚙️</Text>
          <Text style={styles.cardTitle}>Preferences</Text>
          <Text style={styles.cardDesc}>App settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#16213e',
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
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
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
  shoppingCard: {
    backgroundColor: '#16213e',
  },
  memosCard: {
    backgroundColor: '#16213e',
  },
  todosCard: {
    backgroundColor: '#16213e',
  },
  prefsCard: {
    backgroundColor: '#16213e',
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  cardDesc: {
    fontSize: 12,
    color: '#888',
  },
});