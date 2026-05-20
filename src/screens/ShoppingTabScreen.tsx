import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme } from '../styles/theme';
import { eq } from 'drizzle-orm';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ShopSummary {
  id: number;
  name: string;
  totalItems: number;
  remainingItems: number;
}

interface ShoppingTabScreenProps {
  onTabChange?: (index: number, animated?: boolean) => void;
}

export default function ShoppingTabScreen({ onTabChange }: ShoppingTabScreenProps = {}) {
  const db = useDB();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  
  const [shopList, setShopList] = useState<typeof schema.shoppingList.$inferSelect | null>(null);
  const [shops, setShops] = useState<ShopSummary[]>([]);

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
  }, [result?.data]);

  const loadShops = useCallback(async (listId: number) => {
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
  }, []);

  useEffect(() => {
    if (!shopList || shops.length === 0) {
      loadDefaultShops();
    } else if (shopList) {
      syncDefaultsToList();
    }
  }, [defaultShopsResult?.data, shopList]);

  useFocusEffect(
    useCallback(() => {
      if (shopList) {
        loadShops(shopList.id);
      } else {
        loadDefaultShops();
      }
    }, [shopList])
  );

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

  const handleCreateList = async () => {
    if (shopList) {
      Alert.alert('Shopping List Active', 'You already have an active shopping list. Close it first?');
      return;
    }

    const createdList = await db.insert(schema.shoppingList)
      .values({ 
        title: 'Shopping List', 
        isActive: true,
      })
      .returning()
      .then(r => r[0]);

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
    
    const createdList = await db.insert(schema.shoppingList)
      .values({ 
        title: 'Shopping List', 
        isActive: true,
      })
      .returning()
      .then(r => r[0]);

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

  const addToDefaults = async (shopName: string) => {
    const defaultShops = await db.select().from(schema.defaultShop).all();
    const exists = defaultShops.find(d => d.name.toLowerCase() === shopName.toLowerCase());
    if (exists) return;
    await db.insert(schema.defaultShop).values({
      name: shopName,
      order: defaultShops.length + 1,
    }).run();
    Alert.alert('Done', `"${shopName}" added to default shops`);
    if (shopList) {
      loadShops(shopList.id);
    } else {
      loadDefaultShops();
    }
  };

  const removeFromDefaults = async (shopName: string) => {
    const defaults = await db.select().from(schema.defaultShop).all();
    const exists = defaults.find(d => d.name.toLowerCase() === shopName.toLowerCase());
    if (exists) {
      await db.delete(schema.defaultShop).where(eq(schema.defaultShop.id, exists.id)).run();
      Alert.alert('Done', `"${shopName}" removed from default shops`);
      if (shopList) {
        loadShops(shopList.id);
      } else {
        loadDefaultShops();
      }
    }
  };

  const syncDefaultsToList = async () => {
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
      loadShops(shopList.id);
    }
  };

  const handleAddFirstShop = async () => {
    const createdList = await db.insert(schema.shoppingList)
      .values({ 
        title: 'Shopping List', 
        isActive: true,
      })
      .returning()
      .then(r => r[0]);

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
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.dividerColor }]}>
          <TouchableOpacity onPress={() => onTabChange?.(0, false)}>
            <Text style={styles.homeButton}>🏠</Text>
          </TouchableOpacity>
          <Text style={[styles.listTitle, { color: colors.primaryText }]}>Summary</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyShops}>
          <Text style={[styles.emptyShopsText, { color: colors.primaryText }]}>No shops yet</Text>
          <Text style={[styles.emptyShopsSubtext, { color: colors.tertiaryText }]}>Add a shop to start your shopping list</Text>
          <TouchableOpacity style={[styles.addShopButton, { backgroundColor: colors.inputBackground }]} onPress={handleAddFirstShop}>
            <Text style={[styles.addShopButtonText, { color: colors.accentColor }]}>+ Add Shop</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!shopList) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.dividerColor }]}>
          <TouchableOpacity onPress={() => onTabChange?.(0, false)}>
            <Text style={styles.homeButton}>🏠</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Shopping</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={[styles.emptyTitle, { color: colors.primaryText }]}>No Active Shopping List</Text>
          <Text style={[styles.emptySubtitle, { color: colors.tertiaryText }]}>Create a new shopping list to get started</Text>
          <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.accentColor }]} onPress={handleCreateList}>
            <Text style={styles.createButtonText}>+ Create Shopping List</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const defaultShops = defaultShopsResult?.data || [];
  const displayShops = shopList ? shops : defaultShops.map(shop => ({ id: shop.id, name: shop.name, totalItems: 0, remainingItems: 0 }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.dividerColor }]}>
        <TouchableOpacity onPress={() => onTabChange?.(0, false)}>
          <Text style={styles.homeButton}>🏠</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={displayShops}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const inDefaults = defaultShops.some(d => d.name.toLowerCase() === item.name.toLowerCase());
          return (
          <TouchableOpacity 
            style={[styles.shopCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => handleOpenShop(item.id, item.name)}
          >
            <View style={styles.shopInfo}>
              <Text style={[styles.shopName, { color: colors.primaryText }]}>{item.name}</Text>
              <Text style={[styles.shopItems, { color: colors.tertiaryText }]}>
                {item.remainingItems} of {item.totalItems} items remaining
              </Text>
            </View>
            <View style={styles.shopActions}>
              <TouchableOpacity 
                style={[styles.defaultButton, { backgroundColor: colors.inputBackground }]}
                onPress={() => {
                  if (inDefaults) {
                    removeFromDefaults(item.name);
                  } else {
                    addToDefaults(item.name);
                  }
                }}
              >
                <Text style={[styles.defaultButtonText, { color: colors.accentColor }]}>{inDefaults ? '−' : '+'}</Text>
              </TouchableOpacity>
              <View style={[
                styles.badge,
                { backgroundColor: item.remainingItems === 0 ? colors.completedColor : colors.accentColor }
              ]}>
                <Text style={styles.badgeText}>
                  {item.remainingItems === 0 ? '✓' : item.remainingItems}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          )}}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  homeButton: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  listTitle: {
    fontSize: 22,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
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
    marginBottom: 8,
  },
  emptyShopsSubtext: {
    fontSize: 14,
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
  list: {
    padding: 16,
  },
  shopCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  shopItems: {
    fontSize: 14,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
