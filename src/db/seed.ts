import { db, schema } from './index';
import { eq } from 'drizzle-orm';

const defaultTypes = [
  {
    id: 1,
    name: 'shopping',
    icon: '🛒',
    fieldsConfig: JSON.stringify({}),
    isDefault: true,
  },
  {
    id: 2,
    name: 'memo',
    icon: '📝',
    fieldsConfig: JSON.stringify({ isCheckable: true }),
    isDefault: true,
  },
  {
    id: 3,
    name: 'todo',
    icon: '✓',
    fieldsConfig: JSON.stringify({ dueDate: true, priority: true }),
    isDefault: true,
  },
];

export async function seedListTypes() {
  const existing = await db.select().from(schema.listType).where(eq(schema.listType.id, 1));
  
  if (existing.length === 0) {
    await db.insert(schema.listType).values(defaultTypes).run();
  }
}