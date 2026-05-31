export const migrationStatements = [
  `CREATE TABLE IF NOT EXISTS \`memo_item\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`list_id\` integer NOT NULL,
	\`title\` text NOT NULL,
	\`is_done\` integer DEFAULT false,
	\`is_checkable\` integer DEFAULT false,
	\`order\` integer DEFAULT 0,
	FOREIGN KEY (\`list_id\`) REFERENCES \`memo_list\`(\`id\`) ON UPDATE no action ON DELETE no action
);`,
  `CREATE TABLE IF NOT EXISTS \`memo_list\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`title\` text NOT NULL,
	\`created_at\` integer NOT NULL
);`,
  `CREATE TABLE IF NOT EXISTS \`shop_tab\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`list_id\` integer NOT NULL,
	\`name\` text NOT NULL,
	\`order\` integer DEFAULT 0,
	FOREIGN KEY (\`list_id\`) REFERENCES \`shopping_list\`(\`id\`) ON UPDATE no action ON DELETE no action
);`,
  `CREATE TABLE IF NOT EXISTS \`shopping_item\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`shop_tab_id\` integer NOT NULL,
	\`title\` text NOT NULL,
	\`is_done\` integer DEFAULT false,
	\`order\` integer DEFAULT 0,
	FOREIGN KEY (\`shop_tab_id\`) REFERENCES \`shop_tab\`(\`id\`) ON UPDATE no action ON DELETE no action
);`,
  `CREATE TABLE IF NOT EXISTS \`shopping_list\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`title\` text NOT NULL,
	\`is_active\` integer DEFAULT true,
	\`created_at\` integer NOT NULL
);`,
  `CREATE TABLE IF NOT EXISTS \`todo_item\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`list_id\` integer NOT NULL,
	\`title\` text NOT NULL,
	\`is_done\` integer DEFAULT false,
	\`due_date\` real,
	\`priority\` text,
	\`order\` integer DEFAULT 0,
	FOREIGN KEY (\`list_id\`) REFERENCES \`todo_list\`(\`id\`) ON UPDATE no action ON DELETE no action
);`,
  `CREATE TABLE IF NOT EXISTS \`todo_list\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`title\` text NOT NULL,
	\`created_at\` integer NOT NULL
);`,
  `CREATE TABLE IF NOT EXISTS \`default_shop\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`name\` text NOT NULL,
	\`order\` integer DEFAULT 0
);`,
  `CREATE TABLE IF NOT EXISTS \`preference\` (
	\`key\` text PRIMARY KEY NOT NULL,
	\`value\` text NOT NULL
);`,
];

export const alterStatements = [
  `ALTER TABLE \`memo_list\` ADD COLUMN \`is_pinned\` integer DEFAULT false;`,
  `ALTER TABLE \`memo_list\` ADD COLUMN \`is_archived\` integer DEFAULT false;`,
  `ALTER TABLE \`memo_list\` ADD COLUMN \`tags\` text;`,
  `ALTER TABLE \`memo_item\` ADD COLUMN \`item_type\` text DEFAULT 'note';`,
  `ALTER TABLE \`memo_item\` ADD COLUMN \`url\` text;`,
  `ALTER TABLE \`memo_item\` ADD COLUMN \`image_path\` text;`,
  `ALTER TABLE \`memo_item\` ADD COLUMN \`description\` text;`,
];

export default migrationStatements;