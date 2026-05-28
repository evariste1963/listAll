import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  Alert, ScrollView, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme, ThemedBackground } from '../styles/theme';
import { createThemedStyles } from '../styles/global';
import { eq } from 'drizzle-orm';
import { itemService, listService } from '../db/services';
import ItemRow from '../components/ItemRow';
import type { ShoppingDetailProps } from '../navigation/types';

export default function ShoppingDetailScreen() {
  const route = useRoute<ShoppingDetailProps['route']>();
  const db = useDB();
  const { colors } = useTheme();
  const s = createThemedStyles(colors);
  const { listId, activeTabId: initialActiveTabId, showAddShop: initialShowAddShop } = route.params;

  const [activeTabId, setActiveTabId] = useState<number | null>(initialActiveTabId || null);
  const [newItemText, setNewItemText] = useState('');
  const [showAddShop, setShowAddShop] = useState(initialShowAddShop || false);
  const [newShopName, setNewShopName] = useState('');
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemText, setEditItemText] = useState('');

  const addShopRef = useRef<TextInput>(null);
  const editItemRef = useRef<TextInput>(null);

  useEffect(() => {
    if (showAddShop) addShopRef.current?.focus();
  }, [showAddShop]);

  useEffect(() => {
    if (editItemId !== null) editItemRef.current?.focus();
  }, [editItemId]);

  const listResult = useLiveQuery(
    listService.getById(db, schema.shoppingList, listId)
  );

  const shopsResult = useLiveQuery(
    db.select().from(schema.shopTab)
      .where(eq(schema.shopTab.listId, listId))
      .orderBy(schema.shopTab.order)
  );

  const itemsResult = useLiveQuery(
    db.select().from(schema.shoppingItem).orderBy(schema.shoppingItem.order)
  );

  const list = listResult.data?.[0] ?? null;

  const shops = useMemo(() => {
    if (!shopsResult.data) return [];
    return shopsResult.data.map(shop => ({
      ...shop,
      items: (itemsResult.data ?? []).filter(i => i.shopTabId === shop.id),
    }));
  }, [shopsResult.data, itemsResult.data]);

  useEffect(() => {
    if (shops.length > 0) {
      if (activeTabId === null || !shops.some(s => s.id === activeTabId)) {
        setActiveTabId(
          initialActiveTabId && shops.find(s => s.id === initialActiveTabId)
            ? initialActiveTabId
            : shops[0].id
        );
      }
    } else {
      setActiveTabId(null);
    }
  }, [shops]);

  const activeShop = shops.find(s => s.id === activeTabId);
  const totalItems = shops.reduce((sum, s) => sum + (s.items?.length || 0), 0);
  const remainingItems = shops.reduce((sum, s) => sum + (s.items?.filter(i => !i.isDone).length || 0), 0);

  const handleAddItem = async () => {
    if (!newItemText.trim() || !activeTabId) return;

    const newItemLower = newItemText.trim().toLowerCase();

    const existingItem = activeShop?.items?.find(
      item => item.title.toLowerCase() === newItemLower
    );

    if (existingItem) {
      Alert.alert('Item Already Exists', `"${existingItem.title}" is already in this shop's list.`);
      setNewItemText('');
      return;
    }

    const maxOrder = activeShop?.items?.length || 0;
    await itemService.create(db, schema.shoppingItem, {
      shopTabId: activeTabId,
      title: newItemText.trim(),
      isDone: false,
      order: maxOrder + 1,
    });

    setNewItemText('');
  };

  const handleToggleItem = async (itemId: number, currentDone: boolean | null) => {
    await itemService.toggleDone(db, schema.shoppingItem, itemId, currentDone);
  };

  const handleDeleteItem = (itemId: number) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await itemService.remove(db, schema.shoppingItem, itemId);
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
      await itemService.update(db, schema.shoppingItem, editItemId, { title: editItemText.trim() });
    }
    setEditItemId(null);
    setEditItemText('');
  };

  const handleAddShop = async () => {
    if (!newShopName.trim()) return;

    const trimmedName = newShopName.trim();
    const existingShops = await db.select()
      .from(schema.shopTab)
      .where(eq(schema.shopTab.listId, listId))
      .all();

    const duplicate = existingShops.find(
      shop => shop.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      Alert.alert('Shop Already Exists', `"${duplicate.name}" already exists in this list.`);
      return;
    }

    const maxOrder = shops.length;
    const result = await db.insert(schema.shopTab).values({
      listId,
      name: trimmedName,
      order: maxOrder + 1,
    }).returning();

    const newShopId = result[0]?.id;

    setNewShopName('');
    setShowAddShop(false);
    if (newShopId) {
      setActiveTabId(newShopId);
    }
  };

  const handleDeleteShop = async (shopId: number, shopName: string, itemCount: number) => {
    if (itemCount > 0) {
      Alert.alert(
        'Cannot Delete Shop',
        `"${shopName}" has ${itemCount} item${itemCount > 1 ? 's' : ''} in its list. Delete all items first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const defaults = await db.select().from(schema.defaultShop).all();
    const isDefault = defaults.some(d => d.name.toLowerCase() === shopName.toLowerCase());

    if (isDefault) {
      Alert.alert(
        'Cannot Delete Shop',
        `"${shopName}" is a default shop. Remove it from defaults first in the summary page.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Shop',
      `Delete "${shopName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await db.delete(schema.shopTab).where(eq(schema.shopTab.id, shopId)).run();
            if (activeTabId === shopId) {
              setActiveTabId(shops.find(s => s.id !== shopId)?.id || null);
            }
          }
        },
      ]
    );
  };

  const handleDeleteCompleted = async () => {
    if (!activeShop || !activeShop.items) return;
    const completedIds = activeShop.items.filter(i => i.isDone).map(i => i.id);
    if (completedIds.length === 0) return;
    await itemService.removeByIds(db, schema.shoppingItem, completedIds);
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

  return (
    <ThemedBackground colors={colors}>
      <SafeAreaView style={s.container} edges={['left', 'right', 'bottom']}>
        <View style={[s.headerCenter, { backgroundColor: colors.pageBackground, borderBottomColor: colors.dividerColor }]}>
          <Text style={[s.headerTitleLg, { color: colors.primaryText }]}>{list?.title}</Text>
        </View>

        <View style={[s.summary, { backgroundColor: colors.inputBackground }]}>
          <Text style={[s.summaryText, { color: colors.secondaryText }]}>
            {remainingItems} of {totalItems} items remaining
          </Text>
        </View>

        {shops.length > 0 && (
          <ScrollView
            horizontal
            style={[s.tabBar, { backgroundColor: colors.cardBackground }]}
            contentContainerStyle={s.tabBarContent}
            showsHorizontalScrollIndicator={false}
          >
            {shops.map(shop => (
              <TouchableOpacity
                key={shop.id}
                style={[
                  s.tab,
                  { backgroundColor: colors.inputBackground },
                  activeTabId === shop.id && { backgroundColor: colors.accentColor }
                ]}
                onPress={() => setActiveTabId(shop.id)}
                onLongPress={() => handleDeleteShop(shop.id, shop.name, shop.items?.length || 0)}
              >
                <Text style={[
                  s.tabText,
                  { color: colors.secondaryText },
                  activeTabId === shop.id && { color: colors.accentText, fontWeight: '600' }
                ]}>
                  {shop.name}
                </Text>
                <Text style={[s.tabCount, { color: colors.secondaryText }, activeTabId === shop.id && { color: colors.accentText }]}>
                  {shop.items?.filter(i => !i.isDone).length || 0}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[s.addTab, { borderColor: colors.accentColor }]}
              onPress={() => setShowAddShop(true)}
            >
              <Text style={[s.addTabText, { color: colors.accentColor }]}>+ Add</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {shops.length === 0 && (
          <View style={s.noShops}>
            <Text style={[s.noShopsText, { color: colors.tertiaryText }]}>Add your first shop</Text>
            <TouchableOpacity
              style={[s.addShopButton, { backgroundColor: colors.accentColor }]}
              onPress={() => setShowAddShop(true)}
            >
              <Text style={[s.addShopButtonText, { color: colors.accentText }]}>+ Add Shop</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeShop && (
          <View style={{ flex: 1, padding: 16 }}>
            <View style={s.inputRow}>
              <TextInput
                style={[s.itemInput, { backgroundColor: colors.cardBackground, color: colors.primaryText }]}
                placeholder="Add item..."
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

            {activeShop.items?.some(i => i.isDone) && (
              <TouchableOpacity style={s.deleteCompleted} onPress={handleDeleteCompleted}>
                <Text style={[s.deleteCompletedText, { color: colors.deleteColor }]}>🗑️ Delete Completed</Text>
              </TouchableOpacity>
            )}

            <FlatList
              data={activeShop.items || []}
              keyExtractor={(item) => item.id.toString()}
              style={{ flex: 1 }}
              renderItem={({ item }) => (
                <ItemRow
                  item={item}
                  onToggle={handleToggleItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  colors={colors}
                  s={s}
                />
              )}
              ListEmptyComponent={
                <Text style={[s.emptyItems, { color: colors.mutedText }]}>No items yet</Text>
              }
            />
          </View>
        )}

        <Modal visible={showAddShop} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: colors.cardBackground }]}>
              <Text style={[s.modalTitle, { color: colors.primaryText }]}>Add New Shop</Text>
              <TextInput
                ref={addShopRef}
                style={[s.modalInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
                placeholder="Shop name (e.g., Walmart)"
                placeholderTextColor={colors.mutedText}
                value={newShopName}
                onChangeText={setNewShopName}
                autoFocus
              />
              <View style={s.modalButtons}>
                <TouchableOpacity
                  style={s.modalButton}
                  onPress={() => { setShowAddShop(false); setNewShopName(''); }}
                >
                  <Text style={[s.modalButtonText, { color: colors.secondaryText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.modalButton, s.modalButtonPrimary, !newShopName.trim() && s.modalButtonDisabled, { backgroundColor: colors.accentColor }]}
                  onPress={handleAddShop}
                  disabled={!newShopName.trim()}
                >
                  <Text style={[s.modalButtonTextPrimary, { color: colors.accentText }]}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={editItemId !== null} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: colors.cardBackground }]}>
              <Text style={[s.modalTitle, { color: colors.primaryText }]}>Edit Item</Text>
              <TextInput
                ref={editItemRef}
                style={[s.modalInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
                placeholder="Item name"
                placeholderTextColor={colors.mutedText}
                value={editItemText}
                onChangeText={setEditItemText}
                autoFocus
              />
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
