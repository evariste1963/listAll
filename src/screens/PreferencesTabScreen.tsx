import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { useTheme, ThemeName } from '../styles/theme';
import { eq } from 'drizzle-orm';

export default function PreferencesTabScreen() {
  const db = useDB();
  const navigation = useNavigation<any>();
  const { theme, setTheme, colors } = useTheme();

  const [defaultShops, setDefaultShops] = useState<typeof schema.defaultShop.$inferSelect[]>([]);
  const [showAddShop, setShowAddShop] = useState(false);
  const [newShopName, setNewShopName] = useState('');

  useEffect(() => {
    loadDefaultShops();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDefaultShops();
    }, [])
  );

  const loadDefaultShops = async () => {
    const shops = await db.select().from(schema.defaultShop).orderBy(schema.defaultShop.order).all();
    setDefaultShops(shops);
  };

  const handleAddDefaultShop = async () => {
    if (!newShopName.trim()) return;
    const maxOrder = defaultShops.length;
    await db.insert(schema.defaultShop).values({
      name: newShopName.trim(),
      order: maxOrder + 1,
    }).run();
    setNewShopName('');
    setShowAddShop(false);
    loadDefaultShops();
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
            loadDefaultShops();
          }
        },
      ]
    );
  };

  const handleResetTemplates = () => {
    Alert.alert(
      'Reset Templates',
      'Reset list types to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: async () => {
            await db.delete(schema.listType).run();
            await db.insert(schema.listType).values([
              { id: 1, name: 'shopping', icon: '🛒', fieldsConfig: '{}', isDefault: true },
              { id: 2, name: 'memo', icon: '📝', fieldsConfig: '{"isCheckable":true}', isDefault: true },
              { id: 3, name: 'todo', icon: '✅', fieldsConfig: '{"dueDate":true,"priority":true}', isDefault: true },
            ]).run();
            Alert.alert('Done', 'Templates reset');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>⚙️ Preferences</Text>
      </View>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>About</Text>
          <Text style={[styles.appName, { color: colors.text }]}>listAll</Text>
          <Text style={[styles.version, { color: colors.textTertiary }]}>Version 1.0.0</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            A scalable list app for Shopping Lists, Memos, and Todos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Theme</Text>
          <View style={styles.themeRow}>
            {(['dark', 'green', 'light'] as ThemeName[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.themeOption,
                  { backgroundColor: colors.surface },
                  theme === t && { backgroundColor: colors.primary }
                ]}
                onPress={() => setTheme(t)}
              >
                <Text style={[
                  styles.themeOptionText,
                  { color: colors.textSecondary },
                  theme === t && { color: colors.text, fontWeight: '600' }
                ]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity style={styles.option} onPress={handleResetTemplates}>
            <Text style={styles.optionText}>Reset Templates</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Default Shops</Text>
            <TouchableOpacity onPress={() => setShowAddShop(true)}>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {defaultShops.length === 0 ? (
            <Text style={styles.emptyText}>No default shops set</Text>
          ) : (
            defaultShops.map(shop => (
              <TouchableOpacity
                key={shop.id}
                style={styles.shopItem}
                onLongPress={() => handleDeleteDefaultShop(shop.id, shop.name)}
              >
                <Text style={styles.shopName}>{shop.name}</Text>
                <TouchableOpacity onPress={() => handleDeleteDefaultShop(shop.id, shop.name)}>
                  <Text style={styles.deleteButton}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
          <Text style={styles.hintText}>Long press or tap X to remove</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info</Text>
          <Text style={styles.infoText}>
            • Shopping lists support multiple shop tabs{'\n'}
            • Memos can have optional checkboxes{'\n'}
            • Todos support due dates and priorities{'\n'}
            • All data is stored locally
          </Text>
        </View>
      </View>

      <Modal visible={showAddShop} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Default Shop</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Shop name (e.g., Tesco)"
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
                onPress={handleAddDefaultShop}
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e94560',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
  option: {
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  optionTextDanger: {
    fontSize: 16,
    color: '#e94560',
  },
  infoText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  shopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  shopName: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    color: '#e94560',
    fontSize: 18,
    padding: 4,
  },
  hintText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
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
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#16213e',
    alignItems: 'center',
  },
  themeOptionActive: {
    backgroundColor: '#e94560',
  },
  themeOptionText: {
    color: '#aaa',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  themeOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});