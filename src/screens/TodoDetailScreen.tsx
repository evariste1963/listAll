import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import type { TodoDetailProps } from '../navigation/types';

type Priority = 'low' | 'medium' | 'high' | null;

interface TodoItemType {
  id: number;
  listId: number;
  title: string;
  isDone: boolean | null;
  dueDate: number | null;
  priority: string | null;
  order: number | null;
  dueDateFormatted?: string;
}

export default function TodoDetailScreen() {
  const route = useRoute<TodoDetailProps['route']>();
  const navigation = useNavigation<any>();
  const db = useDB();
  const { listId } = route.params;

  const [list, setList] = useState<typeof schema.todoList.$inferSelect | null>(null);
  const [items, setItems] = useState<TodoItemType[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);
  const [newPriority, setNewPriority] = useState<Priority>(null);

  const listResult = useLiveQuery(
    db.select().from(schema.todoList).where(eq(schema.todoList.id, listId))
  );

  const itemsResult = useLiveQuery(
    db.select().from(schema.todoItem)
      .where(eq(schema.todoItem.listId, listId))
      .orderBy(schema.todoItem.order)
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
      const formatted = itemsResult.data.map((item: any) => ({
        ...item,
        dueDateFormatted: item.dueDate
          ? new Date(item.dueDate).toLocaleDateString()
          : undefined
      }));
      setItems(formatted);
    }
  }, [itemsResult]);

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const maxOrder = items.length;
    await db.insert(schema.todoItem).values({
      listId,
      title: newItemText.trim(),
      isDone: false,
      dueDate: newDueDate ? newDueDate.getTime() : null,
      priority: newPriority,
      order: maxOrder + 1,
    }).run();

    setNewItemText('');
    setNewDueDate(null);
    setNewPriority(null);
    setShowAddModal(false);
  };

  const handleToggleItem = async (itemId: number, currentDone: boolean | null) => {
    const newDone = currentDone ? false : true;
    await db.update(schema.todoItem)
      .set({ isDone: newDone })
      .where(eq(schema.todoItem.id, itemId))
      .run();
  };

  const handleDeleteItem = async (itemId: number) => {
    await db.delete(schema.todoItem).where(eq(schema.todoItem.id, itemId)).run();
  };

  const handleEditItem = (itemId: number, currentTitle: string) => {
    Alert.prompt('Edit Item', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: async (newTitle?: string) => {
          if (newTitle && newTitle.trim()) {
            await db.update(schema.todoItem)
              .set({ title: newTitle.trim() })
              .where(eq(schema.todoItem.id, itemId))
              .run();
          }
        },
      },
    ], undefined, currentTitle);
  };

  const handleUpdateTitle = async () => {
    if (title.trim() && list) {
      await db.update(schema.todoList)
        .set({ title: title.trim() })
        .where(eq(schema.todoList.id, listId))
        .run();
      setEditTitle(false);
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return '#e94560';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#666';
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

      <TouchableOpacity
        style={styles.addItemButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addItemButtonText}>+ Add Todo</Text>
      </TouchableOpacity>

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
              <View style={styles.itemMeta}>
                {item.dueDateFormatted && (
                  <Text style={styles.dueDate}>{item.dueDateFormatted}</Text>
                )}
                {item.priority && (
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                    <Text style={styles.priorityText}>{item.priority}</Text>
                  </View>
                )}
              </View>
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
          <Text style={styles.emptyItems}>No todos yet</Text>
        }
      />

      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Todo</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="What needs to be done?"
              placeholderTextColor="#666"
              value={newItemText}
              onChangeText={setNewItemText}
            />

            <Text style={styles.modalLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high'] as Priority[]).map(p => (
                <TouchableOpacity
                  key={p!}
                  style={[
                    styles.priorityOption,
                    newPriority === p && { backgroundColor: getPriorityColor(p) }
                  ]}
                  onPress={() => setNewPriority(p)}
                >
                  <Text style={[
                    styles.priorityOptionText,
                    newPriority === p && styles.priorityOptionTextSelected
                  ]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Due Date (optional)</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setNewDueDate(tomorrow);
              }}
            >
              <Text style={styles.dateButtonText}>
                {newDueDate ? newDueDate.toLocaleDateString() : 'Set date (tomorrow)'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => { setShowAddModal(false); setNewItemText(''); }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  !newItemText.trim() && styles.modalButtonDisabled
                ]}
                onPress={handleAddItem}
                disabled={!newItemText.trim()}
              >
                <Text style={styles.modalButtonTextPrimary}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addItemButton: {
    margin: 16,
    backgroundColor: '#0f3460',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addItemButtonText: {
    color: '#e94560',
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginTop: 4,
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
    marginBottom: 4,
  },
  itemDone: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dueDate: {
    fontSize: 12,
    color: '#888',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  deleteItem: {
    padding: 8,
    marginTop: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#0f3460',
    padding: 12,
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  modalLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityOption: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#0f3460',
    alignItems: 'center',
  },
  priorityOptionText: {
    color: '#aaa',
    textTransform: 'capitalize',
  },
  priorityOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: '#0f3460',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  modalButtonPrimary: {
    backgroundColor: '#e94560',
    borderRadius: 8,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: '#aaa',
    fontSize: 16,
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});