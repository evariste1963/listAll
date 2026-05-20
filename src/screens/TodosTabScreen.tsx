import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme, ThemedBackground } from '../styles/theme';
import { createThemedStyles } from '../styles/global';
import { eq } from 'drizzle-orm';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TodoWithCount {
  id: number;
  title: string;
  createdAt: Date;
  totalItems: number;
  remainingItems: number;
  remainingHigh: number;
  remainingMedium: number;
  remainingLow: number;
}

interface TodosTabScreenProps {
  onTabChange?: (index: number, animated?: boolean) => void;
}

export default function TodosTabScreen({ onTabChange }: TodosTabScreenProps = {}) {
  const db = useDB();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const s = createThemedStyles(colors);
  
  const [todos, setTodos] = useState<TodoWithCount[]>([]);

  const result = useLiveQuery(db.select().from(schema.todoList).orderBy(schema.todoList.createdAt));

  const loadTodoCounts = async (lists: typeof schema.todoList.$inferSelect[]) => {
    const withCounts: TodoWithCount[] = [];
    for (const list of lists) {
      const items = await db.select().from(schema.todoItem)
        .where(eq(schema.todoItem.listId, list.id))
        .all();
      
      const remainingItems = items.filter(i => !i.isDone);
      const remaining = remainingItems.length;
      const remainingHigh = remainingItems.filter(i => i.priority === 'high').length;
      const remainingMedium = remainingItems.filter(i => i.priority === 'medium').length;
      const remainingLow = remainingItems.filter(i => i.priority === 'low').length;
      withCounts.push({
        ...list,
        totalItems: items.length,
        remainingItems: remaining,
        remainingHigh,
        remainingMedium,
        remainingLow,
      });
    }
    setTodos(withCounts);
  };

  useFocusEffect(
    useCallback(() => {
      if (result && result.data) {
        loadTodoCounts(result.data);
      }
    }, [result])
  );

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
            await db.delete(schema.todoItem).where(eq(schema.todoItem.listId, listId)).run();
            await db.delete(schema.todoList).where(eq(schema.todoList.id, listId)).run();
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

        {todos.length === 0 ? (
          <View style={s.emptyState}>
            <View style={[s.emptyIconContainer, { backgroundColor: colors.priorityLow }]}>
              <Text style={s.emptyIconLarge}>✓</Text>
            </View>
            <Text style={[s.emptyTitle, { color: colors.primaryText }]}>No Todo Lists Yet</Text>
            <Text style={[s.emptySubtitle, { color: colors.tertiaryText }]}>Create a todo list to track tasks</Text>
            <TouchableOpacity style={[s.createButton, { backgroundColor: colors.accentColor }]} onPress={handleCreate}>
              <Text style={s.createButtonText}>+ Create Todo List</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={s.list}
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
                  <View style={s.priorityRow}>
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
