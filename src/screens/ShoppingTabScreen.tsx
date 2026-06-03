import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTheme, ThemedBackground } from '../styles/theme';
import { useThemedStyles } from '../styles/useThemedStyles';
import { eq } from 'drizzle-orm';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ShoppingTabScreenProps {
  onTabChange?: (index: number, animated?: boolean) => void;
}

export default function ShoppingTabScreen({ onTabChange }: ShoppingTabScreenProps = {}) {
  const db = useDB();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const s = useThemedStyles();

  const result = useLiveQuery(
    db.select().from(schema.shoppingList).where(eq(schema.shoppingList.isActive, true))
  );

  const defaultShopsResult = useLiveQuery(
    db.select().from(schema.defaultShop).orderBy(schema.defaultShop.order)
  );

  const shopTabsResult = useLiveQuery(
    db.select().from(schema.shopTab).orderBy(schema.shopTab.order)
  );

  const itemsResult = useLiveQuery(
    db.select().from(schema.shoppingItem)
  );

  const activeList = result.data?.[0] ?? null;

  const shops = useMemo(() => {
    if (!activeList) return [];
    const tabs = shopTabsResult.data?.filter(t => t.listId === activeList.id) ?? [];
    return tabs.map(shop => {
      const shopItems = (itemsResult.data ?? []).filter(i => i.shopTabId === shop.id);
      return {
        id: shop.id,
        name: shop.name,
        totalItems: shopItems.length,
        remainingItems: shopItems.filter(i => !i.isDone).length,
      };
    });
  }, [activeList, shopTabsResult.data, itemsResult.data]);

  useEffect(() => {
    if (activeList) syncDefaultsToList();
  }, [activeList?.id, defaultShopsResult?.data]);

  const handleCreate = () => {
    handleAddFirstShop();
  };

  const handleCreateList = async () => {
    if (activeList) {
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

  const handleDeleteList = () => {
    if (!activeList) return;

    const totalItems = shops.reduce((sum, s) => sum + s.totalItems, 0);
    if (totalItems > 0) {
      Alert.alert(
        'Cannot Delete Shopping List',
        `Delete all items from all shops first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Shopping List',
      'Delete this shopping list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const shopIds = shops.map(s => s.id);
            for (const shopId of shopIds) {
              await db.delete(schema.shopTab).where(eq(schema.shopTab.id, shopId)).run();
            }
            await db.delete(schema.shoppingList).where(eq(schema.shoppingList.id, activeList.id)).run();
          },
        },
      ]
    );
  };

  const handleOpenShop = async (shopId: number, shopName: string) => {
    if (activeList) {
      navigation.navigate('ShoppingDetail', { listId: activeList.id, activeTabId: shopId });
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
  };

  const removeFromDefaults = async (shopName: string) => {
    const defaults = await db.select().from(schema.defaultShop).all();
    const exists = defaults.find(d => d.name.toLowerCase() === shopName.toLowerCase());
    if (exists) {
      await db.delete(schema.defaultShop).where(eq(schema.defaultShop.id, exists.id)).run();
      Alert.alert('Done', `"${shopName}" removed from default shops`);
    }
  };

  const syncDefaultsToList = async () => {
    if (!activeList) return;

    const defaultShops = await db.select().from(schema.defaultShop).orderBy(schema.defaultShop.order).all();
    const existingShops = await db.select().from(schema.shopTab).where(eq(schema.shopTab.listId, activeList.id)).all();
    const existingShopNames = existingShops.map(s => s.name.toLowerCase());

    for (let i = 0; i < defaultShops.length; i++) {
      if (!existingShopNames.includes(defaultShops[i].name.toLowerCase())) {
        await db.insert(schema.shopTab).values({
          listId: activeList.id,
          name: defaultShops[i].name,
          order: existingShops.length + 1,
        }).run();
      }
    }
  };

  const handleAddFirstShop = async () => {
    if (activeList) {
      navigation.navigate('ShoppingDetail', { listId: activeList.id, showAddShop: true });
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
      navigation.navigate('ShoppingDetail', { listId: createdList.id, showAddShop: true });
    }
  };

  const defaults = defaultShopsResult?.data || [];
  const hasNoShops = defaults.length === 0 && shops.length === 0;

  const headerStyle = { backgroundColor: colors.cardBackground, borderBottomColor: colors.dividerColor };

  if (hasNoShops) {
    return (
      <ThemedBackground colors={colors}>
        <SafeAreaView style={s.container}>
          <View style={[s.header, headerStyle]}>
            <TouchableOpacity onPress={() => onTabChange?.(0, false)}>
              <Text style={s.homeButton}>🏠</Text>
            </TouchableOpacity>
            <Text style={[s.headerTitleSm, { color: colors.primaryText }]}>Shops</Text>
            <TouchableOpacity onPress={handleCreate}>
              <Text style={[s.addButton, { color: colors.accentColor }]}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={s.emptyState}>
            <Text style={[s.emptyTitle, { color: colors.primaryText }]}>No shops yet</Text>
            <Text style={[s.emptySubtitle, { color: colors.tertiaryText }]}>Add a shop to start your shopping list</Text>
            <TouchableOpacity style={[s.createButton, { backgroundColor: colors.accentColor }]} onPress={handleAddFirstShop}>
              <Text style={[s.createButtonText, { color: colors.accentText }]}>+ Add Shop</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedBackground>
    );
  }

  if (!activeList) {
    return (
      <ThemedBackground colors={colors}>
        <SafeAreaView style={s.container}>
          <View style={[s.header, headerStyle]}>
            <TouchableOpacity onPress={() => onTabChange?.(0, false)}>
              <Text style={s.homeButton}>🏠</Text>
            </TouchableOpacity>
            <Text style={[s.headerTitle, { color: colors.primaryText }]}>Shopping</Text>
            <TouchableOpacity onPress={handleCreate}>
              <Text style={[s.addButton, { color: colors.accentColor }]}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🛒</Text>
            <Text style={[s.emptyTitle, { color: colors.primaryText }]}>No Active Shopping List</Text>
            <Text style={[s.emptySubtitle, { color: colors.tertiaryText }]}>Create a new shopping list to get started</Text>
            <TouchableOpacity style={[s.createButton, { backgroundColor: colors.accentColor }]} onPress={handleCreateList}>
              <Text style={[s.createButtonText, { color: colors.accentText }]}>+ Create Shopping List</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedBackground>
    );
  }

  const defaultShops = defaultShopsResult?.data || [];
  const displayShops = shops.length > 0 ? shops : defaultShops.map(shop => ({ id: shop.id, name: shop.name, totalItems: 0, remainingItems: 0 }));

  return (
    <ThemedBackground colors={colors}>
      <SafeAreaView style={s.container}>
        <View style={[s.header, headerStyle]}>
          <TouchableOpacity onPress={() => onTabChange?.(0, false)}>
            <Text style={s.homeButton}>🏠</Text>
          </TouchableOpacity>
          <TouchableOpacity onLongPress={handleDeleteList}>
            <Text style={[s.headerTitle, { color: colors.primaryText }]}>Shops</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCreate}>
            <Text style={[s.addButton, { color: colors.accentColor }]}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={displayShops}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={s.list}
          style={{ flex: 1 }}
          renderItem={({ item }) => {
            const inDefaults = defaultShops.some(d => d.name.toLowerCase() === item.name.toLowerCase());
            return (
              <TouchableOpacity
                style={[s.card, s.cardRow, { backgroundColor: colors.cardBackground }]}
                onPress={() => handleOpenShop(item.id, item.name)}
              >
                <View style={s.shopInfo}>
                  <Text style={[s.shopName, { color: colors.primaryText }]}>{item.name}</Text>
                  <Text style={[s.shopItems, { color: colors.tertiaryText }]}>
                    {item.remainingItems} of {item.totalItems} items remaining
                  </Text>
                </View>
                <View style={s.shopActions}>
                  <TouchableOpacity
                    style={[s.defaultButton, { backgroundColor: colors.inputBackground }]}
                    onPress={() => {
                      if (inDefaults) {
                        removeFromDefaults(item.name);
                      } else {
                        addToDefaults(item.name);
                      }
                    }}
                  >
                    <Text style={[s.defaultButtonText, { color: colors.accentColor }]}>{inDefaults ? '−' : '+'}</Text>
                  </TouchableOpacity>
                  <View style={[
                    s.circleBadge,
                    { backgroundColor: item.remainingItems === 0 ? colors.completedColor : colors.accentColor }
                  ]}>
                    <Text style={[s.circleBadgeText, { color: colors.accentText }]}>
                      {item.remainingItems === 0 ? '✓' : item.remainingItems}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      </SafeAreaView>
    </ThemedBackground>
  );
}
