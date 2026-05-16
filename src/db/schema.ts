import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const listType = sqliteTable('list_type', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  fieldsConfig: text('fields_config'), // JSON string
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
});

export const shoppingList = sqliteTable('shopping_list', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const shopTab = sqliteTable('shop_tab', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').references(() => shoppingList.id).notNull(),
  name: text('name').notNull(),
  order: integer('order').default(0),
});

export const memoList = sqliteTable('memo_list', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const todoList = sqliteTable('todo_list', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const shoppingItem = sqliteTable('shopping_item', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shopTabId: integer('shop_tab_id').references(() => shopTab.id).notNull(),
  title: text('title').notNull(),
  isDone: integer('is_done', { mode: 'boolean' }).default(false),
  order: integer('order').default(0),
});

export const memoItem = sqliteTable('memo_item', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').references(() => memoList.id).notNull(),
  title: text('title').notNull(),
  isDone: integer('is_done', { mode: 'boolean' }).default(false),
  isCheckable: integer('is_checkable', { mode: 'boolean' }).default(false),
  order: integer('order').default(0),
});

export const todoItem = sqliteTable('todo_item', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').references(() => todoList.id).notNull(),
  title: text('title').notNull(),
  isDone: integer('is_done', { mode: 'boolean' }).default(false),
  dueDate: real('due_date'), // timestamp
  priority: text('priority'), // 'low' | 'medium' | 'high'
  order: integer('order').default(0),
});

export const defaultShop = sqliteTable('default_shop', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  order: integer('order').default(0),
});

// Types
export type ListType = typeof listType.$inferSelect;
export type ShoppingList = typeof shoppingList.$inferSelect;
export type ShopTab = typeof shopTab.$inferSelect;
export type MemoList = typeof memoList.$inferSelect;
export type TodoList = typeof todoList.$inferSelect;
export type ShoppingItem = typeof shoppingItem.$inferSelect;
export type MemoItem = typeof memoItem.$inferSelect;
export type TodoItem = typeof todoItem.$inferSelect;
export type DefaultShop = typeof defaultShop.$inferSelect;