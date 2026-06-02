import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme, ThemedBackground } from '../styles/theme';
import { createThemedStyles } from '../styles/global';
import { listService } from '../db/services';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TodosTabScreenProps {
  onTabChange?: (index: number, animated?: boolean) => void;
}

export default function TodosTabScreen({ onTabChange }: TodosTabScreenProps = {}) {
  const db = useDB();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const s = createThemedStyles(colors);

  const searchInputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
    }, [])
  );

  const result = useLiveQuery(db.select().from(schema.todoList).orderBy(schema.todoList.createdAt));

  const itemsResult = useLiveQuery(db.select().from(schema.todoItem));

  const todos = useMemo(() => {
    if (!result.data || !itemsResult.data) return [];
    let lists = result.data;
    const allItems = itemsResult.data;

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

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return lists.map(list => {
      const listItems = allItems.filter(i => i.listId === list.id);
      const remaining = listItems.filter(i => !i.isDone);
      return {
        ...list,
        totalItems: listItems.length,
        remainingItems: remaining.length,
        remainingHigh: remaining.filter(i => i.priority === 'high').length,
        remainingMedium: remaining.filter(i => i.priority === 'medium').length,
        remainingLow: remaining.filter(i => i.priority === 'low').length,
        remainingOverdue: remaining.filter(i => i.dueDate && new Date(i.dueDate) < startOfToday).length,
      };
    });
  }, [result.data, itemsResult.data, searchQuery]);

  const handleCreate = () => {
    navigation.navigate('CreateTodoList');
  };

  const handleOpen = (listId: number) => {
    navigation.navigate('TodoDetail', { listId });
  };

  const handleDelete = (listId: number, title: string, itemCount: number) => {
    if (itemCount > 0) {
      Alert.alert(
        'Cannot Delete Todo List',
        `"${title}" has ${itemCount} item${itemCount > 1 ? 's' : ''}. Delete all items first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Todo List',
      `Delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await listService.cascadeDelete(db, schema.todoList, schema.todoItem, listId, schema.todoItem.listId);
          }
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.priorityHigh;
      case 'medium': return colors.priorityMedium;
      case 'low': return colors.priorityLow;
      default: return colors.mutedText;
    }
  };

  return (
    <ThemedBackground colors={colors}>
      <SafeAreaView style={s.container}>
        <View style={[s.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.dividerColor }]}>
          <TouchableOpacity onPress={() => onTabChange?.(0, false)}>
            <Text style={s.homeButton}>🏠</Text>
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.primaryText }]}>Todos</Text>
          <TouchableOpacity onPress={handleCreate}>
            <Text style={[s.addButton, { color: colors.accentColor }]}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={[s.searchBar, { backgroundColor: colors.inputBackground, borderColor: isFocused ? colors.accentColor : colors.dividerColor }]}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            ref={searchInputRef}
            style={[s.searchInput, { color: colors.primaryText }]}
            placeholder="Search todos..."
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

        {todos.length === 0 ? (
          <View style={s.emptyState}>
            <View style={[s.emptyIconContainer, { backgroundColor: colors.priorityLow }]}>
              <Text style={s.emptyIconLarge}>✓</Text>
            </View>
            <Text style={[s.emptyTitle, { color: colors.primaryText }]}>
              {searchQuery.trim() ? 'No Results' : 'No Todo Lists Yet'}
            </Text>
            <Text style={[s.emptySubtitle, { color: colors.tertiaryText }]}>
              {searchQuery.trim() ? 'Try a different search' : 'Create a todo list to track tasks'}
            </Text>
            {!searchQuery.trim() && (
              <TouchableOpacity style={[s.createButton, { backgroundColor: colors.accentColor }]} onPress={handleCreate}>
                <Text style={[s.createButtonText, { color: colors.accentText }]}>+ Create Todo List</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[s.list, { paddingTop: 10 }]}
            style={{ flex: 1 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.card, s.cardRow, { backgroundColor: colors.cardBackground }]}
                onPress={() => handleOpen(item.id)}
                onLongPress={() => handleDelete(item.id, item.title, item.totalItems)}
              >
                <View style={s.shopInfo}>
                  <Text style={[s.cardTitle, { color: colors.primaryText }]}>{item.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.shopItems, { color: colors.tertiaryText }]}>
                        {item.remainingItems} remaining
                      </Text>
                      <View style={s.priorityRow}>
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                          {item.remainingHigh > 0 && (
                            <View style={[s.priorityBadge, { backgroundColor: getPriorityColor('high') }]}>
                              <Text style={s.priorityText}>{item.remainingHigh}</Text>
                            </View>
                          )}
                          {item.remainingMedium > 0 && (
                            <View style={[s.priorityBadge, { backgroundColor: getPriorityColor('medium') }]}>
                              <Text style={s.priorityText}>{item.remainingMedium}</Text>
                            </View>
                          )}
                          {item.remainingLow > 0 && (
                            <View style={[s.priorityBadge, { backgroundColor: getPriorityColor('low') }]}>
                              <Text style={s.priorityText}>{item.remainingLow}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    {item.remainingOverdue > 0 && (
                      <TouchableOpacity
                        onPress={() => navigation.navigate('TodoDetail', { listId: item.id, filter: 'overdue' })}
                        style={{ justifyContent: 'center' }}
                      >
                        <View style={[s.overdueBadge, { backgroundColor: colors.priorityOverdue }]}>
                          <Text style={s.overdueIcon}>⚠️</Text>
                          <Text style={s.overdueText}>{item.remainingOverdue}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedBackground>
  );
}
