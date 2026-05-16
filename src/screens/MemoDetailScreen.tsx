import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, TextInputProps
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { eq, and } from 'drizzle-orm';
import type { MemoDetailProps } from '../navigation/types';

export default function MemoDetailScreen() {
  const route = useRoute<MemoDetailProps['route']>();
  const navigation = useNavigation<any>();
  const db = useDB();
  const { listId } = route.params;

  const [list, setList] = useState<typeof schema.memoList.$inferSelect | null>(null);
  const [items, setItems] = useState<typeof schema.memoItem.$inferSelect[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState('');

  const listResult = useLiveQuery(
    db.select().from(schema.memoList).where(eq(schema.memoList.id, listId))
  );

  const itemsResult = useLiveQuery(
    db.select().from(schema.memoItem)
      .where(eq(schema.memoItem.listId, listId))
      .orderBy(schema.memoItem.order)
  );

  useEffect(() => {
    if (listResult && listResult.data) {
      const data = listResult.data;
      if (data.length > 0) {
        setList(data[0]);
        setTitle(data[0].title);
      }
    }
  }, [listResult]);

  useEffect(() => {
    if (itemsResult && itemsResult.data) {
      setItems([...itemsResult.data]);
    }
  }, [itemsResult]);

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const maxOrder = items.length;
    await db.insert(schema.memoItem).values({
      listId,
      title: newItemText.trim(),
      isDone: false,
      isCheckable: false,
      order: maxOrder + 1,
    }).run();

    setNewItemText('');
  };

  const handleToggleItem = async (itemId: number, currentDone: boolean | null) => {
    const newDone = currentDone ? false : true;
    await db.update(schema.memoItem)
      .set({ isDone: newDone })
      .where(eq(schema.memoItem.id, itemId))
      .run();
  };

  const handleDeleteItem = async (itemId: number) => {
    await db.delete(schema.memoItem).where(eq(schema.memoItem.id, itemId)).run();
  };

  const handleEditItem = (itemId: number, currentTitle: string) => {
    Alert.prompt('Edit Item', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: async (newTitle?: string) => {
          if (newTitle && newTitle.trim()) {
            await db.update(schema.memoItem)
              .set({ title: newTitle.trim() })
              .where(eq(schema.memoItem.id, itemId))
              .run();
          }
        },
      },
    ], undefined, currentTitle);
  };

  const handleUpdateTitle = async () => {
    if (title.trim() && list) {
      await db.update(schema.memoList)
        .set({ title: title.trim() })
        .where(eq(schema.memoList.id, listId))
        .run();
      setEditTitle(false);
    }
  };

  if (!list) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const remainingCount = items.filter(i => !i.isDone).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {editTitle ? (
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            onBlur={handleUpdateTitle}
            onSubmitEditing={handleUpdateTitle}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setEditTitle(true)}>
            <Text style={styles.headerTitle}>{list.title}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.countText}>{remainingCount} remaining</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.itemInput}
          placeholder="Add note..."
          placeholderTextColor="#666"
          value={newItemText}
          onChangeText={setNewItemText}
          onSubmitEditing={handleAddItem}
        />
        <TouchableOpacity
          style={[styles.addButton, !newItemText.trim() && styles.addButtonDisabled]}
          onPress={handleAddItem}
          disabled={!newItemText.trim()}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleToggleItem(item.id, item.isDone)}
            >
              <Text style={item.isDone ? styles.checkboxChecked : styles.checkboxUnchecked}>
                {item.isDone ? '✓' : '○'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.itemTitle}
              onPress={() => handleEditItem(item.id, item.title)}
            >
              <Text style={[styles.itemText, item.isDone && styles.itemDone]}>
                {item.title}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteItem}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Text style={styles.deleteItemText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyItems}>No notes yet</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
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
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#0f3460',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 200,
  },
  countText: {
    color: '#aaa',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  itemInput: {
    flex: 1,
    backgroundColor: '#16213e',
    padding: 12,
    borderRadius: 8,
    color: '#fff',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#e94560',
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  checkbox: {
    marginRight: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    fontSize: 24,
    color: '#aaa',
  },
  checkboxChecked: {
    fontSize: 24,
    color: '#4ade80',
  },
  itemTitle: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
  },
  itemDone: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  deleteItem: {
    padding: 8,
  },
  deleteItemText: {
    color: '#e94560',
    fontSize: 18,
  },
  emptyItems: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
});