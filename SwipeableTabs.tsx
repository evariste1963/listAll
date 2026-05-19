import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './src/styles/theme';
import ShoppingTabScreen from './src/screens/ShoppingTabScreen';
import MemosTabScreen from './src/screens/MemosTabScreen';
import TodosTabScreen from './src/screens/TodosTabScreen';
import PreferencesTabScreen from './src/screens/PreferencesTabScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TAB_MAP: Record<string, number> = {
  ShoppingTab: 0,
  MemosTab: 1,
  TodosTab: 2,
  PreferencesTab: 3,
};

const TABS = [
  { name: 'Shopping', icon: '🛒', Screen: ShoppingTabScreen },
  { name: 'Memos', icon: '📝', Screen: MemosTabScreen },
  { name: 'Todos', icon: '✅', Screen: TodosTabScreen },
  { name: 'Prefs', icon: '⚙️', Screen: PreferencesTabScreen },
];

export default function SwipeableTabs({ route }: { route?: { params?: { screen?: string } } }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  const getInitialIndex = () => {
    if (route?.params?.screen) {
      return TAB_MAP[route.params.screen] ?? 0;
    }
    return 0;
  };
  
  const [activeIndex, setActiveIndex] = useState(getInitialIndex);
  const scrollRef = useRef<ScrollView>(null);
  const isScrolled = useRef(false);

  useEffect(() => {
    if (!isScrolled.current && scrollRef.current) {
      isScrolled.current = true;
      const initialX = getInitialIndex() * SCREEN_WIDTH;
      scrollRef.current.scrollTo({ x: initialX, animated: false });
    }
  }, []);

  const handleMomentumScrollEnd = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < TABS.length) {
      setActiveIndex(index);
    }
  };

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
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
            <Screen />
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
            onPress={() => handleTabPress(index)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
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