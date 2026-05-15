import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: undefined;
  ShoppingDetail: { listId: number };
  MemoDetail: { listId: number };
  TodoDetail: { listId: number };
  CreateShoppingList: undefined;
  CreateMemoList: undefined;
  CreateTodoList: undefined;
};

export type TabParamList = {
  ShoppingTab: undefined;
  MemosTab: undefined;
  TodosTab: undefined;
  PreferencesTab: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = 
  BottomTabScreenProps<TabParamList, T>;

export type ShoppingDetailProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'ShoppingDetail'>,
  BottomTabScreenProps<TabParamList>
>;

export type MemoDetailProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'MemoDetail'>,
  BottomTabScreenProps<TabParamList>
>;

export type TodoDetailProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'TodoDetail'>,
  BottomTabScreenProps<TabParamList>
>;