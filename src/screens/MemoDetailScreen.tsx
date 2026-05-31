import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme, ThemedBackground } from '../styles/theme';
import { createThemedStyles } from '../styles/global';
import { itemService, listService } from '../db/services';
import ItemRow from '../components/ItemRow';
import type { MemoDetailProps } from '../navigation/types';

export default function MemoDetailScreen() {
  const route = useRoute<MemoDetailProps['route']>();
  const db = useDB();
  const { colors } = useTheme();
  const s = createThemedStyles(colors);
  const { listId } = route.params;

  const [newItemText, setNewItemText] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemText, setEditItemText] = useState('');
  const [editItemCheckable, setEditItemCheckable] = useState(false);

  const editInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (editItemId !== null) editInputRef.current?.focus();
  }, [editItemId]);

  const listResult = useLiveQuery(
    listService.getById(db, schema.memoList, listId)
  );

  const itemsResult = useLiveQuery(
    itemService.getByParentId(db, schema.memoItem, schema.memoItem.listId, listId)
  );

  const list = listResult.data?.[0] ?? null;
  const items: any[] = itemsResult.data ?? [];

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const maxOrder = items.length;
    await itemService.create(db, schema.memoItem, {
      listId,
      title: newItemText.trim(),
      isDone: false,
      order: maxOrder + 1,
    });

    setNewItemText('');
  };

  const handleToggleItem = async (itemId: number, currentDone: boolean | null) => {
    await itemService.toggleDone(db, schema.memoItem, itemId, currentDone);
  };

  const handleToggleCheckable = async (itemId: number, currentCheckable: boolean | null) => {
    await itemService.toggleCheckable(db, schema.memoItem, itemId, currentCheckable);
  };

  const handleMoveUp = async (itemId: number) => {
    const index = items.findIndex(i => i.id === itemId);
    if (index <= 0) return;
    const current = items[index];
    const above = items[index - 1];
    const tempOrder = current.order;
    await itemService.update(db, schema.memoItem, current.id, { order: above.order });
    await itemService.update(db, schema.memoItem, above.id, { order: tempOrder });
  };

  const handleMoveDown = async (itemId: number) => {
    const index = items.findIndex(i => i.id === itemId);
    if (index < 0 || index >= items.length - 1) return;
    const current = items[index];
    const below = items[index + 1];
    const tempOrder = current.order;
    await itemService.update(db, schema.memoItem, current.id, { order: below.order });
    await itemService.update(db, schema.memoItem, below.id, { order: tempOrder });
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
            await itemService.remove(db, schema.memoItem, itemId);
          },
        },
      ]
    );
  };

  const handleEditItem = (itemId: number, currentTitle: string) => {
    const item = items.find(i => i.id === itemId);
    setEditItemId(itemId);
    setEditItemText(currentTitle);
    setEditItemCheckable(item?.isCheckable ?? false);
  };

  const handleSaveEdit = async () => {
    if (editItemId && editItemText.trim()) {
      const item = items.find(i => i.id === editItemId);
      const updates: any = { title: editItemText.trim() };
      if (item && item.isCheckable !== editItemCheckable) {
        updates.isCheckable = editItemCheckable;
      }
      await itemService.update(db, schema.memoItem, editItemId, updates);
    }
    setEditItemId(null);
    setEditItemText('');
  };

  const startEditing = () => { setTitle(list.title); setEditTitle(true); };

  const handleUpdateTitle = async () => {
    if (title.trim() && list) {
      await listService.updateTitle(db, schema.memoList, listId, title.trim());
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

        <View style={s.inputRow}>
          <TextInput
            style={[s.itemInput, { backgroundColor: colors.cardBackground, color: colors.primaryText }]}
            placeholder="Add note..."
            placeholderTextColor={colors.mutedText}
            value={newItemText}
            onChangeText={setNewItemText}
            onSubmitEditing={handleAddItem}
          />
          <TouchableOpacity
            style={[s.addIconButton, !newItemText.trim() && s.buttonDisabled, { backgroundColor: colors.accentColor }]}
            onPress={handleAddItem}
            disabled={!newItemText.trim()}
          >
            <Text style={[s.addIconButtonText, { color: colors.accentText }]}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <ItemRow
              item={item}
              onToggle={handleToggleItem}
              onToggleCheckable={handleToggleCheckable}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              colors={colors}
              s={s}
            />
          )}
          ListEmptyComponent={
            <Text style={[s.emptyItems, { color: colors.mutedText }]}>No notes yet</Text>
          }
        />

        <Modal visible={editItemId !== null} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: colors.cardBackground }]}>
              <Text style={[s.modalTitle, { color: colors.primaryText }]}>Edit Note</Text>
              <TextInput
                ref={editInputRef}
                style={[s.modalInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
                placeholder="Note text"
                placeholderTextColor={colors.mutedText}
                value={editItemText}
                onChangeText={setEditItemText}
                autoFocus
              />
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
                onPress={() => setEditItemCheckable(!editItemCheckable)}
              >
                <Text style={{ fontSize: 18, marginRight: 10, color: colors.secondaryText }}>
                  {editItemCheckable ? '☑' : '☐'}
                </Text>
                <Text style={{ fontSize: 15, color: colors.primaryText }}>Checklist item</Text>
              </TouchableOpacity>

              <View style={s.modalButtons}>
                <TouchableOpacity
                  style={s.modalButton}
                  onPress={() => { setEditItemId(null); setEditItemText(''); }}
                >
                  <Text style={[s.modalButtonText, { color: colors.secondaryText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.modalButton, s.modalButtonPrimary, !editItemText.trim() && s.modalButtonDisabled, { backgroundColor: colors.accentColor }]}
                  onPress={handleSaveEdit}
                  disabled={!editItemText.trim()}
                >
                  <Text style={[s.modalButtonTextPrimary, { color: colors.accentText }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemedBackground>
  );
}
