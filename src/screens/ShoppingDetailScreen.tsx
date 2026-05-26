import React, { useState, useEffect } from 'react';
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
import type { ShoppingDetailProps } from '../navigation/types';

interface ShopTabType {
  id: number;
  listId: number;
  name: string;
  order: number | null;
  items: {
    id: number;
    shopTabId: number;
    title: string;
    isDone: boolean | null;
    order: number | null;
  }[];
}

export default function ShoppingDetailScreen() {
  const route = useRoute<ShoppingDetailProps['route']>();
  const db = useDB();
  const { colors } = useTheme();
  const s = createThemedStyles(colors);
  const { listId, activeTabId: initialActiveTabId, showAddShop: initialShowAddShop } = route.params;

  const [shops, setShops] = useState<ShopTabType[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(initialActiveTabId || null);
  const [newItemText, setNewItemText] = useState('');
  const [showAddShop, setShowAddShop] = useState(initialShowAddShop || false);
  const [newShopName, setNewShopName] = useState('');
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemText, setEditItemText] = useState('');

  const listResult = useLiveQuery(
    listService.getById(db, schema.shoppingList, listId)
  );

  const shopsResult = useLiveQuery(
    db.select().from(schema.shopTab)
      .where(eq(schema.shopTab.listId, listId))
      .orderBy(schema.shopTab.order)
  );

  const list = listResult.data?.[0] ?? null;

  useEffect(() => {
    if (shopsResult && shopsResult.data) {
      loadShopItems(shopsResult.data);
    }
  }, [shopsResult?.data]);

  const loadShopItems = async (shopTabs: typeof schema.shopTab.$inferSelect[]) => {
    const withItems: ShopTabType[] = [];
    for (const shop of shopTabs) {
      const items = await db.select()
        .from(schema.shoppingItem)
        .where(eq(schema.shoppingItem.shopTabId, shop.id))
        .orderBy(schema.shoppingItem.order)
        .all();
      withItems.push({ ...shop, items: items || [] });
    }
    setShops(withItems);
    if (withItems.length > 0) {
      if (initialActiveTabId && !activeTabId) {
        const selectedShop = withItems.find(s => s.id === initialActiveTabId);
        setActiveTabId(selectedShop ? initialActiveTabId : withItems[0].id);
      } else if (!activeTabId) {
        setActiveTabId(withItems[0].id);
      }
    } else {
      setActiveTabId(null);
    }
  };

  const activeShop = shops.find(s => s.id === activeTabId);
  const totalItems = shops.reduce((sum, s) => sum + (s.items?.length || 0), 0);
  const remainingItems = shops.reduce((sum, s) => sum + (s.items?.filter(i => !i.isDone).length || 0), 0);

  const handleAddItem = async () => {
    if (!newItemText.trim() || !activeTabId) return;

    const newItemLower = newItemText.trim().toLowerCase();

    const existingItems = await db.select()
      .from(schema.shoppingItem)
      .where(eq(schema.shoppingItem.shopTabId, activeTabId))
      .all();

    const existingItem = existingItems.find(
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
    if (shopsResult.data) {
      loadShopItems(shopsResult.data);
    }
  };

  const handleToggleItem = async (itemId: number, currentDone: boolean | null) => {
    await itemService.toggleDone(db, schema.shoppingItem, itemId, currentDone);
    if (shopsResult.data) {
      loadShopItems(shopsResult.data);
    }
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
            if (shopsResult.data) {
              loadShopItems(shopsResult.data);
            }
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
    if (shopsResult.data) {
      loadShopItems(shopsResult.data);
    }
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
    if (shopsResult.data) {
      loadShopItems(shopsResult.data);
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
    if (shopsResult.data) {
      loadShopItems(shopsResult.data);
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
                  activeTabId === shop.id && { color: colors.primaryText, fontWeight: '600' }
                ]}>
                  {shop.name}
                </Text>
                <Text style={[s.tabCount, { color: colors.secondaryText }]}>
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
              <Text style={[s.addShopButtonText, { color: colors.primaryText }]}>+ Add Shop</Text>
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
                <Text style={s.addIconButtonText}>+</Text>
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
                <View style={[s.itemRow, { borderBottomColor: colors.cardBackground }]}>
                  <TouchableOpacity
                    style={s.checkbox}
                    onPress={() => handleToggleItem(item.id, item.isDone)}
                  >
                    <Text style={item.isDone ? [s.checkboxChecked, { color: colors.completedColor }] : [s.checkboxUnchecked, { color: colors.secondaryText }]}>
                      {item.isDone ? '✓' : '○'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.itemTitle}
                    onPress={() => handleEditItem(item.id, item.title)}
                  >
                    <Text style={[s.itemText, { color: colors.primaryText }, item.isDone && { color: colors.mutedText, textDecorationLine: 'line-through' }]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.deleteItem}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    <Text style={[s.deleteItemText, { color: colors.deleteColor }]}>✕</Text>
                  </TouchableOpacity>
                </View>
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
                  <Text style={[s.modalButtonTextPrimary, { color: colors.primaryText }]}>Add</Text>
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
