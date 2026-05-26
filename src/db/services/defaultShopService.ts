import { eq } from 'drizzle-orm';
import * as schema from '../schema';

export function getAll(db: any) {
  return db.select().from(schema.defaultShop).orderBy(schema.defaultShop.order);
}

export async function getAllFlat(db: any): Promise<any[]> {
  return await db.select().from(schema.defaultShop).orderBy(schema.defaultShop.order).all();
}

export async function add(db: any, name: string, order?: number): Promise<void> {
  const shops = await getAllFlat(db);
  await db.insert(schema.defaultShop).values({
    name,
    order: order ?? shops.length + 1,
  }).run();
}

export async function remove(db: any, id: number): Promise<void> {
  await db.delete(schema.defaultShop).where(eq(schema.defaultShop.id, id)).run();
}
