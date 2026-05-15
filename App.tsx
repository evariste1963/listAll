import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { DBProvider } from './src/db/provider';
import ShoppingTabScreen from './src/screens/ShoppingTabScreen';
import MemosTabScreen from './src/screens/MemosTabScreen';
import TodosTabScreen from './src/screens/TodosTabScreen';
import PreferencesTabScreen from './src/screens/PreferencesTabScreen';
import CreateShoppingListScreen from './src/screens/CreateShoppingListScreen';
import CreateMemoListScreen from './src/screens/CreateMemoListScreen';
import CreateTodoListScreen from './src/screens/CreateTodoListScreen';
import ShoppingDetailScreen from './src/screens/ShoppingDetailScreen';
import MemoDetailScreen from './src/screens/MemoDetailScreen';
import TodoDetailScreen from './src/screens/TodoDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <Text style={{ 
        fontSize: 10, 
        color: focused ? '#e94560' : '#888',
        marginTop: 2 
      }}>
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#16213e',
          borderTopColor: '#0f3460',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="ShoppingTab" 
        component={ShoppingTabScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🛒" label="Shopping" focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="MemosTab" 
        component={MemosTabScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📝" label="Memos" focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="TodosTab" 
        component={TodosTabScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="✅" label="Todos" focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="PreferencesTab" 
        component={PreferencesTabScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⚙️" label="Prefs" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <DBProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#16213e',
            },
            headerTintColor: '#fff',
            contentStyle: {
              backgroundColor: '#1a1a2e',
            },
          }}
        >
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="CreateShoppingList" 
            component={CreateShoppingListScreen}
            options={{ title: 'New Shopping List' }}
          />
          <Stack.Screen 
            name="CreateMemoList" 
            component={CreateMemoListScreen}
            options={{ title: 'New Memo' }}
          />
          <Stack.Screen 
            name="CreateTodoList" 
            component={CreateTodoListScreen}
            options={{ title: 'New Todo List' }}
          />
          <Stack.Screen 
            name="ShoppingDetail" 
            component={ShoppingDetailScreen}
            options={{ title: 'Shopping List' }}
          />
          <Stack.Screen 
            name="MemoDetail" 
            component={MemoDetailScreen}
            options={{ title: 'Memo' }}
          />
          <Stack.Screen 
            name="TodoDetail" 
            component={TodoDetailScreen}
            options={{ title: 'Todo List' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </DBProvider>
  );
}