import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useTheme } from '../styles/theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateMemoList'>;

export default function CreateMemoListScreen() {
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
      const [newList] = await db.insert(schema.memoList)
        .values({ title: trimmedTitle })
        .returning();

      if (newList) {
        navigation.replace('MemoDetail', { listId: newList.id });
      } else {
        Alert.alert('Error', 'Failed to create memo list');
        setLoading(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to create memo list');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.title, { color: colors.primaryText }]}>Create Memo</Text>
      <Text style={[styles.subtitle, { color: colors.tertiaryText }]}>Give your memo a name</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.primaryText, borderColor: colors.dividerColor }]}
          placeholder="e.g., Notes, Ideas, Recipes"
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
          {loading ? 'Creating...' : 'Create Memo'}
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