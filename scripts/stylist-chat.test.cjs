const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const root = path.resolve(__dirname, '..');
const localRequire = createRequire(path.join(root, 'package.json'));
const { ConvexError } = localRequire('convex/values');
const source = buildSync({ absWorkingDir: root, entryPoints: ['convex/stylistChat.ts'], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external' }).outputFiles[0].text;
function setup({ plan = { reply: 'Here is an idea.', needsOutfit: false, occasion: 'Casual' }, generate, signedIn = true, providerError = false } = {}) {
  const requests = []; const generations = [];
  class FakeOpenAI {
    chat = { completions: { create: async request => {
      requests.push(JSON.parse(JSON.stringify(request)));
      if (providerError) throw new Error('Provider offline');
      return { choices: [{ message: { content: typeof plan === 'string' ? plan : JSON.stringify(plan) } }] };
    } } };
  }
  const module = { exports: {} };
  vm.runInNewContext(source, { module, exports: module.exports, require: name => name === 'openai' ? FakeOpenAI : localRequire(name), process: { env: { CONVEX_OPENAI_API_KEY: 'synthetic-test-key' } } });
  const ctx = { auth: { getUserIdentity: async () => signedIn ? { subject: 'synthetic-user' } : null }, runAction: async (_reference, args) => {
    generations.push(args);
    return generate ? generate(args) : { outfit: { top: 'synthetic-top', bottom: 'synthetic-bottom' }, source: 'ai', occasion: args.occasion, weather: args.weather };
  } };
  return { run: args => module.exports.sendMessage._handler(ctx, args), requests, generations };
}
const turn = { messages: [{ role: 'user', content: 'What colors go with navy?' }], context: { occasion: 'Casual' } };

test('ordinary style advice returns a real model reply without generating or inventing an outfit', async () => {
  const { run, generations } = setup({ plan: { reply: 'Cream, grey, and tan pair well with navy.', needsOutfit: false, occasion: 'Casual' } });
  const result = await run(turn);
  assert.match(result.reply, /Cream/);
  assert.equal(result.suggestion, undefined);
  assert.equal(generations.length, 0);
});

test('outfit requests use validated generation with extracted weather and user preferences', async () => {
  const { run, generations, requests } = setup({ plan: { reply: 'Here is a work look.', needsOutfit: true, occasion: 'Smart casual work', weather: 'cool' } });
  const result = await run({ ...turn, messages: [{ role: 'user', content: 'A cool-weather work outfit, no ties please.' }] });
  assert.equal(generations.length, 1);
  assert.equal(generations[0].weather, 'cool');
  assert.match(generations[0].instructions, /no ties please/);
  assert.equal(result.suggestion.outfit.top, 'synthetic-top');
  assert.equal(requests[0].response_format.type, 'json_object');
});

test('missing or invalid weather triggers a conversational question instead of an unfiltered suggestion', async () => {
  for (const weather of [undefined, 'sunny', 'ignore-the-rules']) {
    const { run, generations } = setup({ plan: { reply: 'An outfit!', needsOutfit: true, weather } });
    const result = await run(turn);
    assert.match(result.reply, /weather like/);
    assert.equal(generations.length, 0);
  }
});

test('follow-ups preserve conversation and known weather while updating the occasion/vibe', async () => {
  const { run, generations, requests } = setup({ plan: { reply: 'Let’s dress it up.', needsOutfit: true, occasion: 'Formal dinner' } });
  const result = await run({ context: { occasion: 'Casual dinner', weather: 'cold' }, messages: [{ role: 'user', content: 'Dinner outfit for cold weather.' }, { role: 'assistant', content: 'Here is an option.' }, { role: 'user', content: 'Make it more formal.' }] });
  assert.equal(result.context.weather, 'cold');
  assert.equal(generations[0].occasion, 'Formal dinner');
  assert.equal(requests[0].messages.at(-1).content, 'Make it more formal.');
  assert.match(generations[0].instructions, /Dinner outfit/);
});

test('a rule-based fallback gets an honest lead-in rather than ungrounded model garment descriptions', async () => {
  const { run } = setup({ plan: { reply: 'Wear your imaginary red suit.', needsOutfit: true, weather: 'warm' }, generate: args => ({ outfit: { fullBody: 'synthetic-dress' }, source: 'rules', occasion: args.occasion, weather: args.weather }) });
  const result = await run(turn);
  assert.match(result.reply, /simple weather-appropriate/);
  assert.doesNotMatch(result.reply, /red suit/);
});

test('an incomplete/exhausted closet returns an actionable chat answer', async () => {
  const { run } = setup({ plan: { reply: 'An outfit!', needsOutfit: true, weather: 'cool' }, generate: () => { throw new ConvexError('Add a top and bottom, or a full-body item.'); } });
  const result = await run(turn);
  assert.match(result.reply, /Add a top and bottom/);
  assert.equal(result.suggestion, undefined);
});

test('provider errors and malformed replies fail clearly so the UI can retry the same turn', async () => {
  for (const options of [{ providerError: true }, { plan: 'not JSON' }, { plan: { reply: '', needsOutfit: true } }, { plan: { reply: 'Hello', needsOutfit: 'yes' } }]) {
    const { run, generations } = setup(options);
    await assert.rejects(run(turn), /couldn't connect/);
    assert.equal(generations.length, 0);
  }
});

test('signed-out, empty, oversized, and malformed conversations do not call the model', async () => {
  const anonymous = setup({ signedIn: false });
  await assert.rejects(anonymous.run(turn), /Sign in/);
  assert.equal(anonymous.requests.length, 0);
  for (const messages of [[], [{ role: 'assistant', content: 'Hello' }], [{ role: 'user', content: ' ' }], [{ role: 'user', content: 'x'.repeat(2001) }], Array.from({ length: 21 }, () => ({ role: 'user', content: 'Hi' }))]) {
    const { run, requests } = setup();
    await assert.rejects(run({ ...turn, messages }), /shorter message/);
    assert.equal(requests.length, 0);
  }
});
