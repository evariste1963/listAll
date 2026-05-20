import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './src/styles/theme';
import HomeTabScreen from './src/screens/HomeTabScreen';
import ShoppingTabScreen from './src/screens/ShoppingTabScreen';
import MemosTabScreen from './src/screens/MemosTabScreen';
import TodosTabScreen from './src/screens/TodosTabScreen';
import PreferencesTabScreen from './src/screens/PreferencesTabScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = [
  { name: 'Home', icon: '🏠', Screen: HomeTabScreen, isTodos: false },
  { name: 'Shopping', icon: '🛒', Screen: ShoppingTabScreen, isTodos: false },
  { name: 'Memos', icon: '📝', Screen: MemosTabScreen, isTodos: false },
  { name: 'Todos', icon: '✓', Screen: TodosTabScreen, isTodos: true },
  { name: 'Prefs', icon: '⚙️', Screen: PreferencesTabScreen, isTodos: false },
];

export default function SwipeableTabs() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleTabPress = useCallback((index: number, animated = true) => {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated });
  }, []);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < TABS.length) {
      setActiveIndex(index);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
      >
        {TABS.map(({ name, Screen }) => (
          <View key={name} style={styles.page}>
            <Screen onTabChange={handleTabPress} />
          </View>
        ))}
      </ScrollView>
      <View style={[
        styles.tabBar, 
        { 
          backgroundColor: colors.pageBackground, 
          borderTopColor: colors.dividerColor,
          paddingBottom: insets.bottom,
        }
      ]}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handleTabPress(index, false)}
          >
            <View style={[styles.tabIconWrapper, tab.isTodos && { backgroundColor: colors.priorityLow }]}>
              <Text style={[styles.tabIcon, tab.isTodos && { color: '#fff', fontSize: 16 }]}>{tab.icon}</Text>
            </View>
            <Text style={[
              styles.tabLabel,
              { color: activeIndex === index ? colors.accentColor : colors.tertiaryText }
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  page: {
    width: SCREEN_WIDTH,
  },
});
