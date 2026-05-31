import { eq } from 'drizzle-orm';

export function getById(db: any, table: any, id: number) {
  return db.select().from(table).where(eq(table.id, id));
}

export function getAll(db: any, table: any) {
  return db.select().from(table).orderBy(table.createdAt);
}

export async function getAllFlat(db: any, table: any): Promise<any[]> {
  return await db.select().from(table).all();
}

export async function create(db: any, table: any, values: any): Promise<any> {
  const [row] = await db.insert(table).values(values).returning();
  return row;
}

export async function toggleArchive(db: any, table: any, id: number, currentArchived: boolean | null): Promise<void> {
  await db.update(table).set({ isArchived: !currentArchived }).where(eq(table.id, id)).run();
}

export async function togglePin(db: any, table: any, id: number, currentPinned: boolean | null): Promise<void> {
  await db.update(table).set({ isPinned: !currentPinned }).where(eq(table.id, id)).run();
}

export async function updateTitle(db: any, table: any, id: number, title: string): Promise<void> {
  await db.update(table).set({ title }).where(eq(table.id, id)).run();
}

export async function remove(db: any, table: any, id: number): Promise<void> {
  await db.delete(table).where(eq(table.id, id)).run();
}

export async function cascadeDelete(
  db: any,
  listTable: any,
  itemTable: any,
  listId: number,
  itemFkColumn: any,
): Promise<void> {
  await db.delete(itemTable).where(eq(itemFkColumn, listId)).run();
  await db.delete(listTable).where(eq(listTable.id, listId)).run();
}
