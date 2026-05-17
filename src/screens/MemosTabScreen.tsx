import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme } from '../styles/theme';
import { eq } from 'drizzle-orm';

interface MemoWithCount {
  id: number;
  title: string;
  createdAt: Date;
  totalItems: number;
  remainingItems: number;
}

export default function MemosTabScreen() {
  const db = useDB();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  
  const [memos, setMemos] = useState<MemoWithCount[]>([]);

  const result = useLiveQuery(db.select().from(schema.memoList).orderBy(schema.memoList.createdAt));

  useEffect(() => {
    if (result && result.data) {
      loadMemoCounts(result.data);
    }
  }, [result]);

  const loadMemoCounts = async (lists: typeof schema.memoList.$inferSelect[]) => {
    const withCounts: MemoWithCount[] = [];
    for (const list of lists) {
      const itemsResult = await db.select().from(schema.memoItem)
        .where(eq(schema.memoItem.listId, list.id))
        .get();
      
      const items = itemsResult ? [itemsResult] : [];
      const remaining = items.filter(i => !i.isDone).length;
      withCounts.push({
        ...list,
        totalItems: items.length,
        remainingItems: remaining,
      });
    }
    setMemos(withCounts);
  };

  const handleCreate = () => {
    navigation.navigate('CreateMemoList');
  };

  const handleOpen = (listId: number) => {
    navigation.navigate('MemoDetail', { listId });
  };

  const handleDelete = (listId: number, title: string) => {
    Alert.alert(
      'Delete Memo',
      `Delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await db.delete(schema.memoItem).where(eq(schema.memoItem.listId, listId)).run();
            await db.delete(schema.memoList).where(eq(schema.memoList.id, listId)).run();
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeButton}>🏠</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Memos</Text>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={[styles.addButton, { color: colors.primary }]}>+</Text>
        </TouchableOpacity>
      </View>

      {memos.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Memos Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>Create a memo to remember things</Text>
          <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.primary }]} onPress={handleCreate}>
            <Text style={styles.createButtonText}>+ Create Memo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={memos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.memoCard, { backgroundColor: colors.surface }]}
              onPress={() => handleOpen(item.id)}
              onLongPress={() => handleDelete(item.id, item.title)}
            >
              <View style={styles.memoInfo}>
                <Text style={[styles.memoTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.memoItems, { color: colors.textTertiary }]}>
                  {item.remainingItems} remaining
                </Text>
              </View>
              <View style={styles.memoMeta}>
                <Text style={[styles.memoDate, { color: colors.textMuted }]}>
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
  memoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memoInfo: {
    flex: 1,
  },
  memoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  memoItems: {
    fontSize: 14,
  },
  memoMeta: {
    alignItems: 'flex-end',
  },
  memoDate: {
    fontSize: 12,
  },
});