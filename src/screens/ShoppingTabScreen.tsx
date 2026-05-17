import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import { TouchableOpacity as RNTouchable } from 'react-native';

interface ShopSummary {
  id: number;
  name: string;
  totalItems: number;
  remainingItems: number;
}

export default function ShoppingTabScreen() {
  const db = useDB();
  const navigation = useNavigation<any>();
  
  const [shopList, setShopList] = useState<typeof schema.shoppingList.$inferSelect | null>(null);
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [showAddShop, setShowAddShop] = useState(false);
  const [newShopName, setNewShopName] = useState('');

  const result = useLiveQuery(
    db.select().from(schema.shoppingList).where(eq(schema.shoppingList.isActive, true))
  );

  const defaultShopsResult = useLiveQuery(
    db.select().from(schema.defaultShop).orderBy(schema.defaultShop.order)
  );

  useEffect(() => {
    if (result && result.data) {
      const data = result.data;
      if (data.length > 0) {
        setShopList(data[0]);
        loadShops(data[0].id);
      } else {
        setShopList(null);
        loadDefaultShops();
      }
    } else {
      setShopList(null);
      loadDefaultShops();
    }
  }, [result]);

  const loadDefaultShops = async () => {
    const defaults = await db.select().from(schema.defaultShop).orderBy(schema.defaultShop.order).all();
    const summaries: ShopSummary[] = defaults.map(shop => ({
      id: shop.id,
      name: shop.name,
      totalItems: 0,
      remainingItems: 0,
    }));
    setShops(summaries);
  };

  useEffect(() => {
    if (!shopList || shops.length === 0) {
      loadDefaultShops();
    }
  }, [defaultShopsResult, shopList, shops]);

  useEffect(() => {
    if (shopList) {
      loadShops(shopList.id);
    }
  }, [shopList]);

  useFocusEffect(
    React.useCallback(() => {
      loadDefaultShops();
    }, [])
  );

  const loadShops = async (listId: number) => {
    const shopTabsResult = await db.select().from(schema.shopTab)
      .where(eq(schema.shopTab.listId, listId))
      .orderBy(schema.shopTab.order)
      .all();
    
    if (!shopTabsResult || shopTabsResult.length === 0) {
      loadDefaultShops();
      return;
    }
    
    const shopTabs = shopTabsResult;
    const summaries: ShopSummary[] = [];
    for (const shop of shopTabs) {
      const itemsResult = await db.select().from(schema.shoppingItem)
        .where(eq(schema.shoppingItem.shopTabId, shop.id))
        .all();
      
      const items = itemsResult || [];
      const remaining = items.filter(i => !i.isDone).length;
      summaries.push({
        id: shop.id,
        name: shop.name,
        totalItems: items.length,
        remainingItems: remaining,
      });
    }
    setShops(summaries);
  };

  const handleCreateList = async () => {
    if (shopList) {
      Alert.alert('Shopping List Active', 'You already have an active shopping list. Close it first?');
      return;
    }

    const newList = await db.insert(schema.shoppingList)
      .values({ 
        title: 'Shopping List', 
        isActive: true,
        createdAt: new Date()
      })
      .run();

    const createdList = await db.select()
      .from(schema.shoppingList)
      .orderBy(schema.shoppingList.id)
      .limit(1)
      .get();

    if (createdList) {
      const defaultShops = await db.select().from(schema.defaultShop).orderBy(schema.defaultShop.order).all();
      
      for (let i = 0; i < defaultShops.length; i++) {
        await db.insert(schema.shopTab).values({
          listId: createdList.id,
          name: defaultShops[i].name,
          order: i + 1,
        }).run();
      }

      navigation.navigate('ShoppingDetail', { listId: createdList.id });
    }
  };

  const handleOpenShop = async (shopId: number, shopName: string) => {
    if (shopList) {
      navigation.navigate('ShoppingDetail', { listId: shopList.id, activeTabId: shopId });
      return;
    }
    
    const newList = await db.insert(schema.shoppingList)
      .values({ 
        title: 'Shopping List', 
        isActive: true,
        createdAt: new Date()
      })
      .run();

    const createdList = await db.select()
      .from(schema.shoppingList)
      .orderBy(schema.shoppingList.id)
      .limit(1)
      .get();

    if (createdList) {
      setShopList(createdList);
      
      const defaultShops = await db.select().from(schema.defaultShop).orderBy(schema.defaultShop.order).all();
      let order = 1;
      
      for (const shop of defaultShops) {
        await db.insert(schema.shopTab).values({
          listId: createdList.id,
          name: shop.name,
          order: order++,
        }).run();
      }
      
      await loadShops(createdList.id);
      
      const tabs = await db.select().from(schema.shopTab)
        .where(eq(schema.shopTab.listId, createdList.id))
        .orderBy(schema.shopTab.order)
        .all();
      
      const matchingShop = tabs.find(t => t.name === shopName);
      
      navigation.navigate('ShoppingDetail', { listId: createdList.id, activeTabId: matchingShop?.id });
    }
  };

  const handleAddShop = async (shopName: string) => {
    if (!shopName.trim()) return;
    
    if (!shopList) {
      const newList = await db.insert(schema.shoppingList)
        .values({ title: 'Shopping List', isActive: true, createdAt: new Date() })
        .run();
      
      const createdList = await db.select()
        .from(schema.shoppingList)
        .orderBy(schema.shoppingList.id)
        .limit(1)
        .get();
      
      if (createdList) {
        setShopList(createdList);
        
        const defaultShops = await db.select().from(schema.defaultShop).orderBy(schema.defaultShop.order).all();
        let order = 1;
        
        for (const shop of defaultShops) {
          await db.insert(schema.shopTab).values({
            listId: createdList.id,
            name: shop.name,
            order: order++,
          }).run();
        }
        
        const tabs = await db.select().from(schema.shopTab)
          .where(eq(schema.shopTab.listId, createdList.id))
          .all();
        
        const matchingShop = tabs.find(t => t.name === shopName.trim());
        navigation.navigate('ShoppingDetail', { listId: createdList.id, activeTabId: matchingShop?.id });
      }
    } else {
      await db.insert(schema.shopTab).values({
        listId: shopList.id,
        name: shopName.trim(),
        order: shops.length + 1,
      }).run();
      loadShops(shopList.id);
    }
    setNewShopName('');
    setShowAddShop(false);
  };

  const isInDefaults = async (shopName: string): Promise<boolean> => {
    const defaults = await db.select().from(schema.defaultShop).all();
    return defaults.some(d => d.name.toLowerCase() === shopName.toLowerCase());
  };

  const addToDefaults = async (shopName: string) => {
    const defaultShops = await db.select().from(schema.defaultShop).all();
    const exists = defaultShops.find(d => d.name.toLowerCase() === shopName.toLowerCase());
    if (exists) return;
    await db.insert(schema.defaultShop).values({
      name: shopName,
      order: defaultShops.length + 1,
    }).run();
    loadDefaultShops();
  };

  const removeFromDefaults = async (shopName: string) => {
    const defaults = await db.select().from(schema.defaultShop).all();
    const exists = defaults.find(d => d.name.toLowerCase() === shopName.toLowerCase());
    if (exists) {
      await db.delete(schema.defaultShop).where(eq(schema.defaultShop.id, exists.id)).run();
      loadDefaultShops();
    }
  };

  const handleSyncDefaults = async () => {
    if (!shopList) return;
    
    const defaultShops = await db.select().from(schema.defaultShop).orderBy(schema.defaultShop.order).all();
    const existingShops = await db.select().from(schema.shopTab).where(eq(schema.shopTab.listId, shopList.id)).all();
    const existingShopNames = existingShops.map(s => s.name.toLowerCase());
    
    let addedCount = 0;
    for (let i = 0; i < defaultShops.length; i++) {
      if (!existingShopNames.includes(defaultShops[i].name.toLowerCase())) {
        await db.insert(schema.shopTab).values({
          listId: shopList.id,
          name: defaultShops[i].name,
          order: existingShops.length + addedCount + 1,
        }).run();
        addedCount++;
      }
    }
    
    if (addedCount > 0) {
      Alert.alert('Done', `Added ${addedCount} new default shop(s)`);
    } else {
      Alert.alert('Done', 'All default shops already exist');
    }
  };

  const handleAddFirstShop = async () => {
    const newList = await db.insert(schema.shoppingList)
      .values({ 
        title: 'Shopping List', 
        isActive: true,
        createdAt: new Date()
      })
      .run();

    const createdList = await db.select()
      .from(schema.shoppingList)
      .orderBy(schema.shoppingList.id)
      .limit(1)
      .get();

    if (createdList) {
      setShopList(createdList);
      navigation.navigate('ShoppingDetail', { listId: createdList.id, showAddShop: true });
    }
  };

  const defaults = defaultShopsResult?.data || [];
  const hasNoShops = (defaults.length === 0 && shops.length === 0);

  if (hasNoShops) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeButton}>🏠</Text>
          </TouchableOpacity>
          <Text style={styles.listTitle}>Summary</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyShops}>
          <Text style={styles.emptyShopsText}>No shops yet</Text>
          <Text style={styles.emptyShopsSubtext}>Add a shop to start your shopping list</Text>
          <TouchableOpacity style={styles.addShopButton} onPress={handleAddFirstShop}>
            <Text style={styles.addShopButtonText}>+ Add Shop</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!shopList) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeButton}>🏠</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>No Active Shopping List</Text>
          <Text style={styles.emptySubtitle}>Create a new shopping list to get started</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateList}>
            <Text style={styles.createButtonText}>+ Create Shopping List</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeButton}>🏠</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={shops}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const defaults = defaultShopsResult?.data || [];
          const inDefaults = defaults.some(d => d.name.toLowerCase() === item.name.toLowerCase());
          return (
          <TouchableOpacity 
            style={styles.shopCard}
            onPress={() => handleOpenShop(item.id, item.name)}
          >
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{item.name}</Text>
              <Text style={styles.shopItems}>
                {item.remainingItems} of {item.totalItems} items remaining
              </Text>
            </View>
            <View style={styles.shopActions}>
              <TouchableOpacity 
                style={styles.defaultButton}
                onPress={() => {
                  if (inDefaults) {
                    removeFromDefaults(item.name);
                  } else {
                    addToDefaults(item.name);
                  }
                }}
              >
                <Text style={styles.defaultButtonText}>{inDefaults ? '−' : '+'}</Text>
              </TouchableOpacity>
              <View style={[
                styles.badge,
                item.remainingItems === 0 && styles.badgeComplete
              ]}>
                <Text style={styles.badgeText}>
                  {item.remainingItems === 0 ? '✓' : item.remainingItems}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          )}}
        />
      
      <Modal visible={showAddShop} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Shop</Text>
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
                onPress={() => handleAddShop(newShopName)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  homeButton: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  listTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  endButton: {
    color: '#e94560',
    fontSize: 16,
  },
  syncButton: {
    color: '#4ade80',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyShops: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyShopsText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  emptyShopsSubtext: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  addShopButton: {
    backgroundColor: '#0f3460',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addShopButtonText: {
    color: '#e94560',
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  shopCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  shopItems: {
    fontSize: 14,
    color: '#888',
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeComplete: {
    backgroundColor: '#4ade80',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  shopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultButtonText: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addShopText: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '600',
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