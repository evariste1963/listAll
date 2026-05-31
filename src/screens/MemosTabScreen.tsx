import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
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

interface MemosTabScreenProps {
  onTabChange?: (index: number, animated?: boolean) => void;
}

export default function MemosTabScreen({ onTabChange }: MemosTabScreenProps = {}) {
  const db = useDB();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const s = createThemedStyles(colors);

  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const result = useLiveQuery(db.select().from(schema.memoList).orderBy(schema.memoList.createdAt));

  const itemsResult = useLiveQuery(db.select().from(schema.memoItem));

  const memos = useMemo(() => {
    if (!result.data || !itemsResult.data) return [];

    let lists = result.data;
    const allItems = itemsResult.data;

    if (!showArchived) {
      lists = lists.filter(l => !l.isArchived);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchingItemListIds = new Set(
        allItems.filter(i => i.title.toLowerCase().includes(q)).map(i => i.listId)
      );
      const matchingListIds = new Set(
        lists.filter(l => l.title.toLowerCase().includes(q)).map(l => l.id)
      );
      const activeIds = new Set([...matchingItemListIds, ...matchingListIds]);
      lists = lists.filter(l => activeIds.has(l.id));
    }

    const mapped = lists.map(list => {
      const listItems = allItems.filter(i => i.listId === list.id);
      return {
        ...list,
        totalItems: listItems.length,
        remainingItems: listItems.filter(i => !i.isDone).length,
      };
    });

    mapped.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return mapped;
  }, [result.data, itemsResult.data, searchQuery, showArchived]);

  const handleCreate = () => {
    navigation.navigate('CreateMemoList');
  };

  const handleOpen = (listId: number) => {
    navigation.navigate('MemoDetail', { listId });
  };

  const handleTogglePin = async (listId: number, isPinned: boolean | null) => {
    await listService.togglePin(db, schema.memoList, listId, isPinned);
  };

  const handleToggleArchive = async (listId: number, isArchived: boolean | null) => {
    await listService.toggleArchive(db, schema.memoList, listId, isArchived);
  };

  const handleLongPress = (listId: number, title: string, itemCount: number, isArchived: boolean | null) => {
    const buttons: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [];

    buttons.push({
      text: isArchived ? 'Unarchive' : 'Archive',
      onPress: () => handleToggleArchive(listId, isArchived),
    });

    if (itemCount === 0) {
      buttons.push({
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await listService.cascadeDelete(db, schema.memoList, schema.memoItem, listId, schema.memoItem.listId);
        },
      });
    }

    buttons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(title, undefined, buttons);
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

  const hasArchived = result.data?.some(l => l.isArchived) ?? false;

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

        <View style={[s.searchBar, { backgroundColor: colors.inputBackground, borderColor: colors.dividerColor }]}>
          <TextInput
            style={[s.searchInput, { color: colors.primaryText }]}
            placeholder="Search memos..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {hasArchived && (
          <TouchableOpacity
            style={{ paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' }}
            onPress={() => setShowArchived(!showArchived)}
          >
            <Text style={{ fontSize: 13, color: colors.accentColor }}>
              {showArchived ? 'Show Active' : `Show Archived (${result.data?.filter(l => l.isArchived).length})`}
            </Text>
          </TouchableOpacity>
        )}

        {memos.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>📝</Text>
            <Text style={[s.emptyTitle, { color: colors.primaryText }]}>
              {searchQuery.trim() ? 'No Results' : showArchived ? 'No Archived Memos' : 'No Memos Yet'}
            </Text>
            <Text style={[s.emptySubtitle, { color: colors.tertiaryText }]}>
              {searchQuery.trim() ? 'Try a different search' : showArchived ? 'Archive a memo to see it here' : 'Create a memo to remember things'}
            </Text>
            {!searchQuery.trim() && !showArchived && (
              <TouchableOpacity style={[s.createButton, { backgroundColor: colors.accentColor }]} onPress={handleCreate}>
                <Text style={[s.createButtonText, { color: colors.accentText }]}>+ Create Memo</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={memos}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={s.list}
            style={{ flex: 1 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.card, s.cardRow, { backgroundColor: colors.cardBackground, opacity: item.isArchived ? 0.55 : 1 }]}
                onPress={() => handleOpen(item.id)}
                onLongPress={() => handleLongPress(item.id, item.title, item.totalItems, item.isArchived)}
              >
                <View style={s.shopInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[s.cardTitle, { color: colors.primaryText }]}>{item.title}</Text>
                    {item.isPinned && (
                      <Text style={{ fontSize: 14, marginLeft: 6 }}>📌</Text>
                    )}
                    {item.isArchived && (
                      <Text style={{ fontSize: 14, marginLeft: 6, color: colors.mutedText }}>archived</Text>
                    )}
                  </View>
                  <Text style={[s.shopItems, { color: colors.tertiaryText }]}>
                    {item.remainingItems} remaining
                  </Text>
                </View>
                <TouchableOpacity
                  style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                  onPress={() => handleTogglePin(item.id, item.isPinned)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={{ fontSize: 16, color: item.isPinned ? colors.primaryText : colors.mutedText }}>
                    📌
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedBackground>
  );
}
