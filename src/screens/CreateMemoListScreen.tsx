import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useTheme } from '../styles/theme';

export default function CreateMemoListScreen() {
  const db = useDB();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
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
      .get();

    if (newList) {
      navigation.replace('MemoDetail', { listId: newList.id });
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <Text style={[styles.title, { color: colors.primaryText }]}>Create Memo</Text>
      <Text style={[styles.subtitle, { color: colors.primaryTextTertiary }]}>Give your memo a name</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.primaryText, borderColor: colors.dividerColor }]}
          placeholder="e.g., Notes, Ideas, Recipes"
          placeholderTextColor={colors.primaryTextMuted}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, !title.trim() && styles.buttonDisabled, { backgroundColor: colors.accentColor }]}
        onPress={handleCreate}
        disabled={!title.trim()}
      >
        <Text style={[styles.buttonText, { color: colors.primaryText }]}>Create Memo</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.cancelText, { color: colors.primaryTextTertiary }]}>Cancel</Text>
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