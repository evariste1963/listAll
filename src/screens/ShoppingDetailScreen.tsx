import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Alert, ScrollView, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme } from '../styles/theme';
import { eq } from 'drizzle-orm';
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
  const { listId, activeTabId: initialActiveTabId, showAddShop: initialShowAddShop } = route.params;

  const [list, setList] = useState<typeof schema.shoppingList.$inferSelect | null>(null);
  const [shops, setShops] = useState<ShopTabType[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(initialActiveTabId || null);
  const [newItemText, setNewItemText] = useState('');
  const [showAddShop, setShowAddShop] = useState(initialShowAddShop || false);
  const [newShopName, setNewShopName] = useState('');
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemText, setEditItemText] = useState('');

  const listResult = useLiveQuery(
    db.select().from(schema.shoppingList).where(eq(schema.shoppingList.id, listId))
  );

  const shopsResult = useLiveQuery(
    db.select().from(schema.shopTab)
      .where(eq(schema.shopTab.listId, listId))
      .orderBy(schema.shopTab.order)
  );

  useEffect(() => {
    if (listResult && listResult.data && listResult.data.length > 0) {
      setList(listResult.data[0]);
    }
  }, [listResult?.data]);

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
    await db.insert(schema.shoppingItem).values({
      shopTabId: activeTabId,
      title: newItemText.trim(),
      isDone: false,
      order: maxOrder + 1,
    }).run();

    setNewItemText('');
    if (shopsResult.data) {
      loadShopItems(shopsResult.data);
    }
  };

  const handleToggleItem = async (itemId: number, currentDone: boolean | null) => {
    const newDone = currentDone ? false : true;
    await db.update(schema.shoppingItem)
      .set({ isDone: newDone })
      .where(eq(schema.shoppingItem.id, itemId))
      .run();
    if (shopsResult.data) {
      loadShopItems(shopsResult.data);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    await db.delete(schema.shoppingItem).where(eq(schema.shoppingItem.id, itemId)).run();
    if (shopsResult.data) {
      loadShopItems(shopsResult.data);
    }
  };

  const handleEditItem = (itemId: number, currentTitle: string) => {
    setEditItemId(itemId);
    setEditItemText(currentTitle);
  };

  const handleSaveEdit = async () => {
    if (editItemId && editItemText.trim()) {
      await db.update(schema.shoppingItem)
        .set({ title: editItemText.trim() })
        .where(eq(schema.shoppingItem.id, editItemId))
        .run();
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
    for (const id of completedIds) {
      await db.delete(schema.shoppingItem).where(eq(schema.shoppingItem.id, id)).run();
    }
    if (shopsResult.data) {
      loadShopItems(shopsResult.data);
    }
  };

  if (!list) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[styles.loading, { color: colors.primaryText }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.pageBackground, borderBottomColor: colors.dividerColor }]}>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>{list?.title}</Text>
      </View>

      <View style={[styles.summary, { backgroundColor: colors.inputBackground }]}>
        <Text style={[styles.summaryText, { color: colors.secondaryText }]}>
          {remainingItems} of {totalItems} items remaining
        </Text>
      </View>

      {shops.length > 0 && (
        <ScrollView
          horizontal
          style={[styles.tabBar, { backgroundColor: colors.cardBackground }]}
          contentContainerStyle={styles.tabContent}
          showsHorizontalScrollIndicator={false}
        >
          {shops.map(shop => (
            <TouchableOpacity
              key={shop.id}
              style={[
                styles.tab,
                { backgroundColor: colors.inputBackground },
                activeTabId === shop.id && { backgroundColor: colors.accentColor }
              ]}
              onPress={() => setActiveTabId(shop.id)}
              onLongPress={() => handleDeleteShop(shop.id, shop.name, shop.items?.length || 0)}
            >
              <Text style={[
                styles.tabText,
                { color: colors.secondaryText },
                activeTabId === shop.id && { color: colors.primaryText, fontWeight: '600' }
              ]}>
                {shop.name}
              </Text>
              <Text style={[styles.tabCount, { color: colors.secondaryText }]}>
                {shop.items?.filter(i => !i.isDone).length || 0}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.addTab, { borderColor: colors.accentColor }]}
            onPress={() => setShowAddShop(true)}
          >
            <Text style={[styles.addTabText, { color: colors.accentColor }]}>+ Add</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {shops.length === 0 && (
        <View style={styles.noShops}>
          <Text style={[styles.noShopsText, { color: colors.tertiaryText }]}>Add your first shop</Text>
          <TouchableOpacity
            style={[styles.addShopButton, { backgroundColor: colors.accentColor }]}
            onPress={() => setShowAddShop(true)}
          >
            <Text style={[styles.addShopButtonText, { color: colors.primaryText }]}>+ Add Shop</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeShop && (
        <View style={styles.itemsContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.itemInput, { backgroundColor: colors.cardBackground, color: colors.primaryText }]}
              placeholder="Add item..."
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

          {activeShop.items?.some(i => i.isDone) && (
            <TouchableOpacity style={styles.deleteCompleted} onPress={handleDeleteCompleted}>
              <Text style={[styles.deleteCompletedText, { color: colors.deleteColor }]}>🗑️ Delete Completed</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={activeShop.items || []}
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
              <Text style={[styles.emptyItems, { color: colors.mutedText }]}>No items yet</Text>
            }
          />
        </View>
      )}

      <Modal visible={showAddShop} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.primaryText }]}>Add New Shop</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
              placeholder="Shop name (e.g., Walmart)"
              placeholderTextColor={colors.mutedText}
              value={newShopName}
              onChangeText={setNewShopName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => { setShowAddShop(false); setNewShopName(''); }}
              >
                <Text style={[styles.modalButtonText, { color: colors.secondaryText }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, !newShopName.trim() && styles.modalButtonDisabled, { backgroundColor: colors.accentColor }]}
                onPress={handleAddShop}
                disabled={!newShopName.trim()}
              >
                <Text style={[styles.modalButtonTextPrimary, { color: colors.primaryText }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={editItemId !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.primaryText }]}>Edit Item</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
              placeholder="Item name"
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 200,
  },
  endButton: {},
  summary: {
    padding: 8,
  },
  summaryText: {
    textAlign: 'center',
  },
  tabBar: {
    maxHeight: 60,
  },
  tabContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
  },
  tabCount: {
    marginLeft: 8,
    fontSize: 12,
  },
  addTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  addTabText: {
    fontSize: 14,
  },
  noShops: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noShopsText: {
    fontSize: 16,
    marginBottom: 16,
  },
  addShopButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addShopButtonText: {
    fontSize: 16,
  },
  itemsContainer: {
    flex: 1,
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
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
  deleteCompleted: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  deleteCompletedText: {
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    backgroundColor: 'rgba(0,0,0,0.7)',
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
