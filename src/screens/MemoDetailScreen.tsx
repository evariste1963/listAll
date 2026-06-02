import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal, Image, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme, ThemedBackground } from '../styles/theme';
import { createThemedStyles, spacing } from '../styles/global';
import { itemService, listService } from '../db/services';
import ItemRow from '../components/ItemRow';
import type { MemoDetailProps } from '../navigation/types';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const URL_REGEX = /^https?:\/\/.+/;

function parseOgTag(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${property}["'][^>]*>`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].replace(/&#?\w+;/g, '').trim();
  }
  return null;
}

interface LinkPreview {
  title: string;
  description: string;
  image: string | null;
}

async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ListAll/1.0)' },
    });
    const html = await response.text();
    return {
      title: parseOgTag(html, 'og:title') || parseOgTag(html, 'twitter:title') || url,
      description: parseOgTag(html, 'og:description') || parseOgTag(html, 'twitter:description') || '',
      image: parseOgTag(html, 'og:image') || parseOgTag(html, 'twitter:image') || null,
    };
  } catch {
    return { title: url, description: '', image: null };
  }
}

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
  const [editTags, setEditTags] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [linkPreviewUrl, setLinkPreviewUrl] = useState('');
  const [linkPreviewLoading, setLinkPreviewLoading] = useState(false);

  const [viewImagePath, setViewImagePath] = useState<string | null>(null);
  const [viewImageDesc, setViewImageDesc] = useState<string | null>(null);

  const [captionModal, setCaptionModal] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [pickedImagePath, setPickedImagePath] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const selectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selectTimerRef.current) clearTimeout(selectTimerRef.current);
    if (selectedItemId !== null) {
      selectTimerRef.current = setTimeout(() => setSelectedItemId(null), 10000);
    }
    return () => { if (selectTimerRef.current) clearTimeout(selectTimerRef.current); };
  }, [selectedItemId]);

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
    const text = newItemText.trim();
    if (!text) return;

    if (URL_REGEX.test(text)) {
      setLinkPreviewUrl(text);
      setLinkPreviewLoading(true);
      setNewItemText('');
      const preview = await fetchLinkPreview(text);
      setLinkPreview(preview);
      setLinkPreviewLoading(false);
      return;
    }

    const maxOrder = items.length;
    await itemService.create(db, schema.memoItem, {
      listId,
      title: text,
      isDone: false,
      order: maxOrder + 1,
    });

    setNewItemText('');
  };

  const handleConfirmLink = async () => {
    if (!linkPreview) return;
    const maxOrder = items.length;
    await itemService.create(db, schema.memoItem, {
      listId,
      title: linkPreview.title,
      isDone: false,
      order: maxOrder + 1,
      itemType: 'link',
      url: linkPreviewUrl,
      imagePath: linkPreview.image,
      description: linkPreview.description,
    });
    setLinkPreview(null);
    setLinkPreviewUrl('');
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Gallery access is required to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const sourceUri = result.assets[0].uri;
    const ext = sourceUri.split('.').pop() || 'jpg';
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const dest = `${FileSystem.documentDirectory}images/${filename}`;

    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}images`, { intermediates: true });
    await FileSystem.copyAsync({ from: sourceUri, to: dest });

    setPickedImagePath(dest);
    setCaptionText('');
    setCaptionModal(true);
  };

  const handleConfirmImage = async () => {
    if (!pickedImagePath) return;
    const maxOrder = items.length;
    await itemService.create(db, schema.memoItem, {
      listId,
      // title + description both store caption; title used as modal initial value, description rendered in ItemRow
      title: captionText.trim() || 'Image',
      isDone: false,
      order: maxOrder + 1,
      itemType: 'image',
      imagePath: pickedImagePath,
      description: captionText.trim() || null,
    });
    setPickedImagePath(null);
    setCaptionText('');
    setCaptionModal(false);
  };

  const handleToggleItem = async (itemId: number, currentDone: boolean | null) => {
    await itemService.toggleDone(db, schema.memoItem, itemId, currentDone);
  };

  const handleSelectItem = (itemId: number) => {
    setSelectedItemId(prev => prev === itemId ? null : itemId);
  };

  const handleMoveSelectedUp = async () => {
    if (selectedItemId === null) return;
    const index = items.findIndex(i => i.id === selectedItemId);
    if (index <= 0) return;
    const current = items[index];
    const above = items[index - 1];
    await itemService.update(db, schema.memoItem, current.id, { order: above.order });
    await itemService.update(db, schema.memoItem, above.id, { order: current.order });
  };

  const handleMoveSelectedDown = async () => {
    if (selectedItemId === null) return;
    const index = items.findIndex(i => i.id === selectedItemId);
    if (index < 0 || index >= items.length - 1) return;
    const current = items[index];
    const below = items[index + 1];
    await itemService.update(db, schema.memoItem, current.id, { order: below.order });
    await itemService.update(db, schema.memoItem, below.id, { order: current.order });
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
      if (item?.itemType === 'image') {
        // image: caption reads from `description` in ItemRow, not `title`
        updates.description = editItemText.trim()
      }
      if (item && item.isCheckable !== editItemCheckable) {
        updates.isCheckable = editItemCheckable;
      }
      await itemService.update(db, schema.memoItem, editItemId, updates);
    }
    setEditItemId(null);
    setEditItemText('');
  };

  const handleUpdateTags = async () => {
    if (list) {
      await listService.updateTags(db, schema.memoList, listId, tagsInput.trim());
      setEditTags(false);
    }
  };

  const handleDeleteCompleted = () => {
    const done = items.filter(i => i.isDone);
    if (done.length === 0) return;
    Alert.alert(
      'Delete Completed',
      `Delete ${done.length} completed item${done.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await itemService.removeDoneByParent(db, schema.memoItem, schema.memoItem.listId, listId);
          },
        },
      ]
    );
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
      <SafeAreaView style={s.container} edges={['left', 'right', 'bottom']}>
        <View style={{ backgroundColor: colors.cardBackground, borderBottomWidth: 1, borderBottomColor: colors.dividerColor, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {editTitle ? (
              <TextInput
                style={[s.titleInput, { backgroundColor: colors.inputBackground, color: colors.primaryText, flex: 1 }]}
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
            {items.some(i => i.isDone) && (
              <TouchableOpacity
                style={{ paddingLeft: 8 }}
                onPress={handleDeleteCompleted}
              >
                <Text style={{ fontSize: 13, color: colors.deleteColor }}>Delete done</Text>
              </TouchableOpacity>
            )}
          </View>

          {editTags ? (
            <TextInput
              style={[s.tagInput, { backgroundColor: colors.inputBackground, color: colors.primaryText, borderColor: colors.dividerColor, marginTop: 8 }]}
              value={tagsInput}
              onChangeText={setTagsInput}
              onBlur={handleUpdateTags}
              onSubmitEditing={handleUpdateTags}
              placeholder="tag1, tag2, tag3"
              placeholderTextColor={colors.mutedText}
              autoFocus
            />
          ) : (
            <TouchableOpacity
              style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', paddingTop: 8 }}
              onPress={() => { setTagsInput(list.tags ?? ''); setEditTags(true); }}
            >
              {(list.tags ?? '').split(',').map((t: string) => t.trim()).filter(Boolean).map((tag: string, i: number) => (
                <View key={i} style={[s.tagChip, { backgroundColor: colors.accentColor + '30' }]}>
                  <Text style={[s.tagChipText, { color: colors.accentColor }]}>{tag}</Text>
                </View>
              ))}
              <Text style={{ fontSize: 14, color: colors.mutedText, marginLeft: 4 }}>
                {(list.tags ?? '').trim() ? '' : '+ add tags'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.inputRow}>
          <TextInput
            style={[s.itemInput, { backgroundColor: colors.cardBackground, color: colors.primaryText }]}
            placeholder="Add note or paste a link..."
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
          <TouchableOpacity
            style={[s.addIconButton, { backgroundColor: colors.accentColor, marginLeft: 6 }]}
            onPress={handlePickImage}
          >
            <Text style={[s.addIconButtonText, { color: colors.accentText }]}>🖼</Text>
          </TouchableOpacity>
        </View>

        {items.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
            <TouchableOpacity
              style={[s.moveButton, { opacity: selectedItemId === null ? 0.4 : 1 }]}
              onPress={handleMoveSelectedUp}
              disabled={selectedItemId === null}
            >
              <Text style={[s.moveButtonText, { color: colors.secondaryText, fontSize: 24 }]}>▲</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.moveButton, { marginLeft: spacing.sm, opacity: selectedItemId === null ? 0.4 : 1 }]}
              onPress={handleMoveSelectedDown}
              disabled={selectedItemId === null}
            >
              <Text style={[s.moveButtonText, { color: colors.secondaryText, fontSize: 24 }]}>▼</Text>
            </TouchableOpacity>
            <Text style={{ marginLeft: spacing.md, fontSize: 12, color: colors.mutedText }}>
              {selectedItemId ? 'Tap ● to deselect' : 'Select ● to reorder'}
            </Text>
          </View>
        )}

        {linkPreviewLoading && (
          <View style={{ padding: spacing.lg, alignItems: 'center' }}>
            <ActivityIndicator color={colors.accentColor} />
            <Text style={{ color: colors.tertiaryText, marginTop: spacing.sm }}>Fetching preview...</Text>
          </View>
        )}

        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <ItemRow
              item={item}
              onToggle={handleToggleItem}
              isSelected={selectedItemId === item.id}
              onSelect={handleSelectItem}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onViewImage={(path, desc) => { setViewImagePath(path); setViewImageDesc(desc ?? null); }}
              colors={colors}
              s={s}
              renderMarkdown
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

        <Modal visible={linkPreview !== null} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: colors.cardBackground }]}>
              <Text style={[s.modalTitle, { color: colors.primaryText }]}>Link Preview</Text>
              {linkPreview && (
                <View>
                  {linkPreview.image && (
                    <Image
                      source={{ uri: linkPreview.image }}
                      style={{ width: '100%', height: 140, borderRadius: 8, marginBottom: spacing.md }}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={[{ color: colors.primaryText, fontSize: 16, fontWeight: '600', marginBottom: 4 }]}>
                    {linkPreview.title}
                  </Text>
                  {linkPreview.description ? (
                    <Text style={{ color: colors.secondaryText, fontSize: 14, marginBottom: 8 }}>
                      {linkPreview.description}
                    </Text>
                  ) : null}
                  <Text style={{ color: colors.mutedText, fontSize: 12, marginBottom: spacing.lg }} numberOfLines={1}>
                    {linkPreviewUrl}
                  </Text>
                </View>
              )}
              <View style={s.modalButtons}>
                <TouchableOpacity
                  style={s.modalButton}
                  onPress={() => { setLinkPreview(null); setLinkPreviewUrl(''); }}
                >
                  <Text style={[s.modalButtonText, { color: colors.secondaryText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.modalButton, s.modalButtonPrimary, { backgroundColor: colors.accentColor }]}
                  onPress={handleConfirmLink}
                >
                  <Text style={[s.modalButtonTextPrimary, { color: colors.accentText }]}>Add Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={viewImagePath !== null} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}
              onPress={() => setViewImagePath(null)}
            >
              <Text style={{ fontSize: 24, color: '#fff' }}>✕</Text>
            </TouchableOpacity>
            {viewImagePath && (
              <Image
                source={{ uri: viewImagePath }}
                style={{ width: '90%', height: '70%' }}
                resizeMode="contain"
              />
            )}
            {viewImageDesc ? (
              <Text style={{ color: '#ccc', fontSize: 15, marginTop: spacing.lg, paddingHorizontal: spacing.xxl, textAlign: 'center' }}>
                {viewImageDesc}
              </Text>
            ) : null}
          </View>
        </Modal>

        <Modal visible={captionModal} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: colors.cardBackground }]}>
              <Text style={[s.modalTitle, { color: colors.primaryText }]}>Add Caption</Text>
              {pickedImagePath && (
                <Image
                  source={{ uri: pickedImagePath }}
                  style={{ width: '100%', height: 120, borderRadius: 8, marginBottom: spacing.md }}
                  resizeMode="cover"
                />
              )}
              <TextInput
                style={[s.modalInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
                placeholder="Caption (optional)"
                placeholderTextColor={colors.mutedText}
                value={captionText}
                onChangeText={setCaptionText}
                autoFocus
              />
              <View style={s.modalButtons}>
                <TouchableOpacity
                  style={s.modalButton}
                  onPress={() => { setPickedImagePath(null); setCaptionText(''); setCaptionModal(false); }}
                >
                  <Text style={[s.modalButtonText, { color: colors.secondaryText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.modalButton, s.modalButtonPrimary, { backgroundColor: colors.accentColor }]}
                  onPress={handleConfirmImage}
                >
                  <Text style={[s.modalButtonTextPrimary, { color: colors.accentText }]}>Add Image</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemedBackground>
  );
}
