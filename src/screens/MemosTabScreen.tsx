import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme, ThemedBackground } from '../styles/theme';
import { createThemedStyles } from '../styles/global';
import { listService } from '../db/services';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MemoWithCount {
  id: number;
  title: string;
  createdAt: Date;
  totalItems: number;
  remainingItems: number;
}

interface MemosTabScreenProps {
  onTabChange?: (index: number, animated?: boolean) => void;
}

export default function MemosTabScreen({ onTabChange }: MemosTabScreenProps = {}) {
  const db = useDB();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const s = createThemedStyles(colors);
  
  const result = useLiveQuery(db.select().from(schema.memoList).orderBy(schema.memoList.createdAt));

  const itemsResult = useLiveQuery(db.select().from(schema.memoItem));

  const memos = useMemo(() => {
    if (!result.data || !itemsResult.data) return [];
    return result.data.map(list => {
      const listItems = itemsResult.data.filter(i => i.listId === list.id);
      return {
        ...list,
        totalItems: listItems.length,
        remainingItems: listItems.filter(i => !i.isDone).length,
      };
    });
  }, [result.data, itemsResult.data]);

  const handleCreate = () => {
    navigation.navigate('CreateMemoList');
  };

  const handleOpen = (listId: number) => {
    navigation.navigate('MemoDetail', { listId });
  };

  const handleDelete = (listId: number, title: string, itemCount: number) => {
    if (itemCount > 0) {
      Alert.alert(
        'Cannot Delete Memo',
        `"${title}" has ${itemCount} item${itemCount > 1 ? 's' : ''}. Delete all items first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Memo',
      `Delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await listService.cascadeDelete(db, schema.memoList, schema.memoItem, listId, schema.memoItem.listId);
          }
        },
      ]
    );
  };

  return (
    <ThemedBackground colors={colors}>
      <SafeAreaView style={s.container}>
        <View style={[s.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.dividerColor }]}>
          <TouchableOpacity onPress={() => onTabChange?.(0, false)}>
            <Text style={s.homeButton}>🏠</Text>
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.primaryText }]}>Memos</Text>
          <TouchableOpacity onPress={handleCreate}>
            <Text style={[s.addButton, { color: colors.accentColor }]}>+</Text>
          </TouchableOpacity>
        </View>

        {memos.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>📝</Text>
            <Text style={[s.emptyTitle, { color: colors.primaryText }]}>No Memos Yet</Text>
            <Text style={[s.emptySubtitle, { color: colors.tertiaryText }]}>Create a memo to remember things</Text>
            <TouchableOpacity style={[s.createButton, { backgroundColor: colors.accentColor }]} onPress={handleCreate}>
              <Text style={[s.createButtonText, { color: colors.primaryText }]}>+ Create Memo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={memos}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={s.list}
            style={{ flex: 1 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[s.card, s.cardRow, { backgroundColor: colors.cardBackground }]}
                onPress={() => handleOpen(item.id)}
                onLongPress={() => handleDelete(item.id, item.title, item.totalItems)}
              >
                <View style={s.shopInfo}>
                  <Text style={[s.cardTitle, { color: colors.primaryText }]}>{item.title}</Text>
                  <Text style={[s.shopItems, { color: colors.tertiaryText }]}>
                    {item.remainingItems} remaining
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[{ fontSize: 12, color: colors.mutedText }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedBackground>
  );
}
