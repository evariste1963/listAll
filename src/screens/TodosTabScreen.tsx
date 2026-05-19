import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme } from '../styles/theme';
import { eq } from 'drizzle-orm';

interface TodoWithCount {
  id: number;
  title: string;
  createdAt: Date;
  totalItems: number;
  remainingItems: number;
}

interface TodosTabScreenProps {
  onTabChange?: (index: number, animated?: boolean) => void;
  isHomeTab?: boolean;
}

export default function TodosTabScreen({ onTabChange }: TodosTabScreenProps = {}) {
  const db = useDB();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  
  const [todos, setTodos] = useState<TodoWithCount[]>([]);

  const result = useLiveQuery(db.select().from(schema.todoList).orderBy(schema.todoList.createdAt));

  useEffect(() => {
    if (result && result.data) {
      loadTodoCounts(result.data);
    }
  }, [result?.data]);

  const loadTodoCounts = async (lists: typeof schema.todoList.$inferSelect[]) => {
    const withCounts: TodoWithCount[] = [];
    for (const list of lists) {
      const items = await db.select().from(schema.todoItem)
        .where(eq(schema.todoItem.listId, list.id))
        .all();
      
      const remaining = items.filter(i => !i.isDone).length;
      withCounts.push({
        ...list,
        totalItems: items.length,
        remainingItems: remaining,
      });
    }
    setTodos(withCounts);
  };

  const handleCreate = () => {
    navigation.navigate('CreateTodoList');
  };

  const handleOpen = (listId: number) => {
    navigation.navigate('TodoDetail', { listId });
  };

  const handleDelete = (listId: number, title: string) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.dividerColor }]}>
        <TouchableOpacity onPress={() => onTabChange?.(0, false)}>
          <Text style={styles.homeButton}>🏠</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Todos</Text>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={[styles.addButton, { color: colors.accentColor }]}>+</Text>
        </TouchableOpacity>
      </View>

      {todos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={[styles.emptyTitle, { color: colors.primaryText }]}>No Todo Lists Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.tertiaryText }]}>Create a todo list to track tasks</Text>
          <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.accentColor }]} onPress={handleCreate}>
            <Text style={styles.createButtonText}>+ Create Todo List</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.todoCard, { backgroundColor: colors.cardBackground }]}
              onPress={() => handleOpen(item.id)}
              onLongPress={() => handleDelete(item.id, item.title)}
            >
              <View style={styles.todoInfo}>
                <Text style={[styles.todoTitle, { color: colors.primaryText }]}>{item.title}</Text>
                <Text style={[styles.todoItems, { color: colors.tertiaryText }]}>
                  {item.remainingItems} remaining
                </Text>
              </View>
              <View style={styles.todoMeta}>
                <Text style={[styles.todoDate, { color: colors.mutedText }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  homeButton: {
    fontSize: 24,
  },
  addButton: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  todoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todoInfo: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  todoItems: {
    fontSize: 14,
  },
  todoMeta: {
    alignItems: 'flex-end',
  },
  todoDate: {
    fontSize: 12,
  },
});