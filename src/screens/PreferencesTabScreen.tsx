import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';

export default function PreferencesTabScreen() {
  const db = useDB();
  const navigation = useNavigation<any>();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your lists and items. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            await db.delete(schema.shoppingItem).run();
            await db.delete(schema.shopTab).run();
            await db.delete(schema.shoppingList).run();
            await db.delete(schema.memoItem).run();
            await db.delete(schema.memoList).run();
            await db.delete(schema.todoItem).run();
            await db.delete(schema.todoList).run();
            Alert.alert('Done', 'All data cleared');
          }
        },
      ]
    );
  };

  const handleResetTemplates = () => {
    Alert.alert(
      'Reset Templates',
      'Reset list types to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: async () => {
            await db.delete(schema.listType).run();
            await db.insert(schema.listType).values([
              { id: 1, name: 'shopping', icon: '🛒', fieldsConfig: '{}', isDefault: true },
              { id: 2, name: 'memo', icon: '📝', fieldsConfig: '{"isCheckable":true}', isDefault: true },
              { id: 3, name: 'todo', icon: '✅', fieldsConfig: '{"dueDate":true,"priority":true}', isDefault: true },
            ]).run();
            Alert.alert('Done', 'Templates reset');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Preferences</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.appName}>listAll</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>
            A scalable list app for Shopping Lists, Memos, and Todos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity style={styles.option} onPress={handleResetTemplates}>
            <Text style={styles.optionText}>Reset Templates</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={handleClearData}>
            <Text style={styles.optionTextDanger}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info</Text>
          <Text style={styles.infoText}>
            • Shopping lists support multiple shop tabs{'\n'}
            • Memos can have optional checkboxes{'\n'}
            • Todos support due dates and priorities{'\n'}
            • All data is stored locally
          </Text>
        </View>
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
    padding: 16,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e94560',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
  option: {
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  optionTextDanger: {
    fontSize: 16,
    color: '#e94560',
  },
  infoText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 24,
  },
});