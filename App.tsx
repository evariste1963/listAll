import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DBProvider } from './src/db/provider';
import { ThemeProvider, useTheme } from './src/styles/theme';
import SwipeableTabs from './SwipeableTabs';
import CreateMemoListScreen from './src/screens/CreateMemoListScreen';
import CreateTodoListScreen from './src/screens/CreateTodoListScreen';
import ShoppingDetailScreen from './src/screens/ShoppingDetailScreen';
import MemoDetailScreen from './src/screens/MemoDetailScreen';
import TodoDetailScreen from './src/screens/TodoDetailScreen';
import GuideScreen from './src/screens/GuideScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { colors, theme } = useTheme();

  const greenTheme = theme === 'green';
  const darkTheme = theme === 'dark';
  const navigationTheme = {
    ...(darkTheme || greenTheme ? DarkTheme : DefaultTheme),
    colors: {
      ...(darkTheme || greenTheme ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.accentColor,
      background: colors.pageBackground,
      card: colors.cardBackground,
      text: colors.primaryText,
      border: colors.dividerColor,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.cardBackground,
          },
          headerTintColor: colors.primaryText,
          headerBackTitle: 'Back',
          contentStyle: {
            backgroundColor: colors.pageBackground,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={SwipeableTabs}
          options={{ headerShown: false }}
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
          options={{
            headerTitle: '',
            headerBackTitle: 'Back',
            headerBackVisible: true,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="MemoDetail"
          component={MemoDetailScreen}
          options={{ title: 'Memo', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="TodoDetail"
          component={TodoDetailScreen}
          options={{ title: 'Todo List', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="Guide"
          component={GuideScreen}
          options={{ title: 'Guide', headerBackTitle: 'Back' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DBProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </DBProvider>
    </SafeAreaProvider>
  );
}
