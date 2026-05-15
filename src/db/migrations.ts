export const migrationStatements = [
  `CREATE TABLE \`list_type\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`icon\` text NOT NULL,
	\`fields_config\` text,
	\`is_default\` integer DEFAULT false
);`,
  `CREATE TABLE \`memo_item\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`list_id\` integer NOT NULL,
	\`title\` text NOT NULL,
	\`is_done\` integer DEFAULT false,
	\`is_checkable\` integer DEFAULT false,
	\`order\` integer DEFAULT 0,
	FOREIGN KEY (\`list_id\`) REFERENCES \`memo_list\`(\`id\`) ON UPDATE no action ON DELETE no action
);`,
  `CREATE TABLE \`memo_list\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`title\` text NOT NULL,
	\`created_at\` integer NOT NULL
);`,
  `CREATE TABLE \`shop_tab\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`list_id\` integer NOT NULL,
	\`name\` text NOT NULL,
	\`order\` integer DEFAULT 0,
	FOREIGN KEY (\`list_id\`) REFERENCES \`shopping_list\`(\`id\`) ON UPDATE no action ON DELETE no action
);`,
  `CREATE TABLE \`shopping_item\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`shop_tab_id\` integer NOT NULL,
	\`title\` text NOT NULL,
	\`is_done\` integer DEFAULT false,
	\`order\` integer DEFAULT 0,
	FOREIGN KEY (\`shop_tab_id\`) REFERENCES \`shop_tab\`(\`id\`) ON UPDATE no action ON DELETE no action
);`,
  `CREATE TABLE \`shopping_list\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`title\` text NOT NULL,
	\`is_active\` integer DEFAULT true,
	\`created_at\` integer NOT NULL
);`,
  `CREATE TABLE \`todo_item\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`list_id\` integer NOT NULL,
	\`title\` text NOT NULL,
	\`is_done\` integer DEFAULT false,
	\`due_date\` real,
	\`priority\` text,
	\`order\` integer DEFAULT 0,
	FOREIGN KEY (\`list_id\`) REFERENCES \`todo_list\`(\`id\`) ON UPDATE no action ON DELETE no action
);`,
  `CREATE TABLE \`todo_list\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`title\` text NOT NULL,
	\`created_at\` integer NOT NULL
);`,
];

export default migrationStatements;