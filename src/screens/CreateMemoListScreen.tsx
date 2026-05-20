import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useTheme } from '../styles/theme';
import { createThemedStyles } from '../styles/global';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateMemoList'>;

export default function CreateMemoListScreen() {
  const db = useDB();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const s = createThemedStyles(colors);
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
        .from(schema.memoList)
        .all();

      const duplicate = existing.find(
        list => list.title.toLowerCase() === trimmedTitle.toLowerCase()
      );

      if (duplicate) {
        Alert.alert('List Already Exists', `"${duplicate.title}" already exists.`);
        setLoading(false);
        return;
      }

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
    <SafeAreaView style={s.createScreenContainer}>
      <Text style={[s.createScreenTitle, { color: colors.primaryText }]}>Create Memo</Text>
      <Text style={[s.createScreenSubtitle, { color: colors.tertiaryText }]}>Give your memo a name</Text>

      <View style={s.createScreenInputContainer}>
        <TextInput
          style={[s.createScreenInput, { backgroundColor: colors.cardBackground, color: colors.primaryText, borderColor: colors.dividerColor }]}
          placeholder="e.g., Notes, Ideas, Recipes"
          placeholderTextColor={colors.mutedText}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />
      </View>

      <TouchableOpacity 
        style={[s.createScreenButton, (!title.trim() || loading) && s.buttonDisabled, { backgroundColor: colors.accentColor }]}
        onPress={handleCreate}
        disabled={!title.trim() || loading}
      >
        <Text style={[s.createScreenButtonText, { color: colors.primaryText }]}>
          {loading ? 'Creating...' : 'Create Memo'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={s.createScreenCancelButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={[s.createScreenCancelText, { color: colors.tertiaryText }]}>Cancel</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
