import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useTheme, ThemedBackground } from '../styles/theme';
import type { ThemeName } from '../styles/global';
import { createThemedStyles } from '../styles/global';
import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { usePreferences } from '../preferences/provider';
import { AVAILABLE_INTERVALS, DEFAULT_INTERVALS } from '../notifications';

const THEMES: ThemeName[] = ['dark', 'green', 'light'];

export default function PreferencesTabScreen() {
  const db = useDB();
  const { theme, setTheme, colors } = useTheme();
  const { notificationIntervals, setNotificationIntervals } = usePreferences();
  const s = createThemedStyles(colors);

  const [showAddShop, setShowAddShop] = useState(false);
  const [newShopName, setNewShopName] = useState('');

  const defaultShopsResult = useLiveQuery(
    db.select().from(schema.defaultShop).orderBy(schema.defaultShop.order)
  );
  const defaultShops = defaultShopsResult?.data ?? [];

  const handleAddDefaultShop = async () => {
    if (!newShopName.trim()) return;

    const trimmedName = newShopName.trim();
    const duplicate = defaultShops.find(
      shop => shop.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      Alert.alert('Shop Already Exists', `"${duplicate.name}" is already a default shop.`);
      return;
    }

    const maxOrder = defaultShops.length;
    await db.insert(schema.defaultShop).values({
      name: trimmedName,
      order: maxOrder + 1,
    }).run();
    setNewShopName('');
    setShowAddShop(false);
  };

  const handleDeleteDefaultShop = (shopId: number, shopName: string) => {
    Alert.alert(
      'Delete Default Shop',
      `Remove "${shopName}" from default shops?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await db.delete(schema.defaultShop).where(eq(schema.defaultShop.id, shopId)).run();
          }
        },
      ]
    );
  };

  return (
    <ThemedBackground colors={colors}>
      <SafeAreaView style={s.container}>
        <View style={[s.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.dividerColor }]}>
          <Text style={[s.headerTitle, { color: colors.primaryText }]}>⚙️ Preferences</Text>
        </View>

        <View style={{ flex: 1, padding: 16 }}>
          <View style={s.sectionTitle && { marginBottom: 24 }}>
            <Text style={[s.sectionTitle, { color: colors.accentColor }]}>About</Text>
            <Text style={[s.appName, { color: colors.primaryText }]}>listAll</Text>
            <Text style={[s.version, { color: colors.tertiaryText }]}>Version 1.0.0</Text>
            <Text style={[s.description, { color: colors.secondaryText }]}>
              A scalable list app for Shopping Lists, Memos, and Todos.
            </Text>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={[s.sectionTitle, { color: colors.accentColor }]}>Theme</Text>
            <View style={s.themeRow}>
              {THEMES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    s.themeOption,
                    { backgroundColor: colors.cardBackground },
                    theme === t && { backgroundColor: colors.accentColor }
                  ]}
                  onPress={() => setTheme(t)}
                >
                  <Text style={[
                    s.themeOptionText,
                    { color: colors.secondaryText },
                    theme === t && { color: colors.primaryText, fontWeight: '600' }
                  ]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={[s.sectionTitle, { color: colors.accentColor }]}>Todo Reminders</Text>
            <Text style={[{ fontSize: 13, color: colors.tertiaryText, marginBottom: 12 }]}>
              Notify before todos are due (global setting)
            </Text>
            <ScrollView style={{ maxHeight: 200 }}>
              {AVAILABLE_INTERVALS.map((interval) => {
                const isSelected = notificationIntervals.includes(interval.seconds);
                return (
                  <TouchableOpacity
                    key={interval.seconds}
                    style={[
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 4,
                        backgroundColor: colors.cardBackground,
                      },
                    ]}
                    onPress={() => {
                      const next = isSelected
                        ? notificationIntervals.filter(i => i !== interval.seconds)
                        : [...notificationIntervals, interval.seconds].sort((a, b) => a - b);
                      setNotificationIntervals(next.length > 0 ? next : DEFAULT_INTERVALS);
                    }}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.accentColor : colors.mutedText,
                      backgroundColor: isSelected ? colors.accentColor : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}>
                      {isSelected && <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                    </View>
                    <Text style={[{ fontSize: 14, color: colors.primaryText }]}>
                      {interval.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={{ marginBottom: 24 }}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.accentColor }]}>Default Shops</Text>
              {!showAddShop && (
                <TouchableOpacity onPress={() => setShowAddShop(true)}>
                  <Text style={[{ fontSize: 16, fontWeight: '600', color: colors.accentColor }]}>+ Add</Text>
                </TouchableOpacity>
              )}
            </View>
            {defaultShops.length === 0 ? (
              <Text style={[s.emptyText, { color: colors.mutedText }]}>No default shops set</Text>
            ) : (
              defaultShops.map(shop => (
                <TouchableOpacity
                  key={shop.id}
                  style={[s.shopItem, { backgroundColor: colors.cardBackground }]}
                  onLongPress={() => handleDeleteDefaultShop(shop.id, shop.name)}
                >
                  <Text style={[{ fontSize: 16, color: colors.primaryText }]}>{shop.name}</Text>
                  <TouchableOpacity onPress={() => handleDeleteDefaultShop(shop.id, shop.name)}>
                    <Text style={[s.deleteButton, { color: colors.deleteColor }]}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
            <Text style={[s.hintText, { color: colors.mutedText }]}>Long press or tap X to remove</Text>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={[s.sectionTitle, { color: colors.accentColor }]}>Info</Text>
            <Text style={[s.infoText, { color: colors.secondaryText }]}>
              • Shopping lists support multiple shop tabs{'\n'}
              • Memos support inline title editing{'\n'}
              • Todos support due dates and priorities{'\n'}
              • All data is stored locally
            </Text>
          </View>
        </View>

        <Modal visible={showAddShop} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: colors.cardBackground }]}>
              <Text style={[s.modalTitle, { color: colors.primaryText }]}>Add Default Shop</Text>
              <TextInput
                style={[s.modalInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
                placeholder="Shop name (e.g., Tesco)"
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
                  onPress={handleAddDefaultShop}
                  disabled={!newShopName.trim()}
                >
                  <Text style={[s.modalButtonTextPrimary, { color: colors.primaryText }]}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemedBackground>
  );
}
