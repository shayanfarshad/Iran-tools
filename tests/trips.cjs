const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, mocks = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', source)(mod, mod.exports, name => {
    if (name in mocks) return mocks[name];
    return load(path.resolve(path.dirname(file), name + '.ts'), mocks);
  });
  return mod.exports;
}
const { allocateExpense, summarizeTrip, validateTrips } = load('src/features/trips/calculator.ts');
const weights = [1,1,1].map((weight, index) => ({ memberId: String(index), weight }));
assert.deepEqual(allocateExpense(100, weights).map(item => item.amount), [34,33,33]);
assert.deepEqual(allocateExpense(101, [{ memberId:'a',weight:1 },{ memberId:'b',weight:2 },{ memberId:'c',weight:0 }]).map(item => item.amount), [34,67,0]);
assert.throws(() => allocateExpense(1, [{ memberId:'a',weight:0 }]));
assert.throws(() => allocateExpense(1.5, weights));
assert.throws(() => allocateExpense(1, [{ memberId:'a',weight:1.5 }]));
assert.throws(() => allocateExpense(1, [{ memberId:'a',weight:1 },{ memberId:'a',weight:2 }]));
assert.equal(allocateExpense(Number.MAX_SAFE_INTEGER, weights).reduce((sum,item) => sum + item.amount,0), Number.MAX_SAFE_INTEGER);
for (let amount = 1; amount < 250; amount++) {
  const shares = allocateExpense(amount, weights);
  assert.equal(shares.reduce((sum,item) => sum+item.amount,0), amount);
  assert.ok(Math.max(...shares.map(item=>item.amount))-Math.min(...shares.map(item=>item.amount))<=1);
}
const trip = { id:'trip',title:'Test',currency:'toman',members:weights.map((item,index)=>({id:item.memberId,name:`Person ${index}`})),expenses:[
  { id:'expense',title:'Hotel',amount:300,payerId:'0',shares:allocateExpense(300,weights) },
  { id:'expense2',title:'Food',amount:60,payerId:'1',shares:allocateExpense(60,weights) },
] };
validateTrips([trip]);
const summary = summarizeTrip(trip);
assert.equal(summary.total,360);
assert.deepEqual([...summary.balances.values()],[180,-60,-120]);
const settled = new Map(summary.balances);
for (const transfer of summary.settlements) {
  assert.ok(transfer.amount>0);
  settled.set(transfer.from,settled.get(transfer.from)+transfer.amount);
  settled.set(transfer.to,settled.get(transfer.to)-transfer.amount);
}
assert.ok([...settled.values()].every(value=>value===0));
const invalid = JSON.parse(JSON.stringify(trip));
invalid.expenses[0].shares[0].amount++;
assert.throws(()=>validateTrips([invalid]));
assert.throws(()=>validateTrips([trip,trip]));
assert.throws(()=>validateTrips([{...trip,members:[trip.members[0],trip.members[0]]}]));

let stored = null;
let failed = false;
const storage = { getItem:async()=>stored,setItem:async(_key,value)=>{if(failed)throw new Error('storage failed'); stored=value;} };
let cursor=0;
let effect;
const slots=[];
const react={
  useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>{slots[i]=value;}];},
  useRef(initial){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];},
  useEffect(callback){if(!effect)effect=callback;},
};
const { useTrips }=load('src/features/trips/use-trips.ts',{react,'@react-native-async-storage/async-storage':{__esModule:true,default:storage}});
const render=()=>{cursor=0;return useTrips();};
(async()=>{
  render();effect();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(await render().createTrip('Trip','toman',['Ali','Sara']),true);
  let saved=render().trips[0];
  const shares=allocateExpense(100,saved.members.map(member=>({memberId:member.id,weight:1})));
  assert.equal(await render().saveExpense(saved.id,{title:'Hotel',amount:100,payerId:saved.members[0].id,shares}),true);
  saved=render().trips[0];
  const expenseId=saved.expenses[0].id;
  assert.equal(await render().saveExpense(saved.id,{...saved.expenses[0],title:'Updated'},expenseId),true);
  assert.equal(render().trips[0].expenses.length,1);
  assert.equal(render().trips[0].expenses[0].title,'Updated');
  failed=true;
  assert.equal(await render().deleteExpense(saved.id,expenseId),false);
  assert.equal(render().trips[0].expenses.length,1);
  assert.equal(JSON.parse(stored).trips[0].expenses.length,1);
  failed=false;
  assert.equal(await render().deleteExpense(saved.id,expenseId),true);
  assert.equal(render().trips[0].expenses.length,0);
  const beforeCorruption=stored;
  stored='invalid-json';
  assert.equal(await render().createTrip('Other','rial',['X','Y']),false);
  assert.equal(stored,'invalid-json');
  stored=beforeCorruption;
  assert.equal(await render().deleteTrip(saved.id),true);
  assert.deepEqual(JSON.parse(stored).trips,[]);
  console.log('Trip allocations, settlements, validation and storage lifecycle checks passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
