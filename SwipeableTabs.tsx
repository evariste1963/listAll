import React, { useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ThemedBackground } from './src/styles/theme';
import { createThemedStyles } from './src/styles/global';
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
  const s = createThemedStyles(colors);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleTabPress = useCallback((index: number, animated = true) => {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated });
  }, []);

  const handleMomentumScrollEnd = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < TABS.length) {
      setActiveIndex(index);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['left', 'right']}>
      <ThemedBackground colors={colors}>
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
            <View key={name} style={{ width: SCREEN_WIDTH }}>
              <Screen onTabChange={handleTabPress} />
            </View>
          ))}
        </ScrollView>
        <View style={[
          s.tabBarContainer, 
          { 
            backgroundColor: colors.pageBackground, 
            borderTopColor: colors.dividerColor,
            paddingBottom: insets.bottom,
          }
        ]}>
          {TABS.map((tab, index) => (
            <TouchableOpacity
              key={tab.name}
              style={s.tabBarButton}
              onPress={() => handleTabPress(index, false)}
            >
              <View style={[s.tabBarIconWrapper, tab.isTodos && { backgroundColor: colors.todoIconBg }]}>
                <Text style={[s.tabBarIcon, tab.isTodos && { color: '#fff', fontSize: 16 }]}>{tab.icon}</Text>
              </View>
              <Text style={[
                s.tabBarLabel,
                { color: activeIndex === index ? colors.accentColor : colors.tertiaryText }
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedBackground>
    </SafeAreaView>
  );
}
