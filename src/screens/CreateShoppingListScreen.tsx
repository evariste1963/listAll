import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { eq } from 'drizzle-orm';

export default function CreateShoppingListScreen() {
  const db = useDB();
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    // Check if there's already an active shopping list
    const existing = await db.select()
      .from(schema.shoppingList)
      .where(eq(schema.shoppingList.isActive, true))
      .get();

    if (existing) {
      Alert.alert('Error', 'You already have an active shopping list. End it first.');
      return;
    }

    // Create new shopping list
    await db.insert(schema.shoppingList)
      .values({ 
        title: title.trim(), 
        isActive: true,
        createdAt: new Date()
      })
      .run();

    // Get the latest list
    const newList = await db.select()
      .from(schema.shoppingList)
      .orderBy(schema.shoppingList.id)
      .limit(1)
      .get();

    if (newList) {
      navigation.replace('ShoppingDetail', { listId: newList.id });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Shopping List</Text>
      <Text style={styles.subtitle}>Give your shopping list a name</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="e.g., Weekly Shop"
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
        <Text style={styles.buttonText}>Create & Add First Shop</Text>
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