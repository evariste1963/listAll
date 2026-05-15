import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';

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

  const result = useLiveQuery(
    db.select().from(schema.shoppingList).where(eq(schema.shoppingList.isActive, true))
  );

  useEffect(() => {
    if (result && result.data) {
      const data = result.data;
      if (data.length > 0) {
        setShopList(data[0]);
        loadShops(data[0].id);
      } else {
        setShopList(null);
        setShops([]);
      }
    } else {
      setShopList(null);
      setShops([]);
    }
  }, [result]);

  const loadShops = async (listId: number) => {
    const shopTabsResult = await db.select().from(schema.shopTab)
      .where(eq(schema.shopTab.listId, listId))
      .orderBy(schema.shopTab.order)
      .get();
    
    if (!shopTabsResult) {
      setShops([]);
      return;
    }
    
    const shopTabs = [shopTabsResult];
    const summaries: ShopSummary[] = [];
    for (const shop of shopTabs) {
      const itemsResult = await db.select().from(schema.shoppingItem)
        .where(eq(schema.shoppingItem.shopTabId, shop.id))
        .get();
      
      const items = itemsResult ? [itemsResult] : [];
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

  const handleCreateList = () => {
    if (shopList) {
      Alert.alert('Shopping List Active', 'You already have an active shopping list. Close it first?');
      return;
    }
    navigation.navigate('CreateShoppingList');
  };

  const handleOpenShop = () => {
    if (shopList) {
      navigation.navigate('ShoppingDetail', { listId: shopList.id });
    }
  };

  const handleEndList = () => {
    Alert.alert(
      'End Shopping List',
      'Are you sure you want to end this shopping list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End List', 
          style: 'destructive',
          onPress: async () => {
            if (shopList) {
              await db.update(schema.shoppingList)
                .set({ isActive: false })
                .where(eq(schema.shoppingList.id, shopList.id))
                .run();
            }
          }
        },
      ]
    );
  };

  if (!shopList) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>No Active Shopping List</Text>
          <Text style={styles.emptySubtitle}>Create a new shopping list to get started</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateList}>
            <Text style={styles.createButtonText}>+ Create Shopping List</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.listTitle}>{shopList.title}</Text>
        {shops.length === 0 && (
          <TouchableOpacity onPress={handleEndList}>
            <Text style={styles.endButton}>End List</Text>
          </TouchableOpacity>
        )}
      </View>

      {shops.length === 0 ? (
        <View style={styles.emptyShops}>
          <Text style={styles.emptyShopsText}>No shops yet</Text>
          <Text style={styles.emptyShopsSubtext}>Add your first shop to start</Text>
          <TouchableOpacity 
            style={styles.addShopButton}
            onPress={handleOpenShop}
          >
            <Text style={styles.addShopButtonText}>+ Add First Shop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.shopCard}
              onPress={handleOpenShop}
            >
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{item.name}</Text>
                <Text style={styles.shopItems}>
                  {item.remainingItems} of {item.totalItems} items remaining
                </Text>
              </View>
              <View style={[
                styles.badge,
                item.remainingItems === 0 && styles.badgeComplete
              ]}>
                <Text style={styles.badgeText}>
                  {item.remainingItems === 0 ? '✓' : item.remainingItems}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
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
  listTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  endButton: {
    color: '#e94560',
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
});