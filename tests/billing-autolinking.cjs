const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const configPath = path.resolve('react-native.config.js');
const pkg = require.resolve('expo-modules-autolinking/package.json', { paths: [require.resolve('expo/package.json')] });
const cli = path.join(path.dirname(pkg), 'bin/expo-modules-autolinking.js');
const bazaar = '@cafebazaar/react-native-poolakey';
const myket = 'iab-myket-reactnative';
for (const [store, expected] of [['none', []], ['bazaar', [bazaar]], ['myket', [myket]]]) {
  const raw = execFileSync(process.execPath, [cli, 'react-native-config', '--platform', 'android', '--json'], {
    env: { ...process.env, IRAN_TOOLS_STORE: store }, encoding: 'utf8',
  });
  const config = JSON.parse(raw);
  const linked = [bazaar, myket].filter(name => config.dependencies[name]?.platforms?.android);
  assert.deepEqual(linked, expected, `${store}: wrong billing modules in native autolinking`);
}
assert.throws(() => execFileSync(process.execPath, ['-e', 'require(process.argv[1])', configPath], {
  env: { ...process.env, IRAN_TOOLS_STORE: 'typo' }, stdio: 'pipe',
}));
console.log('Expo autolinking: none, Bazaar and Myket each link only their intended billing SDK; invalid stores rejected.');
