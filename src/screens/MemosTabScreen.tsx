import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/schema';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

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
  
  const [memos, setMemos] = useState<MemoWithCount[]>([]);

  const result = useLiveQuery(db.select().from(schema.memoList).orderBy(schema.memoList.createdAt));

  useEffect(() => {
    if (result) {
      loadMemoCounts(result);
    }
  }, [result]);

  const loadMemoCounts = async (lists: typeof schema.memoList.$inferSelect[]) => {
    const withCounts: MemoWithCount[] = [];
    for (const list of lists) {
      const items = await db.select().from(schema.memoItem)
        .where(schema.memoItem.listId.eq(list.id))
        .run();
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
            // Delete items first
            await db.delete(schema.memoItem).where(schema.memoItem.listId.eq(listId)).run();
            // Then delete list
            await db.delete(schema.memoList).where(schema.memoList.id.eq(listId)).run();
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 Memos</Text>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>

      {memos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No Memos Yet</Text>
          <Text style={styles.emptySubtitle}>Create a memo to remember things</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
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
              style={styles.memoCard}
              onPress={() => handleOpen(item.id)}
              onLongPress={() => handleDelete(item.id, item.title)}
            >
              <View style={styles.memoInfo}>
                <Text style={styles.memoTitle}>{item.title}</Text>
                <Text style={styles.memoItems}>
                  {item.remainingItems} remaining
                </Text>
              </View>
              <View style={styles.memoMeta}>
                <Text style={styles.memoDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    fontSize: 28,
    color: '#e94560',
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
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  memoCard: {
    backgroundColor: '#16213e',
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
    color: '#fff',
    marginBottom: 4,
  },
  memoItems: {
    fontSize: 14,
    color: '#888',
  },
  memoMeta: {
    alignItems: 'flex-end',
  },
  memoDate: {
    fontSize: 12,
    color: '#666',
  },
});