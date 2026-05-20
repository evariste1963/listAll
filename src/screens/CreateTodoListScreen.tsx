import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useTheme } from '../styles/theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateTodoList'>;

export default function CreateTodoListScreen() {
  const db = useDB();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const existing = await db.select()
        .from(schema.todoList)
        .all();

      const duplicate = existing.find(
        list => list.title.toLowerCase() === trimmedTitle.toLowerCase()
      );

      if (duplicate) {
        Alert.alert('List Already Exists', `"${duplicate.title}" already exists.`);
        setLoading(false);
        return;
      }

      const [newList] = await db.insert(schema.todoList)
        .values({ title: trimmedTitle })
        .returning();

      if (newList) {
        navigation.replace('TodoDetail', { listId: newList.id });
      } else {
        Alert.alert('Error', 'Failed to create todo list');
        setLoading(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to create todo list');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.title, { color: colors.primaryText }]}>Create Todo List</Text>
      <Text style={[styles.subtitle, { color: colors.tertiaryText }]}>Give your todo list a name</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.primaryText, borderColor: colors.dividerColor }]}
          placeholder="e.g., Projects, Chores, Goals"
          placeholderTextColor={colors.mutedText}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, (!title.trim() || loading) && styles.buttonDisabled, { backgroundColor: colors.accentColor }]}
        onPress={handleCreate}
        disabled={!title.trim() || loading}
      >
        <Text style={[styles.buttonText, { color: colors.primaryText }]}>
          {loading ? 'Creating...' : 'Create Todo List'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={[styles.cancelText, { color: colors.tertiaryText }]}>Cancel</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
  },
});