import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Alert, ScrollView, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
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
  const navigation = useNavigation<any>();
  const db = useDB();
  const { listId } = route.params;

  const [list, setList] = useState<typeof schema.shoppingList.$inferSelect | null>(null);
  const [shops, setShops] = useState<ShopTabType[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [showAddShop, setShowAddShop] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [editListTitle, setEditListTitle] = useState(false);
  const [listTitle, setListTitle] = useState('');

  const listResult = useLiveQuery(
    db.select().from(schema.shoppingList).where(eq(schema.shoppingList.id, listId))
  );

  const shopsResult = useLiveQuery(
    db.select().from(schema.shopTab)
      .where(eq(schema.shopTab.listId, listId))
      .orderBy(schema.shopTab.order)
  );

  useEffect(() => {
    if (listResult && listResult.data) {
      const data = listResult.data;
      if (data.length > 0) {
        setList(data[0]);
        setListTitle(data[0].title);
      }
    }
  }, [listResult]);

  useEffect(() => {
    if (shopsResult && shopsResult.data) {
      loadShopItems(shopsResult.data);
    }
  }, [shopsResult]);

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
    if (withItems.length > 0 && !activeTabId) {
      setActiveTabId(withItems[0].id);
    } else if (withItems.length > 0 && activeTabId) {
      const stillExists = withItems.find(s => s.id === activeTabId);
      if (!stillExists) {
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

    const maxOrder = activeShop?.items?.length || 0;
    await db.insert(schema.shoppingItem).values({
      shopTabId: activeTabId,
      title: newItemText.trim(),
      isDone: false,
      order: maxOrder + 1,
    }).run();

    setNewItemText('');
  };

  const handleToggleItem = async (itemId: number, currentDone: boolean | null) => {
    const newDone = currentDone ? false : true;
    await db.update(schema.shoppingItem)
      .set({ isDone: newDone })
      .where(eq(schema.shoppingItem.id, itemId))
      .run();
  };

  const handleDeleteItem = async (itemId: number) => {
    await db.delete(schema.shoppingItem).where(eq(schema.shoppingItem.id, itemId)).run();
  };

  const handleEditItem = (itemId: number, currentTitle: string) => {
    Alert.prompt('Edit Item', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: async (newTitle?: string) => {
          if (newTitle && newTitle.trim()) {
            await db.update(schema.shoppingItem)
              .set({ title: newTitle.trim() })
              .where(eq(schema.shoppingItem.id, itemId))
              .run();
          }
        },
      },
    ], undefined, currentTitle);
  };

  const handleAddShop = async () => {
    if (!newShopName.trim()) return;

    const maxOrder = shops.length;
    await db.insert(schema.shopTab).values({
      listId,
      name: newShopName.trim(),
      order: maxOrder + 1,
    }).run();

    setNewShopName('');
    setShowAddShop(false);
  };

  const handleDeleteShop = (shopId: number, shopName: string, itemCount: number) => {
    if (itemCount > 0) {
      Alert.alert(
        'Cannot Delete Shop',
        `"${shopName}" has ${itemCount} item${itemCount > 1 ? 's' : ''} in its list. Delete all items first.`,
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
  };

  const handleUpdateTitle = async () => {
    if (listTitle.trim() && list) {
      await db.update(schema.shoppingList)
        .set({ title: listTitle.trim() })
        .where(eq(schema.shoppingList.id, listId))
        .run();
      setEditListTitle(false);
    }
  };

  const handleEndList = () => {
    Alert.alert(
      'End Shopping List',
      'Are you sure you want to end this shopping list? This will delete all shops and items.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End List',
          style: 'destructive',
          onPress: async () => {
            for (const shop of shops) {
              if (shop.items) {
                for (const item of shop.items) {
                  await db.delete(schema.shoppingItem).where(eq(schema.shoppingItem.id, item.id)).run();
                }
              }
              await db.delete(schema.shopTab).where(eq(schema.shopTab.id, shop.id)).run();
            }
            await db.delete(schema.shoppingList).where(eq(schema.shoppingList.id, listId)).run();
            navigation.goBack();
          }
        },
      ]
    );
  };

  if (!list) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {editListTitle ? (
          <TextInput
            style={styles.titleInput}
            value={listTitle}
            onChangeText={setListTitle}
            onBlur={handleUpdateTitle}
            onSubmitEditing={handleUpdateTitle}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setEditListTitle(true)}>
            <Text style={styles.headerTitle}>{list.title}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleEndList}>
          <Text style={styles.endButton}>End</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {remainingItems} of {totalItems} items remaining
        </Text>
      </View>

      {shops.length > 0 && (
        <ScrollView
          horizontal
          style={styles.tabBar}
          contentContainerStyle={styles.tabContent}
          showsHorizontalScrollIndicator={false}
        >
          {shops.map(shop => (
            <TouchableOpacity
              key={shop.id}
              style={[styles.tab, activeTabId === shop.id && styles.tabActive]}
              onPress={() => setActiveTabId(shop.id)}
              onLongPress={() => handleDeleteShop(shop.id, shop.name, shop.items?.length || 0)}
            >
              <Text style={[styles.tabText, activeTabId === shop.id && styles.tabTextActive]}>
                {shop.name}
              </Text>
              <Text style={styles.tabCount}>
                {shop.items?.filter(i => !i.isDone).length || 0}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addTab}
            onPress={() => setShowAddShop(true)}
          >
            <Text style={styles.addTabText}>+ Add</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {shops.length === 0 && (
        <View style={styles.noShops}>
          <Text style={styles.noShopsText}>Add your first shop</Text>
          <TouchableOpacity
            style={styles.addShopButton}
            onPress={() => setShowAddShop(true)}
          >
            <Text style={styles.addShopButtonText}>+ Add Shop</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeShop && (
        <View style={styles.itemsContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.itemInput}
              placeholder="Add item..."
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

          {activeShop.items?.some(i => i.isDone) && (
            <TouchableOpacity style={styles.deleteCompleted} onPress={handleDeleteCompleted}>
              <Text style={styles.deleteCompletedText}>🗑️ Delete Completed</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={activeShop.items || []}
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
              <Text style={styles.emptyItems}>No items yet</Text>
            }
          />
        </View>
      )}

      <Modal visible={showAddShop} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Shop</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Shop name (e.g., Walmart)"
              placeholderTextColor="#666"
              value={newShopName}
              onChangeText={setNewShopName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => { setShowAddShop(false); setNewShopName(''); }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, !newShopName.trim() && styles.modalButtonDisabled]}
                onPress={handleAddShop}
                disabled={!newShopName.trim()}
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
  endButton: {
    fontSize: 16,
    color: '#e94560',
  },
  summary: {
    padding: 12,
    backgroundColor: '#0f3460',
  },
  summaryText: {
    color: '#aaa',
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: '#16213e',
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
    backgroundColor: '#0f3460',
    borderRadius: 20,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#e94560',
  },
  tabText: {
    color: '#aaa',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  tabCount: {
    marginLeft: 8,
    color: '#888',
    fontSize: 12,
  },
  addTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e94560',
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  addTabText: {
    color: '#e94560',
    fontSize: 14,
  },
  noShops: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noShopsText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 16,
  },
  addShopButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addShopButtonText: {
    color: '#fff',
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
  deleteCompleted: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  deleteCompletedText: {
    color: '#e94560',
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    width: '80%',
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