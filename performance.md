=================================================================
deepseek v4 flash free ==== performance plan 2026-05-26 08:59 PM
=================================================================

Let me investigate the current state of the code to understand exactly what changes are needed, then present a plan. I should only use read-only tools (read, grep, glob, etc.) and not make any edits.
│ Explore Task — Investigate N+1 and reload patterns
└ 20 toolcalls · 1m 11s
ctrl+x down view subagents

Thought: Excellent analysis. Now I need to present a plan to the user for improving performance. Let me think about the key improvements:

1. ShoppingDetailScreen — Replace manual loadShopItems with a reactive useLiveQuery on shoppingItem (using inArray on all shop IDs). This eliminates 6 manual reload calls and the N+1 pattern.

2. MemosTabScreen and TodosTabScreen — Replace the useFocusEffect + N+1 loop with either:
   a. A single reactive query using inArray on all list IDs
   b. Or just a simpler approach using aggregate queries
   
   The useFocusEffect is redundant with useLiveQuery — especially since drizzle's useLiveQuery is already reactive.

3. ShoppingTabScreen — The loadShops N+1 pattern. This is trickier because this screen needs item counts for the summary. 
Actually, let me think about this more carefully. For the tab screens, the N+1 loop computes counts (remaining, priority breakdown, etc.). A reactive query with inArray would fetch all items, and the counts could be computed client-side from that data. This is actually simpler and avoids the N+1.
But there's a complexity: inArray could generate a very long SQL query if there are many lists. In practice, most users won't have hundreds of lists, so this is fine.

Let me outline the plan clearly:

Plan

1. ShoppingDetailScreen — reactive items
- Add a useLiveQuery on shoppingItem with inArray(schema.shoppingItem.shopTabId, activeShopTabIds) 
- Party trick: derive activeShopTabIds from the existing shopsResult live query
- Eliminate loadShopItems entirely (and all 6 manual calls)
- The duplicate check in handleAddItem can use the already-loaded reactive data instead of a new query

2. MemosTabScreen — batch items query
- Replace the useFocusEffect + N+1 loop with a reactive getAllByListIds (using inArray)
- Compute counts client-side from the reactive data
- This also removes the useFocusEffect overhead

3. TodosTabScreen — same as MemosTabScreen
- Same approach: batch items query via inArray, compute counts client-side
- Remove useFocusEffect

4. ShoppingTabScreen — optional
- Similar N+1 fix for loadShops if it's a real problem
- The loadShops is already cached-ish via state

5. Schema — optional onDelete: 'cascade'
- Add cascade deletes so the manual cascade patterns can be simplified

Let me present this to the user.

Here's the plan with estimated effort for each:

1. ShoppingDetailScreen — reactive items (medium effort)
Replace the manual N+1 loadShopItems pattern with a single reactive useLiveQuery on shoppingItem. The shopsResult live query already gives you the list of shop IDs — add a second reactive query:
const activeShopIds = shopsResult.data?.map(s => s.id) ?? [];
const itemsResult = useLiveQuery(activeShopIds.length > 0
  ? db.select().from(schema.shoppingItem).where(inArray(schema.shoppingItem.shopTabId, activeShopIds))
  : null
);

This eliminates:
- 6 manual loadShopItems() calls after every mutation
- The N+1 loop (N queries → 1 query)
- The useEffect bridge useEffect(() => { loadShopItems(...) }, [shopsResult?.data])
- The extra duplicate-check SELECT in handleAddItem (check against reactive data instead)

Items also need to be structured into per-shop buckets client-side via useMemo — essentially the same grouping loadShopItems does.
Risk: moderate — structural change to how items flow in the component.

2. MemosTabScreen — batch instead of N+1 (low effort)
Replace useFocusEffect + N+1 loop with a single reactive query:
const listIds = result.data?.map(l => l.id) ?? [];
const itemsResult = useLiveQuery(listIds.length > 0
  ? db.select().from(schema.memoItem).where(inArray(schema.memoItem.listId, listIds))
  : null
);
Compute MemoWithCount[] from this data via useMemo instead of loadMemoCounts. Remove useFocusEffect entirely — useLiveQuery is already reactive.
Risk: low — Memos have no extra filters (no priorities, no due dates).

3. TodosTabScreen — same approach (low effort)
Same pattern as MemosTabScreen — single batch query, compute counts client-side.
Todo items have extra filters (priority, overdue), but these are just Array.filter() calls on already-loaded data.
Risk: low.

4. ShoppingTabScreen — optional (medium effort)
Same pattern: batch query all items for the active list's shops, compute counts client-side. More coupled logic here (default shop sync, syncDefaultsToList). Lower priority — the N+1 runs on focus/startup, not on every mutation.
Risk: moderate (tight coupling with default shop logic).

5. Schema — ON DELETE CASCADE (trivial)
Add onDelete: 'cascade' to the FK definitions in schema.ts:
export const shopTab = sqliteTable('shop_tab', {
  listId: integer('list_id').references(() => shoppingList.id, { onDelete: 'cascade' }).notNull(),
  ...
});
Then the DB handles orphan cleanup automatically — no more manual cascadeDelete calls. Requires a new migration.
Risk: very low — SQLite cascade is well-tested.

Recommended order
Step	Files	Effort
2 (MemosTabScreen)	~20 lines changed, remove useFocusEffect	Easy
3 (TodosTabScreen)	~25 lines changed, same pattern	Easy
1 (ShoppingDetailScreen)	Major refactor of item data flow	Significant
4 (ShoppingTabScreen)	Depends on need — skip for now	Lower priority
5 (Schema cascade)	5 lines in schema.ts + migration	Trivial but optional
Want me to start with steps 2 and 3 (the easy wins) and see how it goes before tackling the bigger ShoppingDetailScreen change?
