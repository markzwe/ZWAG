const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const root = path.resolve(__dirname, '..');
const localRequire = createRequire(path.join(root, 'package.json'));
const compiled = new Map();
const plain = value => JSON.parse(JSON.stringify(value));
function load(file, OpenAI) {
  if (!compiled.has(file)) compiled.set(file, buildSync({ absWorkingDir: root, entryPoints: [file], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external' }).outputFiles[0].text);
  const module = { exports: {} };
  vm.runInNewContext(compiled.get(file), {
    module, exports: module.exports,
    require: name => name === 'openai' ? OpenAI : localRequire(name),
    process: { env: { CONVEX_OPENAI_API_KEY: 'synthetic-test-key' } },
    console: { log() {}, warn() {}, error() {} },
  });
  return module.exports;
}
const rules = load('lib/outfitRules.ts');
const historyApi = load('convex/outfitHistory.ts');
const outfitsApi = load('convex/outfits.ts');
const item = (id, category, subcategory, userId = 'u1') => ({ _id: id, _creationTime: 1, userId, category, subcategory, color: 'blue', caption: 'Synthetic garment', style: ['Casual'], imageUrl: 'https://example.invalid/synthetic.png', storageId: 'synthetic' });
const closet = [item('t1', 'Tops', 'Shirts'), item('t2', 'Tops', 'T-Shirts'), item('b1', 'Bottoms', 'Jeans'), item('b2', 'Bottoms', 'Chinos')];
const asCandidates = items => items.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
const topBottom = { top: 't1', bottom: 'b1' };
const response = value => ({ choices: [{ message: { content: typeof value === 'string' ? value : JSON.stringify(value) } }] });

function generation({ items = closet, previous = [], reply = () => response(topBottom) } = {}) {
  const requests = []; const clients = [];
  class FakeOpenAI {
    constructor(options) { clients.push(options); }
    chat = { completions: { create: async request => {
      requests.push(plain(request));
      return reply(request, requests.length);
    } } };
  }
  const { analyzeOutfit } = load('convex/generateOutfits.ts', FakeOpenAI);
  const run = args => analyzeOutfit._handler({ runQuery: async () => ({ items, previousOutfits: previous }) }, { preferredItemsId: [], ...args });
  return { run, requests, clients };
}

function database(items = closet, subject = 'clerk1') {
  const tables = { users: [{ _id: 'u1', clerkId: 'clerk1' }, { _id: 'u2', clerkId: 'clerk2' }], items: plain(items), outfitHistory: [], outfitFeedback: [], outfits: [] };
  const ctx = {
    auth: { getUserIdentity: async () => subject ? { subject } : null },
    db: {
      query(table) {
        const filters = [];
        const query = {
          withIndex(_name, configure) { const q = { eq(key, value) { filters.push([key, value]); return q; } }; configure(q); return query; },
          async collect() { return tables[table].filter(row => filters.every(([key, value]) => row[key] === value)); },
          async first() { return (await query.collect())[0] ?? null; },
        };
        return query;
      },
      async get(id) { return Object.values(tables).flat().find(row => row._id === id) ?? null; },
      async insert(table, values) { const _id = `${table}-${tables[table].length + 1}`; tables[table].push({ ...values, _id, _creationTime: 1 }); return _id; },
    },
  };
  return { ctx, tables };
}
const show = (ctx, outfit = topBottom, eventId = 'shown-1') => historyApi.recordShown._handler(ctx, { outfit, source: 'rules', occasion: 'Casual', eventId });

// All data in these tests is synthetic; no deployment records or paid API calls.
test('candidates group categories, retain all garment types, deduplicate, and prioritize preferred IDs', () => {
  const items = [...closet, closet[0], item('shorts', 'Bottoms', 'Shorts'), item('parka', 'Outerwear', 'Parkas'), item('tank', 'Tops', 'Tank Tops'), item('unknown', 'Mystery', 'Unknown')];
  const candidates = rules.buildCandidates(asCandidates(items), ['t2']);
  assert.deepEqual(plain(candidates.top.map(i => i.id)), ['t2', 't1', 'tank']);
  assert.deepEqual(plain(candidates.bottom.map(i => i.id)), ['b1', 'b2', 'shorts']);
  assert.equal(candidates.outerwear[0].id, 'parka');
  assert.equal(Object.values(candidates).flat().some(i => i.id === 'unknown'), false);
});

test('validator rejects missing IDs, wrong slots, duplicates, incomplete outfits and unknown slots', () => {
  const candidates = rules.buildCandidates(asCandidates(closet));
  for (const invalid of [null, [], { top: 'missing', bottom: 'b1' }, { top: 'b1', bottom: 't1' }, { top: 't1', bottom: 't1' }, { top: 't1' }, { ...topBottom, hat: 'x' }, { ...topBottom, accessories: 'x' }, { ...topBottom, accessories: [] }]) {
    assert.ok(rules.validateOutfit(invalid, candidates).errors.length, JSON.stringify(invalid));
  }
  assert.equal(rules.validateOutfit(topBottom, candidates).errors.length, 0);
});

test('full-body outfits are valid alone, but cannot be mixed with separates', () => {
  const candidates = rules.buildCandidates(asCandidates([...closet, item('dress', 'Full Body', 'Dresses')]));
  assert.equal(rules.validateOutfit({ fullBody: 'dress' }, candidates).errors.length, 0);
  assert.ok(rules.validateOutfit({ ...topBottom, fullBody: 'dress' }, candidates).errors.length);
});

test('accessories are arrays, unique across all slots, limited to five, and order-independent in history', () => {
  const items = [...closet, ...Array.from({ length: 6 }, (_, i) => item(`a${i}`, 'Accessories', 'Watches'))];
  const candidates = rules.buildCandidates(asCandidates(items));
  assert.ok(rules.validateOutfit({ ...topBottom, accessories: ['a1', 'a1'] }, candidates).errors.length);
  assert.ok(rules.validateOutfit({ ...topBottom, accessories: ['t1'] }, candidates).errors.length);
  assert.ok(rules.validateOutfit({ ...topBottom, accessories: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5'] }, candidates).errors.length);
  const signature = rules.outfitSignature({ ...topBottom, accessories: ['a1', 'a2'] });
  assert.ok(rules.validateOutfit({ ...topBottom, accessories: ['a2', 'a1'] }, candidates, new Set([signature])).errors.length);
});

test('invalid model output is retried exactly once with validation errors, then accepted only if repaired', async () => {
  const { run, requests, clients } = generation({ reply: (_request, n) => response(n === 1 ? { top: 'b1', bottom: 'b1' } : topBottom) });
  const result = await run();
  assert.equal(result.source, 'ai');
  assert.equal(Object.hasOwn(result, 'weather'), false);
  assert.equal(requests.length, 2);
  assert.match(requests[1].messages.at(-1).content, /Invalid outfit:.*eligible top candidate/);
  assert.equal(clients[0].maxRetries, 0);
  assert.equal(clients[0].timeout, 30000);
  assert.equal(requests[0].response_format.type, 'json_object');
  assert.equal(requests[0].max_completion_tokens, 2048);
});

test('malformed and still-invalid model output falls back to a complete category-valid outfit', async () => {
  const { run, requests } = generation({ reply: (_request, n) => response(n === 1 ? 'bad json' : { top: 'missing' }) });
  const result = await run();
  assert.equal(result.source, 'rules');
  assert.equal(requests.length, 2);
  assert.equal(rules.validateOutfit(result.outfit, rules.buildCandidates(asCandidates(closet))).errors.length, 0);
});

test('the prompt excludes ineligible items and includes the do-not-repeat list', async () => {
  const { run, requests } = generation({ items: [...closet, item('excluded-unknown', 'Mystery', 'Unknown')], previous: [topBottom], reply: () => response({ top: 't2', bottom: 'b1' }) });
  await run();
  assert.doesNotMatch(requests[0].messages[0].content, /excluded-unknown/);
  assert.match(requests[0].messages[0].content, /previously shown.*t1.*b1/);
});

test('repeated AI suggestions are rejected and the fallback finds a different outfit', async () => {
  const { run, requests } = generation({ previous: [topBottom] });
  const result = await run();
  assert.equal(result.source, 'rules');
  assert.equal(requests.length, 2);
  assert.notEqual(rules.outfitSignature(result.outfit), rules.outfitSignature(topBottom));
});

test('quota or network errors use the local fallback without retrying the provider', async () => {
  const { run, requests } = generation({ reply: () => { throw new Error('credit_balance_exhausted'); } });
  assert.equal((await run()).source, 'rules');
  assert.equal(requests.length, 1);
});

test('an incomplete or exhausted closet returns an actionable error, never an invalid/repeated outfit', async () => {
  for (const config of [{ items: [closet[0]] }, { items: [closet[0], closet[2]], previous: [topBottom] }]) {
    const { run, requests } = generation(config);
    await assert.rejects(run(), /No new complete outfit/);
    assert.equal(requests.length, 0);
  }
});

test('fallback searches accessory combinations rather than falsely reporting exhaustion', () => {
  const candidates = rules.buildCandidates(asCandidates([closet[0], closet[2], item('a1', 'Accessories', 'Watches'), item('a2', 'Accessories', 'Hats')]));
  const previous = new Set([topBottom, { ...topBottom, accessories: ['a1'] }, { ...topBottom, accessories: ['a2'] }].map(rules.outfitSignature));
  const last = rules.ruleBasedOutfit(candidates, previous);
  assert.deepEqual(plain(last.accessories), ['a1', 'a2']);
  previous.add(rules.outfitSignature(last));
  assert.equal(rules.ruleBasedOutfit(candidates, previous), null);
});

test('generation reads only the authenticated user closet and history', async () => {
  const { ctx, tables } = database([...closet, item('other-user', 'Tops', 'Shirts', 'u2')]);
  await show(ctx);
  tables.outfitHistory.push({ userId: 'u2', outfit: { fullBody: 'other' } });
  const data = await historyApi.generationContext._handler(ctx, {});
  assert.equal(data.items.some(i => i.userId !== 'u1'), false);
  assert.deepEqual(plain(data.previousOutfits), [topBottom]);
  await assert.rejects(historyApi.generationContext._handler(database([], null).ctx, {}), /Unauthorized/);
});

test('shown history is idempotent and transactionally rejects repeats, foreign or deleted items', async () => {
  const { ctx, tables } = database([...closet, item('foreign', 'Tops', 'Shirts', 'u2')]);
  const first = await show(ctx);
  assert.equal(await show(ctx), first);
  assert.equal(tables.outfitHistory.length, 1);
  await assert.rejects(show(ctx, topBottom, 'shown-2'), /already shown/);
  await assert.rejects(show(ctx, { top: 'foreign', bottom: 'b1' }, 'shown-3'), /eligible top/);
  await assert.rejects(show(ctx, { top: 'deleted', bottom: 'b1' }, 'shown-4'), /eligible top/);
});

test('each distinct dislike and Try Another creates a user-scoped feedback row; replay is idempotent', async () => {
  const { ctx, tables } = database();
  const historyId = await show(ctx);
  for (const [index, action] of ['dislike', 'try_another', 'try_another'].entries()) {
    const args = { historyId, action, eventId: `click-${index}` };
    const first = await historyApi.logFeedback._handler(ctx, args);
    assert.equal(await historyApi.logFeedback._handler(ctx, args), first);
  }
  assert.equal(tables.outfitFeedback.length, 3);
  assert.ok(tables.outfitFeedback.every(row => row.userId === 'u1' && JSON.stringify(row.itemIds) === JSON.stringify(['t1', 'b1'])));
  const other = database([], 'clerk2'); other.tables.outfitHistory.push(tables.outfitHistory[0]);
  await assert.rejects(historyApi.logFeedback._handler(other.ctx, { historyId, action: 'dislike', eventId: 'foreign' }), /not found/);
});

test('saving a full-body outfit also logs save feedback and replays without duplicates', async () => {
  const { ctx, tables } = database([item('dress', 'Full Body', 'Dresses')]);
  const historyId = await show(ctx, { fullBody: 'dress' });
  const args = { historyId, eventId: 'save-1' };
  const id = await outfitsApi.saveOutfit._handler(ctx, args);
  assert.equal(await outfitsApi.saveOutfit._handler(ctx, args), id);
  assert.equal(tables.outfits.length, 1);
  assert.equal(tables.outfits[0].fullBody, 'dress');
  assert.equal(tables.outfitFeedback[0].action, 'save');
  assert.equal(tables.outfitFeedback[0].savedOutfitId, id);
});

test('saving rechecks current ownership/existence before writing any outfit or feedback', async () => {
  const { ctx, tables } = database();
  const historyId = await show(ctx);
  tables.items = tables.items.filter(i => i._id !== 'b1');
  await assert.rejects(outfitsApi.saveOutfit._handler(ctx, { historyId, eventId: 'save-deleted' }), /eligible bottom/);
  assert.equal(tables.outfits.length, 0);
  assert.equal(tables.outfitFeedback.length, 0);
});

test('persisted shown history changes the next generation across requests', async () => {
  const { ctx, tables } = database();
  class RepeatingModel { chat = { completions: { create: async () => response(topBottom) } }; }
  const action = load('convex/generateOutfits.ts', RepeatingModel).analyzeOutfit;
  const actionContext = { runQuery: () => historyApi.generationContext._handler(ctx, {}) };
  const first = await action._handler(actionContext, { preferredItemsId: [] });
  await historyApi.recordShown._handler(ctx, { ...first, eventId: 'display-first' });
  const second = await action._handler(actionContext, { preferredItemsId: [] });
  await historyApi.recordShown._handler(ctx, { ...second, eventId: 'display-second' });
  assert.notEqual(rules.outfitSignature(first.outfit), rules.outfitSignature(second.outfit));
  assert.equal(tables.outfitHistory.length, 2);
  assert.equal(first.source, 'ai');
  assert.equal(second.source, 'rules');
});

test('the rendering query returns full-body and all accessories, but no foreign user items', async () => {
  const api = load('convex/items.ts');
  const { ctx } = database([item('dress', 'Full Body', 'Dresses'), item('a1', 'Accessories', 'Hats'), item('a2', 'Accessories', 'Watches'), item('foreign', 'Shoes', 'Sneakers', 'u2')]);
  const rendered = await api.getOutfitItemsFromAi._handler(ctx, { fullBody: 'dress', accessories: ['a1', 'a2'], shoes: 'foreign' });
  assert.equal(rendered.fullBody._id, 'dress');
  assert.deepEqual(plain(rendered.accessories.map(i => i._id)), ['a1', 'a2']);
  assert.equal(rendered.shoes, null);
});

test('a different user cannot save someone else’s shown outfit', async () => {
  const owner = database();
  const historyId = await show(owner.ctx);
  const other = database([], 'clerk2');
  other.tables.outfitHistory.push(owner.tables.outfitHistory[0]);
  await assert.rejects(outfitsApi.saveOutfit._handler(other.ctx, { historyId, eventId: 'save-other' }), /not found/);
  assert.equal(other.tables.outfitFeedback.length, 0);
  assert.equal(other.tables.outfits.length, 0);
});

test('legacy weather on history does not block saving after weather removal', async () => {
  const { ctx, tables } = database();
  const historyId = await show(ctx);
  assert.equal(Object.hasOwn(tables.outfitHistory[0], 'weather'), false);
  tables.outfitHistory[0].weather = 'cold';
  const savedId = await outfitsApi.saveOutfit._handler(ctx, { historyId, eventId: 'legacy-save' });
  assert.ok(savedId);
  assert.equal(tables.outfits.length, 1);
});
