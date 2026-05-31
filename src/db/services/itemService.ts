import { eq, inArray, like } from 'drizzle-orm';

export function searchByTitle(db: any, table: any, query: string) {
  return db.select().from(table).where(like(table.title, `%${query}%`)).orderBy(table.order);
}

export function getByParentId(db: any, table: any, fkColumn: any, parentId: number) {
  return db.select().from(table).where(eq(fkColumn, parentId)).orderBy(table.order);
}

export async function getAllByParentFlat(db: any, table: any, fkColumn: any, parentId: number): Promise<any[]> {
  return await db.select().from(table).where(eq(fkColumn, parentId)).all();
}

export function getById(db: any, table: any, id: number) {
  return db.select().from(table).where(eq(table.id, id));
}

export async function create(db: any, table: any, values: any): Promise<number> {
  const result = await db.insert(table).values(values).run();
  return Number(result.lastInsertRowId);
}

export async function update(db: any, table: any, id: number, values: any): Promise<void> {
  await db.update(table).set(values).where(eq(table.id, id)).run();
}

export async function toggleDone(db: any, table: any, id: number, currentDone: boolean | null): Promise<void> {
  await db.update(table).set({ isDone: !currentDone }).where(eq(table.id, id)).run();
}

export async function toggleCheckable(db: any, table: any, id: number, currentCheckable: boolean | null): Promise<void> {
  await db.update(table).set({ isCheckable: !currentCheckable }).where(eq(table.id, id)).run();
}

export async function remove(db: any, table: any, id: number): Promise<void> {
  await db.delete(table).where(eq(table.id, id)).run();
}

export async function removeByParent(db: any, table: any, fkColumn: any, parentId: number): Promise<void> {
  await db.delete(table).where(eq(fkColumn, parentId)).run();
}

export async function removeByIds(db: any, table: any, ids: number[]): Promise<void> {
  await db.delete(table).where(inArray(table.id, ids)).run();
}
