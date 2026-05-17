import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme } from '../styles/theme';
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
  const { colors } = useTheme();
  const { listId } = route.params;

  const [list, setList] = useState<typeof schema.todoList.$inferSelect | null>(null);
  const [items, setItems] = useState<TodoItemType[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);
  const [newPriority, setNewPriority] = useState<Priority>(null);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemText, setEditItemText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date | null>(null);

  const openDatePicker = () => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    setPickerDate(newDueDate || startDate);
    setShowDatePicker(true);
  };

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
    setEditItemId(itemId);
    setEditItemText(currentTitle);
  };

  const handleSaveEdit = async () => {
    if (editItemId && editItemText.trim()) {
      await db.update(schema.todoItem)
        .set({ title: editItemText.trim() })
        .where(eq(schema.todoItem.id, editItemId))
        .run();
    }
    setEditItemId(null);
    setEditItemText('');
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.text }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const remainingCount = items.filter(i => !i.isDone).length;

  const getPriorityColorFn = (priority: string | null) => {
    switch (priority) {
      case 'high': return colors.priorityHigh;
      case 'medium': return colors.priorityMedium;
      case 'low': return colors.priorityLow;
      default: return colors.textMuted;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {editTitle ? (
          <TextInput
            style={[styles.titleInput, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
            value={title}
            onChangeText={setTitle}
            onBlur={handleUpdateTitle}
            onSubmitEditing={handleUpdateTitle}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setEditTitle(true)}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{list.title}</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.countText, { color: colors.textSecondary }]}>{remainingCount} remaining</Text>
      </View>

      <TouchableOpacity
        style={[styles.addItemButton, { backgroundColor: colors.surfaceAlt }]}
        onPress={() => { 
          setNewDueDate(null); 
          setPickerDate(new Date()); 
          setShowAddModal(true); 
        }}
      >
        <Text style={[styles.addItemButtonText, { color: colors.primary }]}>+ Add Todo</Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.itemRow, { borderBottomColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleToggleItem(item.id, item.isDone)}
            >
              <Text style={item.isDone ? [styles.checkboxChecked, { color: colors.success }] : [styles.checkboxUnchecked, { color: colors.textSecondary }]}>
                {item.isDone ? '✓' : '○'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.itemTitle}
              onPress={() => handleEditItem(item.id, item.title)}
            >
              <Text style={[styles.itemText, { color: colors.text }, item.isDone && { color: colors.textMuted, textDecorationLine: 'line-through' }]}>
                {item.title}
              </Text>
              <View style={styles.itemMeta}>
                {item.dueDateFormatted && (
                  <Text style={[styles.dueDate, { color: colors.textTertiary }]}>{item.dueDateFormatted}</Text>
                )}
                {item.priority && (
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColorFn(item.priority) }]}>
                    <Text style={styles.priorityText}>{item.priority}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteItem}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Text style={[styles.deleteItemText, { color: colors.danger }]}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyItems, { color: colors.textMuted }]}>No todos yet</Text>
        }
      />

      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Todo</Text>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.textMuted}
              value={newItemText}
              onChangeText={setNewItemText}
            />

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high'] as Priority[]).map(p => (
                <TouchableOpacity
                  key={p!}
                  style={[
                    styles.priorityOption,
                    { backgroundColor: colors.surfaceAlt },
                    newPriority === p && { backgroundColor: getPriorityColorFn(p) }
                  ]}
                  onPress={() => setNewPriority(p)}
                >
                  <Text style={[
                    styles.priorityOptionText,
                    { color: colors.textSecondary },
                    newPriority === p && { color: colors.text, fontWeight: 'bold' }
                  ]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Due Date (optional)</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: colors.surfaceAlt }]}
                onPress={openDatePicker}
              >
                <Text style={[styles.dateButtonText, { color: colors.text }]}>
                  {newDueDate ? newDueDate.toLocaleDateString() : 'Select date'}
                </Text>
              </TouchableOpacity>
              {newDueDate && (
                <TouchableOpacity onPress={() => setNewDueDate(null)}>
                  <Text style={[styles.clearDateText, { color: colors.danger }]}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={pickerDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                maximumDate={new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)}
                onChange={(event, selectedDate) => {
                  if (event.type === 'set' && selectedDate) {
                    setNewDueDate(selectedDate);
                    setPickerDate(selectedDate);
                    setShowDatePicker(false);
                  } else if (event.type === 'dismissed') {
                    setShowDatePicker(false);
                  }
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => { setShowAddModal(false); setNewItemText(''); }}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  !newItemText.trim() && styles.modalButtonDisabled,
                  { backgroundColor: colors.primary }
                ]}
                onPress={handleAddItem}
                disabled={!newItemText.trim()}
              >
                <Text style={[styles.modalButtonTextPrimary, { color: colors.text }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={editItemId !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Todo</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
              placeholder="Todo text"
              placeholderTextColor={colors.textMuted}
              value={editItemText}
              onChangeText={setEditItemText}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => { setEditItemId(null); setEditItemText(''); }}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, !editItemText.trim() && styles.modalButtonDisabled, { backgroundColor: colors.primary }]}
                onPress={handleSaveEdit}
                disabled={!editItemText.trim()}
              >
                <Text style={[styles.modalButtonTextPrimary, { color: colors.text }]}>Save</Text>
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  clearDateText: {
    color: '#e94560',
    fontSize: 14,
    marginLeft: 12,
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