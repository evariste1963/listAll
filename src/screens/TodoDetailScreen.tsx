import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme, ThemedBackground } from '../styles/theme';
import { createThemedStyles } from '../styles/global';
import { eq } from 'drizzle-orm';
import type { TodoDetailProps } from '../navigation/types';
import { usePreferences } from '../preferences/provider';
import { scheduleTodoNotifications, cancelTodoNotifications } from '../notifications';

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
  const db = useDB();
  const { colors } = useTheme();
  const { notificationIntervals } = usePreferences();
  const s = createThemedStyles(colors);
  const { listId } = route.params;

  const [newItemText, setNewItemText] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);
  const [newPriority, setNewPriority] = useState<Priority>(null);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemText, setEditItemText] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>(null);
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);
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

  const list = listResult.data?.[0] ?? null;

  const items = useMemo<TodoItemType[]>(() => {
    if (!itemsResult.data) return [];
    return itemsResult.data.map((item: any) => ({
      ...item,
      dueDateFormatted: item.dueDate
        ? new Date(item.dueDate).toLocaleDateString()
        : undefined
    })).sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate - b.dueDate;
    });
  }, [itemsResult.data]);

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const maxOrder = items.length;
    const dueDateTimestamp = newDueDate ? newDueDate.getTime() : null;
    const result = await db.insert(schema.todoItem).values({
      listId,
      title: newItemText.trim(),
      isDone: false,
      dueDate: dueDateTimestamp,
      priority: newPriority,
      order: maxOrder + 1,
    }).run();

    const insertedId = result.lastInsertRowId as number;
    if (dueDateTimestamp && insertedId) {
      scheduleTodoNotifications(insertedId, newItemText.trim(), dueDateTimestamp, notificationIntervals).catch(() => {});
    }

    setNewItemText('');
    setNewDueDate(null);
    setNewPriority(null);
    setShowAddModal(false);
  };

  const handleToggleItem = async (itemId: number, currentDone: boolean | null) => {
    const newDone = !currentDone;
    await db.update(schema.todoItem)
      .set({ isDone: newDone })
      .where(eq(schema.todoItem.id, itemId))
      .run();
    if (newDone) {
      cancelTodoNotifications(itemId).catch(() => {});
    } else {
      const item = items.find(i => i.id === itemId);
      if (item?.dueDate) {
        scheduleTodoNotifications(itemId, item.title, item.dueDate, notificationIntervals).catch(() => {});
      }
    }
  };

  const handleDeleteItem = (itemId: number) => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            cancelTodoNotifications(itemId).catch(() => {});
            await db.delete(schema.todoItem).where(eq(schema.todoItem.id, itemId)).run();
          },
        },
      ]
    );
  };

  const handleEditItem = (item: TodoItemType) => {
    setEditItemId(item.id);
    setEditItemText(item.title);
    setEditPriority(item.priority as Priority);
    setEditDueDate(item.dueDate ? new Date(item.dueDate) : null);
  };

  const handleSaveEdit = async () => {
    if (editItemId && editItemText.trim()) {
      const newDueDateTimestamp = editDueDate ? editDueDate.getTime() : null;
      await db.update(schema.todoItem)
        .set({
          title: editItemText.trim(),
          priority: editPriority,
          dueDate: newDueDateTimestamp
        })
        .where(eq(schema.todoItem.id, editItemId))
        .run();
      if (newDueDateTimestamp) {
        scheduleTodoNotifications(editItemId, editItemText.trim(), newDueDateTimestamp, notificationIntervals).catch(() => {});
      } else {
        cancelTodoNotifications(editItemId).catch(() => {});
      }
    }
    setEditItemId(null);
    setEditItemText('');
    setEditPriority(null);
    setEditDueDate(null);
  };

  const startEditing = () => { setTitle(list.title); setEditTitle(true); };

  const handleUpdateTitle = async () => {
    if (title.trim() && list) {
      await db.update(schema.todoList)
        .set({ title: title.trim() })
        .where(eq(schema.todoList.id, listId))
        .run();
      setEditTitle(false);
    }
  };

  if (!list) {
    return (
      <ThemedBackground colors={colors}>
        <SafeAreaView style={s.container}>
          <Text style={[s.loadingText, { color: colors.primaryText }]}>Loading...</Text>
        </SafeAreaView>
      </ThemedBackground>
    );
  }

  const remainingCount = items.filter(i => !i.isDone).length;

  const getPriorityColorFn = (priority: string | null) => {
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
          {editTitle ? (
            <TextInput
              style={[s.titleInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
              value={title}
              onChangeText={setTitle}
              onBlur={handleUpdateTitle}
              onSubmitEditing={handleUpdateTitle}
              autoFocus
            />
          ) : (
            <TouchableOpacity style={{ flex: 1 }} onPress={startEditing}>
              <Text style={[s.headerTitle, { color: colors.primaryText }]}>{list.title}</Text>
            </TouchableOpacity>
          )}
          <Text style={[s.countText, { color: colors.secondaryText }]}>{remainingCount} remaining</Text>
        </View>

        <TouchableOpacity
          style={[s.addItemButton, { backgroundColor: colors.inputBackground }]}
          onPress={() => {
            setNewDueDate(null);
            setPickerDate(new Date());
            setShowAddModal(true);
          }}
        >
          <Text style={[s.addItemButtonText, { color: colors.accentColor }]}>+ Add Todo</Text>
        </TouchableOpacity>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[s.itemRowStart, { borderBottomColor: colors.cardBackground }]}>
              <TouchableOpacity
                style={[s.checkbox, { marginTop: 4 }]}
                onPress={() => handleToggleItem(item.id, item.isDone)}
              >
                <Text style={item.isDone ? [s.checkboxChecked, { color: colors.completedColor }] : [s.checkboxUnchecked, { color: colors.secondaryText }]}>
                  {item.isDone ? '✓' : '○'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.itemTitle}
                onPress={() => handleEditItem(item)}
              >
                <Text style={[s.itemText, { color: colors.primaryText, marginBottom: 4 }, item.isDone && { color: colors.mutedText, textDecorationLine: 'line-through' }]}>
                  {item.title}
                </Text>
                <View style={s.itemMeta}>
                  {item.dueDateFormatted && (
                    <Text style={[s.dueDate, { color: colors.tertiaryText }]}>{item.dueDateFormatted}</Text>
                  )}
                  {item.priority && (
                    <View style={[s.priorityBadge, { backgroundColor: getPriorityColorFn(item.priority) }]}>
                      <Text style={s.priorityText}>{item.priority}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.deleteItem, { marginTop: 4 }]}
                onPress={() => handleDeleteItem(item.id)}
              >
                <Text style={[s.deleteItemText, { color: colors.deleteColor }]}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[s.emptyItems, { color: colors.mutedText }]}>No todos yet</Text>
          }
        />

        <Modal visible={showAddModal} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={[s.modalContentWide, { backgroundColor: colors.cardBackground }]}>
              <Text style={[s.modalTitle, { color: colors.primaryText }]}>Add Todo</Text>

              <TextInput
                style={[s.modalInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.mutedText}
                value={newItemText}
                onChangeText={setNewItemText}
              />

              <Text style={[s.modalLabel, { color: colors.secondaryText }]}>Priority</Text>
              <View style={s.priorityRow}>
                {(['low', 'medium', 'high'] as Priority[]).map(p => (
                  <TouchableOpacity
                    key={p!}
                    style={[
                      s.priorityOption,
                      { backgroundColor: colors.inputBackground },
                      newPriority === p && { backgroundColor: getPriorityColorFn(p) }
                    ]}
                    onPress={() => setNewPriority(p)}
                  >
                    <Text style={[
                      s.priorityOptionText,
                      { color: colors.secondaryText },
                      newPriority === p && { color: colors.primaryText, fontWeight: 'bold' }
                    ]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.modalLabel, { color: colors.secondaryText }]}>Due Date (optional)</Text>
              <View style={s.dateRow}>
                <TouchableOpacity
                  style={[s.dateButton, { backgroundColor: colors.inputBackground }]}
                  onPress={openDatePicker}
                >
                  <Text style={[s.dateButtonText, { color: colors.primaryText }]}>
                    {newDueDate ? newDueDate.toLocaleDateString() : 'Select date'}
                  </Text>
                </TouchableOpacity>
                {newDueDate && (
                  <TouchableOpacity onPress={() => setNewDueDate(null)}>
                    <Text style={[s.clearDateText, { color: colors.deleteColor }]}>Clear</Text>
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

              <View style={s.modalButtons}>
                <TouchableOpacity
                  style={s.modalButton}
                  onPress={() => { setShowAddModal(false); setNewItemText(''); }}
                >
                  <Text style={[s.modalButtonText, { color: colors.secondaryText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    s.modalButton,
                    s.modalButtonPrimary,
                    !newItemText.trim() && s.modalButtonDisabled,
                    { backgroundColor: colors.accentColor }
                  ]}
                  onPress={handleAddItem}
                  disabled={!newItemText.trim()}
                >
                  <Text style={[s.modalButtonTextPrimary, { color: colors.primaryText }]}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={editItemId !== null} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={[s.modalContentWide, { backgroundColor: colors.cardBackground }]}>
              <Text style={[s.modalTitle, { color: colors.primaryText }]}>Edit Todo</Text>
              <TextInput
                style={[s.modalInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
                placeholder="Todo text"
                placeholderTextColor={colors.mutedText}
                value={editItemText}
                onChangeText={setEditItemText}
                autoFocus
              />

              <Text style={[s.modalLabel, { color: colors.secondaryText }]}>Priority</Text>
              <View style={s.priorityRow}>
                {(['low', 'medium', 'high'] as Priority[]).map(p => (
                  <TouchableOpacity
                    key={p!}
                    style={[
                      s.priorityOption,
                      { backgroundColor: colors.inputBackground },
                      editPriority === p && { backgroundColor: getPriorityColorFn(p) }
                    ]}
                    onPress={() => setEditPriority(p)}
                  >
                    <Text style={[
                      s.priorityOptionText,
                      { color: colors.secondaryText },
                      editPriority === p && { color: colors.primaryText, fontWeight: 'bold' }
                    ]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.modalLabel, { color: colors.secondaryText }]}>Due Date (optional)</Text>
              <View style={s.dateRow}>
                <TouchableOpacity
                  style={[s.dateButton, { backgroundColor: colors.inputBackground }]}
                  onPress={() => { setPickerDate(editDueDate || new Date()); setShowDatePicker(true); }}
                >
                  <Text style={[s.dateButtonText, { color: colors.primaryText }]}>
                    {editDueDate ? editDueDate.toLocaleDateString() : 'Select date'}
                  </Text>
                </TouchableOpacity>
                {editDueDate && (
                  <TouchableOpacity onPress={() => setEditDueDate(null)}>
                    <Text style={[s.clearDateText, { color: colors.deleteColor }]}>Clear</Text>
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
                      setEditDueDate(selectedDate);
                      setPickerDate(selectedDate);
                      setShowDatePicker(false);
                    } else if (event.type === 'dismissed') {
                      setShowDatePicker(false);
                    }
                  }}
                />
              )}

              <View style={s.modalButtons}>
                <TouchableOpacity
                  style={s.modalButton}
                  onPress={() => { setEditItemId(null); setEditItemText(''); setEditPriority(null); setEditDueDate(null); }}
                >
                  <Text style={[s.modalButtonText, { color: colors.secondaryText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.modalButton, s.modalButtonPrimary, !editItemText.trim() && s.modalButtonDisabled, { backgroundColor: colors.accentColor }]}
                  onPress={handleSaveEdit}
                  disabled={!editItemText.trim()}
                >
                  <Text style={[s.modalButtonTextPrimary, { color: colors.primaryText }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemedBackground>
  );
}
