import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const dir = mkdtempSync(join(tmpdir(), 'tribunal-votes-'));
const file = join(dir, 'votes.cjs');
const bundle = await build({ entryPoints: ['convex/votes.ts'], bundle: true, platform: 'node', format: 'cjs', write: false });
writeFileSync(file, bundle.outputFiles[0].text);
after(() => { unlinkSync(file); rmdirSync(dir); });
const { cast, getCounts } = createRequire(import.meta.url)(file);
const args = { roomId: 'room', claimId: 'claim', voterId: 'host', voterName: 'Host', choice: 'LEGIT' };
function database(room) {
  const rows = [];
  return { rows, get: async () => room,
    query: () => {
      const filters = {};
      const index = { eq: (key, value) => { filters[key] = value; return index; } };
      return { withIndex: (_, filter) => { filter(index); const matches = () => rows.filter(row => Object.entries(filters).every(([key, value]) => row[key] === value)); return { first: async () => matches()[0] ?? null, collect: async () => matches() }; } };
    },
    insert: async (_, data) => { const id = String(rows.length); rows.push({ _id: id, ...data }); return id; },
    patch: async (id, data) => Object.assign(rows.find(row => row._id === id), data),
  };
}
for (const status of ['lobby', 'auditing', 'verdict']) test(`rechaza votos durante ${status}`, async () => {
  const db = database({ status, activeClaimId: 'claim' });
  await assert.rejects(cast._handler({ db }, args), /cerrada/);
  assert.equal(db.rows.length, 0);
});
test('rechaza un caso anterior aunque la sala vuelva a votar', async () => {
  const db = database({ status: 'voting', activeClaimId: 'next-claim' });
  await assert.rejects(cast._handler({ db }, args), /cerrada/);
});
test('host e invitado cambian votos sin duplicados y conservan 0% real', async () => {
  const db = database({ status: 'voting', activeClaimId: 'claim' });
  await cast._handler({ db }, args);
  const guest = { ...args, voterId: 'guest', voterName: 'Jurado', choice: 'SMOKE' };
  await cast._handler({ db }, guest);
  assert.equal((await getCounts._handler({ db }, { claimId: 'claim' })).smokePercentage, 50);
  await cast._handler({ db }, { ...guest, choice: 'LEGIT' });
  const counts = await getCounts._handler({ db }, { claimId: 'claim' });
  assert.equal(counts.total, 2);
  assert.equal(counts.smokePercentage, 0);
  assert.equal(counts.legitPercentage, 100);
});
