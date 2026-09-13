import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const dir = mkdtempSync(join(tmpdir(), 'tribunal-workflow-'));
const file = join(dir, 'sprint.cjs');
const bundle = await build({ stdin: { contents: `export * as investigations from './convex/investigations'; export * as entitlements from './convex/entitlements'; export { assertExecution } from './convex/lib/execution'; export { sessionUserId, requireHost } from './convex/lib/session'; export { readTestStoreEntitlement, verifiedAccess } from './convex/lib/subscription';`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, platform: 'node', format: 'cjs', write: false });
writeFileSync(file, bundle.outputFiles[0].text);
after(() => { unlinkSync(file); rmdirSync(dir); });
const { investigations: inv, entitlements: ent, assertExecution, sessionUserId, requireHost, readTestStoreEntitlement, verifiedAccess } = createRequire(import.meta.url)(file);
const now = Date.now();
const token = 'a'.repeat(64);
function subscription(change = {}, entChange = {}) {
 return { subscriber: { entitlements: { pro_auditor_access: { product_identifier: 'pro_auditor_monthly', expires_date: new Date(now + 60000).toISOString(), ...entChange } }, subscriptions: { pro_auditor_monthly: { store: 'test_store', is_sandbox: true, purchase_date: new Date(now - 1000).toISOString(), expires_date: new Date(now + 60000).toISOString(), ...change } } } };
}
test('RevenueCat: solo producto y entitlement correctos, sandbox y vigente activan Pro', () => {
 assert.equal(readTestStoreEntitlement(subscription(), now).hasProAccess, true);
 for (const change of [{ store: 'stripe' }, { is_sandbox: false }, { refunded_at: new Date().toISOString() }, { expires_date: new Date(now - 1).toISOString() }, { purchase_date: 'invalid' }]) assert.equal(readTestStoreEntitlement(subscription(change), now).hasProAccess, false);
 assert.equal(readTestStoreEntitlement(subscription({}, { product_identifier: 'monthly' }), now).hasProAccess, false);
 assert.equal(readTestStoreEntitlement({ subscriber: {} }, now).hasProAccess, false);
 assert.throws(() => readTestStoreEntitlement({}), /inválida/);
});
test('RevenueCat: registros heredados, expirados o con verificación vieja no conceden acceso', () => {
 const record = { ...readTestStoreEntitlement(subscription(), now), verifiedBy: 'revenuecat', updatedAt: now };
 assert.equal(verifiedAccess(record, now), true);
 for (const change of [{ verifiedBy: undefined }, { hasProAccess: false }, { expirationDate: now }, { updatedAt: now - 300001 }, { environment: 'PRODUCTION' }]) assert.equal(verifiedAccess({ ...record, ...change }, now), false);
});
test('host: conocer el identificador público no autoriza controlar la sala', async () => {
 const hostUserId = await sessionUserId(token);
 const ctx = { db: { get: async () => ({ hostUserId }) } };
 await requireHost(ctx, 'room', token);
 await assert.rejects(requireHost(ctx, 'room', 'b'.repeat(64)));
 await assert.rejects(requireHost(ctx, 'room', hostUserId));
});
function state() {
 const investigation = { _id: 'inv', roomId: 'room', claimId: 'claim', currentStep: 'linkup_deep_search', executionToken: 'generation-1', workflowStatus: 'running', completedCheckpoints: ['initial'], retryCount: 0, failureRequested: true };
 const room = { activeClaimId: 'claim', status: 'auditing' };
 return { investigation, db: { get: async id => id === 'inv' ? investigation : room, patch: async (_, patch) => Object.assign(investigation, patch) } };
}
const stage = { investigationId: 'inv', executionToken: 'generation-1', lease: 'lease-1', stage: 'contrast' };
test('Render: falla una vez, conserva checkpoint y reanuda sin repetir etapa inicial', async () => {
 const ctx = state();
 assert.equal((await inv.claimStage._handler(ctx, stage)).fail, true);
 assert.equal(ctx.investigation.retryCount, 1);
 assert.deepEqual(ctx.investigation.completedCheckpoints, ['initial']);
 assert.equal((await inv.claimStage._handler(ctx, { ...stage, stage: 'initial' })).skip, true);
 assert.equal((await inv.claimStage._handler(ctx, stage)).fail, false);
 await assert.rejects(inv.claimStage._handler(ctx, { ...stage, lease: 'competitor' }), /ejecución/);
 await inv.releaseStage._handler(ctx, { ...stage, success: true });
 assert.deepEqual(ctx.investigation.completedCheckpoints, ['initial', 'contrast']);
 assert.equal((await inv.claimStage._handler(ctx, stage)).skip, true);
});
test('Render: callbacks caducados, de otro run o de una etapa fuera de orden no escriben', async () => {
 const ctx = state(); ctx.investigation.failureRequested = false;
 await assert.rejects(inv.claimStage._handler(ctx, { ...stage, stage: 'synthesis' }), /anterior/);
 await inv.claimStage._handler(ctx, stage);
 await assertExecution(ctx, stage);
 await assert.rejects(assertExecution(ctx, { ...stage, executionToken: 'old' }), /vencida/);
 await assert.rejects(assertExecution(ctx, { ...stage, lease: 'old' }), /vencida/);
 ctx.investigation.stageLeaseUntil = Date.now() - 1;
 await assert.rejects(assertExecution(ctx, stage), /vencida/);
});
test('Render: las consultas públicas nunca exponen credenciales de ejecución', async () => {
 const result = await inv.getByClaim._handler({ db: { query: () => ({ withIndex: () => ({ order: () => ({ first: async () => ({ _id: 'inv', executionToken: 'secret', stageLease: 'private', stageLeaseUntil: 1 }) }) }) }) } }, { claimId: 'claim' });
 assert.deepEqual(result, { _id: 'inv' });
});
test('RevenueCat: el dossier enriquece el peritaje con matriz de riesgo y caso oficial', async () => {
 const userId = await sessionUserId(token);
 const entitlement = { userId, hasProAccess: true, expirationDate: now + 60000, verifiedBy: 'revenuecat', updatedAt: now, environment: 'SANDBOX', entitlementId: 'pro_auditor_access', productId: 'pro_auditor_monthly' };
  const investigation = { _id: 'inv', roomId: 'room', claimId: 'claim', currentStep: 'completed', completionReason: 'assessed', verdict: 'CERTIFIED_SMOKE', hypeScore: 85, summary: 'Marketing desmedido sin sustento empírico.', edgeCaseWarning: 'Límites forenses' };
  const claim = { _id: 'claim', roomId: 'room', content: 'IA cura todo en 2 días' };
  const room = { _id: 'room', code: 'HYPE-742', title: 'Caso Startup', hostUserId: userId };
 const evidence = [
  { source: 'linkup', title: 'Paper 1', url: 'https://arxiv.org/1', snippet: 'No hay pruebas', assessment: 'contradicts', uncertaintyLevel: 'LOW', supportingQuote: 'No hay pruebas empíricas', assessmentReason: 'Contradicción directa', step: 'initial_search' }
 ];
 const ctx = {
  db: {
   query: (tbl) => ({
    withIndex: (_name, fn) => ({
     first: async () => tbl === 'userEntitlements' ? entitlement : null,
     collect: async () => tbl === 'evidence' ? evidence : []
    })
   }),
   get: async (id) => id === 'inv' ? investigation : id === 'claim' ? claim : id === 'room' ? room : null
  }
 };
  const res = await ent.dossier._handler(ctx, { token, sessionToken: token, investigationId: 'inv' });
 assert.equal(res.caseCode, 'HYPE-742');
 assert.equal(res.verdict, 'CERTIFIED_SMOKE');
 assert.equal(res.hypeScore, 85);
 assert.ok(res.riskMatrix);
 assert.match(res.riskMatrix.reputationalRisk, /Crítico/);
 assert.match(res.riskMatrix.technicalRisk, /Alto/);
 assert.match(res.riskMatrix.recommendation, /Rechazar/);
 assert.equal(res.evidence.length, 1);
 assert.equal(res.evidence[0].supportingQuote, 'No hay pruebas empíricas');
});

