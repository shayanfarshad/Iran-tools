const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('src/features/billing/store.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const config = { store: 'bazaar', publicKey: 'test-public-key', productId: 'premium_lifetime' };
const constants = { appOwnership: 'standalone', expoConfig: { extra: { billing: config }, android: { package: 'com.shayanfarshad.irantools' } } };
let calls = [];
let purchases = [];
const sdk = { connect: async key => { calls.push(['connect', key]); }, disconnect: async () => { calls.push(['disconnect']); }, purchaseProduct: async sku => { calls.push(['purchase', sku]); }, getPurchasedProducts: async () => purchases, getInAppSkuDetails: async () => [{ sku: 'premium_lifetime', price: '100' }], queryPurchaseProduct: async () => ({ allPurchases: purchases, allProducts: [{ sku: 'premium_lifetime', price: '100' }] }) };
const moduleObject = { exports: {} };
new Function('module', 'exports', 'require', source)(moduleObject, moduleObject.exports, name => name === 'expo-constants' ? { __esModule: true, default: constants } : name === 'react-native' ? { Platform: { OS: 'android' } } : { __esModule: true, default: sdk });
const { runBilling, getBillingConfig } = moduleObject.exports;
(async () => {
  assert.equal((await runBilling(false)).owned, false);
  for (const store of ['bazaar', 'myket']) {
    config.store = store;
    purchases = [{ productId: 'premium_lifetime', sku: 'premium_lifetime', packageName: 'com.shayanfarshad.irantools', purchaseState: 0, purchaseToken: 'test-token' }];
    assert.equal((await runBilling(true)).owned, true);
    purchases[0].purchaseState = 1;
    assert.equal((await runBilling(false)).owned, false);
    purchases[0].purchaseState = 0;
    purchases[0].packageName = 'other.app';
    assert.equal((await runBilling(false)).owned, false);
    purchases[0].packageName = 'com.shayanfarshad.irantools';
    purchases[0].productId = purchases[0].sku = 'wrong-product';
    assert.equal((await runBilling(false)).owned, false);
  }
  assert.equal(calls.filter(call => call[0] === 'connect').length, calls.filter(call => call[0] === 'disconnect').length);
  config.publicKey = '';
  assert.equal(getBillingConfig(), null);
  await assert.rejects(runBilling(true));
  config.publicKey = 'test-public-key';
  constants.appOwnership = 'expo';
  assert.equal(getBillingConfig(), null);
  console.log('Billing adapter mocked validation passed (not a native store test).');
})().catch(error => { console.error(error); process.exitCode = 1; });
