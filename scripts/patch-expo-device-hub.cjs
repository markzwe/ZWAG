// Reapply the SDK 53 compatibility backport after npm install / npm ci.
const { readFileSync, writeFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');

const expoRequire = createRequire(require.resolve('expo/package.json'));
const cliRoot = path.dirname(expoRequire.resolve('@expo/cli/package.json'));
const { version } = require(path.join(cliRoot, 'package.json'));

if (version !== '0.24.20') {
  console.log(`Skipping Expo 0.24.20 Device Hub backport for CLI ${version}.`);
  process.exit(0);
}

const marker = '// ZWAG: Device Hub compatibility';
const patches = [
  {
    file: 'build/src/run/ios/options/resolveDevice.js',
    replacements: [
      ['async function resolveDeviceAsync(device, buildProps) {',
        `async function resolveDeviceAsync(device, buildProps) {\n    ${marker}\n    if (typeof device === 'string') {\n        const match = (await _simctl.getDevicesAsync()).find((simulator) =>\n            simulator.isAvailable && (simulator.udid.toLowerCase() === device.toLowerCase() || simulator.name.toLowerCase() === device.toLowerCase()));\n        if (match) {\n            await _AppleDeviceManager.AppleDeviceManager.assertSystemRequirementsAsync();\n            return ensureBootedAsync(match);\n        }\n    }`],
    ],
  },
  {
    file: 'build/src/start/doctor/apple/SimulatorAppPrerequisite.js',
    replacements: [
      ['async function getSimulatorAppIdAsync() {',
        `async function getSimulatorAppIdAsync() {\n    ${marker}\n    if (require('../../platforms/ios/deviceHubCompatibility.cjs').getDeviceHub()) return 'com.apple.dt.Devices';`],
      ["result !== 'com.apple.CoreSimulator.SimulatorTrampoline'", "result !== 'com.apple.CoreSimulator.SimulatorTrampoline' && result !== 'com.apple.dt.Devices'"],
    ],
  },
  {
    file: 'build/src/start/platforms/ios/AppleDeviceManager.js',
    replacements: [
      ['async activateWindowAsync() {',
        `async activateWindowAsync() {\n        ${marker}\n        const deviceHub = require('./deviceHubCompatibility.cjs').getDeviceHub();\n        if (deviceHub) {\n            require('node:child_process').execFileSync('open', [deviceHub], { stdio: 'inherit' });\n            return;\n        }`],
    ],
  },
];

// Validate every replacement before changing any installed files.
const updates = patches.map(({ file, replacements }) => {
  const target = path.join(cliRoot, file);
  let source = readFileSync(target, 'utf8');
  if (source.includes(marker)) return null;
  for (const [before, after] of replacements) {
    if (source.split(before).length !== 2) {
      throw new Error(`Expo compatibility patch no longer matches ${file}; review the backport.`);
    }
    source = source.replace(before, after);
  }
  return { target, source };
});

writeFileSync(
  path.join(cliRoot, 'build/src/start/platforms/ios/deviceHubCompatibility.cjs'),
  readFileSync(path.join(__dirname, 'expo-device-hub.cjs'))
);
for (const update of updates) {
  if (update) writeFileSync(update.target, update.source);
}
console.log('Expo Device Hub compatibility applied; use npx expo run:ios.');
