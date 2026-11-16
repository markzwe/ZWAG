// Backport Device Hub discovery for the Expo CLI bundled with SDK 53.
const { execFileSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

function getDeviceHub() {
  if (process.platform !== 'darwin') return null;
  const selected = process.env.DEVELOPER_DIR || execFileSync(
    'xcode-select', ['-p'], { encoding: 'utf8' }
  ).trim();
  const developerDir = selected.endsWith('.app')
    ? path.join(selected, 'Contents/Developer') : selected;
  if (existsSync(path.join(developerDir, 'Applications/Simulator.app'))) return null;
  const app = path.resolve(developerDir, '../Applications/DeviceHub.app');
  if (!existsSync(app)) return null;
  const bundleId = execFileSync('/usr/libexec/PlistBuddy', [
    '-c', 'Print :CFBundleIdentifier', path.join(app, 'Contents/Info.plist'),
  ], { encoding: 'utf8' }).trim();
  if (bundleId !== 'com.apple.dt.Devices') {
    throw new Error(`Unexpected Device Hub bundle identifier: ${bundleId}`);
  }
  return app;
}

module.exports = { getDeviceHub };
