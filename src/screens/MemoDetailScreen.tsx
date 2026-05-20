import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme } from '../styles/theme';
import { eq } from 'drizzle-orm';
import type { MemoDetailProps } from '../navigation/types';

export default function MemoDetailScreen() {
  const route = useRoute<MemoDetailProps['route']>();
  const db = useDB();
  const { colors } = useTheme();
  const { listId } = route.params;

  const [newItemText, setNewItemText] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemText, setEditItemText] = useState('');

  const listResult = useLiveQuery(
    db.select().from(schema.memoList).where(eq(schema.memoList.id, listId))
  );

  const itemsResult = useLiveQuery(
    db.select().from(schema.memoItem)
      .where(eq(schema.memoItem.listId, listId))
      .orderBy(schema.memoItem.order)
  );

  const list = listResult.data?.[0] ?? null;
  const items = itemsResult.data ?? [];

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
    await db.update(schema.memoItem)
      .set({ isDone: !currentDone })
      .where(eq(schema.memoItem.id, itemId))
      .run();
  };

  const handleDeleteItem = (itemId: number) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await db.delete(schema.memoItem).where(eq(schema.memoItem.id, itemId)).run();
          },
        },
      ]
    );
  };

  const handleEditItem = (itemId: number, currentTitle: string) => {
    setEditItemId(itemId);
    setEditItemText(currentTitle);
  };

  const handleSaveEdit = async () => {
    if (editItemId && editItemText.trim()) {
      await db.update(schema.memoItem)
        .set({ title: editItemText.trim() })
        .where(eq(schema.memoItem.id, editItemId))
        .run();
    }
    setEditItemId(null);
    setEditItemText('');
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
        <Text style={[styles.loading, { color: colors.primaryText }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const remainingCount = items.filter(i => !i.isDone).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.dividerColor }]}>
        {editTitle ? (
          <TextInput
            style={[styles.titleInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
            value={title}
            onChangeText={setTitle}
            onBlur={handleUpdateTitle}
            onSubmitEditing={handleUpdateTitle}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setEditTitle(true)}>
            <Text style={[styles.headerTitle, { color: colors.primaryText }]}>{list.title}</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.countText, { color: colors.secondaryText }]}>{remainingCount} remaining</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.itemInput, { backgroundColor: colors.cardBackground, color: colors.primaryText }]}
          placeholder="Add note..."
          placeholderTextColor={colors.mutedText}
          value={newItemText}
          onChangeText={setNewItemText}
          onSubmitEditing={handleAddItem}
        />
        <TouchableOpacity
          style={[styles.addButton, !newItemText.trim() && styles.addButtonDisabled, { backgroundColor: colors.accentColor }]}
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
          <View style={[styles.itemRow, { borderBottomColor: colors.cardBackground }]}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleToggleItem(item.id, item.isDone)}
            >
              <Text style={item.isDone ? [styles.checkboxChecked, { color: colors.completedColor }] : [styles.checkboxUnchecked, { color: colors.secondaryText }]}>
                {item.isDone ? '✓' : '○'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.itemTitle}
              onPress={() => handleEditItem(item.id, item.title)}
            >
              <Text style={[styles.itemText, { color: colors.primaryText }, item.isDone && { color: colors.mutedText, textDecorationLine: 'line-through' }]}>
                {item.title}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteItem}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Text style={[styles.deleteItemText, { color: colors.deleteColor }]}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyItems, { color: colors.mutedText }]}>No notes yet</Text>
        }
      />

      <Modal visible={editItemId !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.primaryText }]}>Edit Note</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
              placeholder="Note text"
              placeholderTextColor={colors.mutedText}
              value={editItemText}
              onChangeText={setEditItemText}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => { setEditItemId(null); setEditItemText(''); }}
              >
                <Text style={[styles.modalButtonText, { color: colors.secondaryText }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, !editItemText.trim() && styles.modalButtonDisabled, { backgroundColor: colors.accentColor }]}
                onPress={handleSaveEdit}
                disabled={!editItemText.trim()}
              >
                <Text style={[styles.modalButtonTextPrimary, { color: colors.primaryText }]}>Save</Text>
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
  },
  loading: {
    textAlign: 'center',
    marginTop: 50,
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
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 200,
  },
  countText: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  itemInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  addButton: {
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
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
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
  },
  checkboxChecked: {
    fontSize: 24,
  },
  itemTitle: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
  },
  deleteItem: {
    padding: 8,
  },
  deleteItemText: {
    fontSize: 18,
  },
  emptyItems: {
    textAlign: 'center',
    marginTop: 32,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
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
    borderRadius: 8,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    fontSize: 16,
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
  },
});
