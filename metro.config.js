const { getDefaultConfig } = require('expo/metro-config');
const fs = require('node:fs');
const path = require('node:path');

const config = getDefaultConfig(__dirname);
const customizeStack = config.symbolicator.customizeStack;
const serverSourceRoot = path.resolve(__dirname, '../convex');

// Convex server traces use ../convex/... relative to their generated bundle.
// Metro resolves those against the app root, so point them at our local sources.
config.symbolicator.customizeStack = async (stack, extraData) => {
  const frames = customizeStack ? await customizeStack(stack, extraData) : stack;
  return frames.map(frame => {
    if (typeof frame.file !== 'string' || frame.file.includes('://')) return frame;
    const resolved = path.resolve(__dirname, frame.file);
    const relative = path.relative(serverSourceRoot, resolved);
    if (!relative || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return frame;
    const localFile = path.join(__dirname, 'convex', relative);
    if (!fs.existsSync(resolved) && fs.existsSync(localFile) && fs.statSync(localFile).isFile()) {
      return { ...frame, file: localFile };
    }
    return frame;
  });
};

module.exports = config;
