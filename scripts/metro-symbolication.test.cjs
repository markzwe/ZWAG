const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const config = require('../metro.config');
const projectRoot = path.resolve(__dirname, '..');

test('Convex backend errors resolve to the actual source without losing stack details', async () => {
  const frame = { file: '../convex/generateOutfits.ts', lineNumber: 140, column: 4, methodName: 'handler' };
  const [result] = await config.symbolicator.customizeStack([frame], {});
  assert.deepEqual(result, { ...frame, file: path.join(projectRoot, 'convex/generateOutfits.ts') });
  assert.match(fs.readFileSync(result.file, 'utf8'), /export const analyzeOutfit/);
  assert.equal(frame.file, '../convex/generateOutfits.ts');
});

test('client frames, URLs, missing backend files, and unrelated paths are preserved', async () => {
  const frames = [
    { file: 'app/index.tsx', lineNumber: 1 },
    { file: path.join(projectRoot, 'convex/generateOutfits.ts'), lineNumber: 1 },
    { file: 'http://localhost:8081/index.bundle', lineNumber: 1 },
    { file: '../convex/not-a-real-function.ts', lineNumber: 1 },
    { file: '../convex/../config/gptPrompt.ts', lineNumber: 1 },
    { file: null, lineNumber: null },
  ];
  assert.deepEqual(await config.symbolicator.customizeStack(frames, {}), frames);
});
