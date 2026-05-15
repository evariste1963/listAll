import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/schema';

export default function CreateMemoListScreen() {
  const db = useDB();
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    await db.insert(schema.memoList).values({ 
      title: title.trim(),
      createdAt: new Date()
    }).run();

    // Get the new list
    const newList = await db.select()
      .from(schema.memoList)
      .orderBy(schema.memoList.id)
      .limit(1)
      .run();

    if (newList.length > 0) {
      navigation.replace('MemoDetail', { listId: newList[0].id });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Memo</Text>
      <Text style={styles.subtitle}>Give your memo a name</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="e.g., Notes, Ideas, Recipes"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
          autoFocus
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, !title.trim() && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={!title.trim()}
      >
        <Text style={styles.buttonText}>Create Memo</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  button: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
  },
});