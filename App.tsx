import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { DBProvider } from './src/db/provider';
import { ThemeProvider, useTheme } from './src/styles/theme';
import HomeScreen from './src/screens/HomeScreen';
import ShoppingTabScreen from './src/screens/ShoppingTabScreen';
import MemosTabScreen from './src/screens/MemosTabScreen';
import TodosTabScreen from './src/screens/TodosTabScreen';
import PreferencesTabScreen from './src/screens/PreferencesTabScreen';
import CreateMemoListScreen from './src/screens/CreateMemoListScreen';
import CreateTodoListScreen from './src/screens/CreateTodoListScreen';
import ShoppingDetailScreen from './src/screens/ShoppingDetailScreen';
import MemoDetailScreen from './src/screens/MemoDetailScreen';
import TodoDetailScreen from './src/screens/TodoDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');

function GradientBackground({ children, gradientColors }: { children: React.ReactNode; gradientColors?: string[] }) {
  if (!gradientColors || gradientColors.length === 0) {
    return <>{children}</>;
  }
  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientBg}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
    width,
    minHeight: height,
  },
});

function TabIcon({ icon, label, focused, primaryColor, mutedColor }: { icon: string; label: string; focused: boolean; primaryColor: string; mutedColor: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 4, minWidth: 60 }}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <Text style={{ 
        fontSize: 10, 
        color: focused ? primaryColor : mutedColor,
        marginTop: 2,
      }}>
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.dividerColor,
          height: 60 + insets.bottom,
          paddingBottom: 4 + insets.bottom,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen 
        name="ShoppingTab" 
        component={ShoppingTabScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🛒" label="Shopping" focused={focused} primaryColor={colors.accentColor} mutedColor={colors.tertiaryText} />
          ),
        }}
      />
      <Tab.Screen 
        name="MemosTab" 
        component={MemosTabScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📝" label="Memos" focused={focused} primaryColor={colors.accentColor} mutedColor={colors.tertiaryText} />
          ),
        }}
      />
      <Tab.Screen 
        name="TodosTab" 
        component={TodosTabScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="✅" label="Todos" focused={focused} primaryColor={colors.accentColor} mutedColor={colors.tertiaryText} />
          ),
        }}
      />
      <Tab.Screen 
        name="PreferencesTab" 
        component={PreferencesTabScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⚙️" label="Prefs" focused={focused} primaryColor={colors.accentColor} mutedColor={colors.tertiaryText} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

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
      <GradientBackground gradientColors={colors.gradientColors}>
        <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
        <Stack.Navigator
        initialRouteName="Home"
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
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
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
      </Stack.Navigator>
      </GradientBackground>
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