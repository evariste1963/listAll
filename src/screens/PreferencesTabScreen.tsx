import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDB } from '../db/provider';
import { schema } from '../db/index';
import { eq } from 'drizzle-orm';

export default function PreferencesTabScreen() {
  const db = useDB();
  const navigation = useNavigation<any>();

  const [defaultShops, setDefaultShops] = useState<typeof schema.defaultShop.$inferSelect[]>([]);
  const [showAddShop, setShowAddShop] = useState(false);
  const [newShopName, setNewShopName] = useState('');

  useEffect(() => {
    loadDefaultShops();
  }, []);

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

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your lists and items. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            await db.delete(schema.shoppingItem).run();
            await db.delete(schema.shopTab).run();
            await db.delete(schema.shoppingList).run();
            await db.delete(schema.memoItem).run();
            await db.delete(schema.memoList).run();
            await db.delete(schema.todoItem).run();
            await db.delete(schema.todoList).run();
            Alert.alert('Done', 'All data cleared');
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Preferences</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.appName}>listAll</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>
            A scalable list app for Shopping Lists, Memos, and Todos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity style={styles.option} onPress={handleResetTemplates}>
            <Text style={styles.optionText}>Reset Templates</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={handleClearData}>
            <Text style={styles.optionTextDanger}>Clear All Data</Text>
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
});