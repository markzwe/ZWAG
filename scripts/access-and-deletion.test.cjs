const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const { getFunctionName } = require('convex/server');

const fakeClerkRequests = [];
const files = Object.fromEntries(['users', 'accountDeletion'].map(name => {
  const js = buildSync({
    absWorkingDir: path.resolve(__dirname, '..'), entryPoints: [`convex/${name}.ts`],
    bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  }).outputFiles[0].text;
  const module = { exports: {} };
  vm.runInNewContext(js, {
    module, require, process: { env: { CLERK_SECRET_KEY: 'synthetic-clerk-key' } },
    AbortSignal, fetch: async (url, options) => {
      fakeClerkRequests.push({ url, method: options.method });
      return { ok: true };
    },
  });
  return [name, module.exports];
}));

function fixture(subject = 'clerk-a') {
  const users = [{ _id: 'u1', clerkId: 'clerk-a' }, { _id: 'u2', clerkId: 'clerk-b' }];
  const invite = { _id: 'invite1', code: 'OLDINVITE', maxUses: 1 };
  const tables = {
    users, inviteCodes: [invite], deletedAccounts: [],
    outfitFeedback: [{ _id: 'feedback', userId: 'u1' }, { _id: 'other-feedback', userId: 'u2' }],
    outfitHistory: [{ _id: 'history', userId: 'u1' }],
    outfits: [{ _id: 'outfit', userId: 'u1' }],
    items: [{ _id: 'item', userId: 'u1', storageId: 'photo' }],
    uploads: [{ _id: 'upload', userId: 'u1', storageId: 'unfinished' }],
  };
  let id = 0;
  const jobs = new Map();
  const storage = new Set(['photo', 'unfinished', 'other-photo']);
  const find = key => Object.values(tables).flat().find(row => row._id === key);
  const ctx = {
    auth: { getUserIdentity: async () => subject ? { subject } : null },
    db: {
      query(table) {
        const predicates = [];
        const read = () => tables[table].filter(row => predicates.every(matches => matches(row)));
        return {
          withIndex(_index, fn) { fn({ eq: (key, value) => predicates.push(row => row[key] === value) }); return this; },
          filter(fn) { predicates.push(fn({ field: key => key, neq: (key, value) => row => row[key] !== value })); return this; },
          async first() { return read()[0] ?? null; },
          async take(count) { return read().slice(0, count); },
          async paginate() { return { page: read(), isDone: true, continueCursor: '' }; },
        };
      },
      async get(key) { return find(key) ?? null; },
      async insert(table, values) { const _id = `id-${++id}`; tables[table].push({ _id, ...values }); return _id; },
      async patch(key, values) { Object.assign(find(key), values); },
      async delete(key) {
        for (const rows of Object.values(tables)) {
          const position = rows.findIndex(row => row._id === key);
          if (position >= 0) rows.splice(position, 1);
        }
      },
      system: { get: async (table, key) => table === '_storage' ? storage.has(key) : jobs.get(key),
        normalizeId: (_table, key) => key },
    },
    storage: { delete: async key => storage.delete(key) },
    scheduler: {
      async runAfter(_delay, _reference, args) {
        const jobId = `job-${++id}`;
        jobs.set(jobId, { state: { kind: 'pending' }, args });
        return jobId;
      },
    },
    runMutation: (reference, args) => {
      const [file, fn] = getFunctionName(reference).split(':');
      return files[file][fn]._handler(ctx, args);
    },
  };
  return { ctx, tables, users, invite, jobs, storage, signIn: next => { subject = next; } };
}

test('a signed-in account can open the app without legacy invite status', async () => {
  const { ctx, signIn } = fixture();
  const status = () => files.users.getAccountStatus._handler(ctx, {});
  assert.equal((await status()).canUseApp, true);
  signIn('new-user');
  assert.equal((await status()).canUseApp, false);
  await files.users.prepareMyProfile._handler(ctx, {});
  assert.equal((await status()).canUseApp, true);
  signIn(null);
  assert.equal(await status(), null);
});

test('account deletion is caller-scoped and removes owned data before deleting Clerk', async () => {
  const { ctx, tables, users, invite, jobs, storage } = fixture();
  invite.redeemedBy = ['clerk-a', 'clerk-b'];
  await files.accountDeletion.deleteAccount._handler(ctx, {});
  await files.accountDeletion.deleteAccount._handler(ctx, {});
  assert.equal(jobs.size, 1);
  assert.ok(users[0].deletingAt);
  assert.equal(users[1].deletingAt, undefined);
  const action = files.accountDeletion.runDeletion;
  for (const job of jobs.values()) {
    job.state.kind = 'inProgress';
    await action._handler(ctx, job.args);
    job.state.kind = 'success';
  }
  assert.equal(users.length, 1);
  assert.deepEqual([...storage], ['other-photo']);
  assert.deepEqual(Array.from(invite.redeemedBy), ['clerk-b']);
  assert.deepEqual(tables.outfitFeedback.map(row => row._id), ['other-feedback']);
  for (const table of ['outfitHistory', 'outfits', 'items', 'uploads']) assert.equal(tables[table].length, 0);
  assert.deepEqual(fakeClerkRequests, [{ url: 'https://api.clerk.com/v1/users/clerk-a', method: 'DELETE' }]);
  await files.users.prepareMyProfile._handler(ctx, {});
  assert.equal(users.length, 1);
});
