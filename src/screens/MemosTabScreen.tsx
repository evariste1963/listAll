import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme, ThemedBackground } from '../styles/theme';
import { useThemedStyles } from '../styles/useThemedStyles';
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
  const s = useThemedStyles();

  const searchInputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
      setSelectedTag(null);
    }, [])
  );

  const result = useLiveQuery(db.select().from(schema.memoList).orderBy(schema.memoList.createdAt));

  const itemsResult = useLiveQuery(db.select().from(schema.memoItem));

  const allTags = useMemo(() => {
    if (!result.data) return [];
    const tagSet = new Set<string>();
    for (const list of result.data) {
      if (list.tags) {
        list.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => tagSet.add(t));
      }
    }
    return Array.from(tagSet).sort();
  }, [result.data]);

  useEffect(() => {
    if (selectedTag && !allTags.includes(selectedTag)) {
      setSelectedTag(null);
    }
  }, [allTags, selectedTag]);

  const memos = useMemo(() => {
    if (!result.data || !itemsResult.data) return [];

    let lists = result.data;
    const allItems = itemsResult.data;

    if (!showArchived) {
      lists = lists.filter(l => !l.isArchived);
    }

    if (selectedTag) {
      lists = lists.filter(l => (l.tags ?? '').split(',').map(t => t.trim()).includes(selectedTag));
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
  }, [result.data, itemsResult.data, searchQuery, showArchived, selectedTag]);

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

    buttons.push({
      text: 'Delete',
      style: 'destructive',
      onPress: () => handleDelete(listId, title, itemCount),
    });

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

        <View style={[s.searchBar, { backgroundColor: colors.inputBackground, borderColor: isFocused ? colors.accentColor : colors.dividerColor }]}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            ref={searchInputRef}
            style={[s.searchInput, { color: colors.primaryText }]}
            placeholder="Search memos..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={s.clearButton}
              onPress={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
            >
              <Text style={[s.clearButtonText, { color: colors.mutedText }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {allTags.length > 0 && (
          <View style={{ paddingVertical: 6, paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
            <TouchableOpacity
              style={[s.tagFilterChip, { backgroundColor: !selectedTag ? colors.accentColor : colors.cardBackground }]}
              onPress={() => setSelectedTag(null)}
            >
              <Text style={[s.tagFilterChipText, { color: !selectedTag ? colors.accentText : colors.secondaryText }]}>All</Text>
            </TouchableOpacity>
            {allTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[s.tagFilterChip, { backgroundColor: selectedTag === tag ? colors.accentColor : colors.cardBackground }]}
                onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                <Text style={[s.tagFilterChipText, { color: selectedTag === tag ? colors.accentText : colors.secondaryText }]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {hasArchived && (
          <TouchableOpacity
            style={{ paddingVertical: 6, paddingHorizontal: 16, alignItems: 'center' }}
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
              {searchQuery.trim() || selectedTag ? 'No Results' : showArchived ? 'No Archived Memos' : 'No Memos Yet'}
            </Text>
            <Text style={[s.emptySubtitle, { color: colors.tertiaryText }]}>
              {searchQuery.trim() ? 'Try a different search' : selectedTag ? 'Try a different filter' : showArchived ? 'Archive a memo to see it here' : 'Create a memo to remember things'}
            </Text>
            {!searchQuery.trim() && !showArchived && !selectedTag && (
              <TouchableOpacity style={[s.createButton, { backgroundColor: colors.accentColor }]} onPress={handleCreate}>
                <Text style={[s.createButtonText, { color: colors.accentText }]}>+ Create Memo</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={memos}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[s.list, { paddingTop: 10 }]}
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
                    {item.isArchived && (
                      <Text style={{ fontSize: 14, marginLeft: 6, color: colors.mutedText }}>archived</Text>
                    )}
                  </View>
                  <Text style={[s.shopItems, { color: colors.tertiaryText }]}>
                    {item.remainingItems} remaining
                  </Text>
                </View>
                <TouchableOpacity
                  style={{ paddingHorizontal: 8, paddingVertical: 4, opacity: item.isPinned ? 1 : 0.35 }}
                  onPress={() => handleTogglePin(item.id, item.isPinned)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={{ fontSize: 16 }}>
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
