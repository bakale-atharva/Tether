import assert from 'node:assert/strict';
import { test } from 'node:test';
import { agentEntitlement, readAuthoritativeSubscription, billingEventUser, shouldApplySnapshot } from '../convex/lib/billing.ts';

const now = 1_800_000_000_000;
const item = (patch = {}) => ({ status: 'active', period_start: now - 1000, period_end: now + 1000, is_free_trial: false, plan_id: 'plan_pro', plan: { id: 'plan_pro', slug: 'pro', features: [{ slug: 'tether_agent' }] }, ...patch });
const subscription = (items = [item()], status = 'active') => ({ id: 'sub_1', status, updated_at: now - 1000, subscription_items: items });

test('purchase grants Pro only within the paid period with the feature', () => {
  assert.equal(agentEntitlement(subscription(), now).allowed, true);
  for (const patch of [{period_end: now}, {period_end: null}, {period_start: now + 1}, {is_free_trial: true}, {plan: {slug: 'pro', features: []}}, {plan: {slug:'free_user', features:[{slug:'tether_agent'}]}}]) {
    assert.equal(agentEntitlement(subscription([item(patch)]), now).allowed, false);
  }
});
test('cancellation preserves access until expiry; invalid statuses deny', () => {
  assert.equal(agentEntitlement(subscription([item({status:'canceled'})], 'canceled'), now).allowed, true);
  assert.equal(agentEntitlement(subscription([item({status:'canceled', period_end:now})]), now).allowed, false);
  for (const status of ['ended','expired','incomplete','past_due','abandoned','upcoming','unknown']) {
    assert.equal(agentEntitlement(subscription([item({status})]), now).allowed, false);
    assert.equal(agentEntitlement(subscription([item()], status), now).allowed, false);
  }
});
test('free and malformed responses never grant', () => {
  for (const input of [null, {}, {status:'active'}, subscription([]), {pro:true}, {public_metadata:{pro:true}}, subscription([{}])]) {
    assert.equal(agentEntitlement(input, now).allowed, false);
  }
});
test('authoritative lookup binds the URL to the verified user and ignores client flags', async () => {
  let calls = 0;
  const result = await readAuthoritativeSubscription('user_123', 'sk_test_fake', async (url, options) => {
    calls++;
    if(url.includes('/billing/plans')) return Response.json({data:[{id:'plan_pro',slug:'pro',for_payer_type:'user',features:[{slug:'tether_agent'}]}],total_count:1});
    assert.equal(url, 'https://api.clerk.com/v1/users/user_123/billing/subscription');
    assert.equal(options.headers.Authorization, 'Bearer sk_test_fake');
    return Response.json(subscription());
  }, now);
  assert.equal(result.allowed, true);
  assert.equal(calls, 2);
});
test('missing secret, HTTP failures, invalid JSON and provider outages fail closed', async () => {
  for (const fetcher of [async()=>{throw Error('offline')}, async()=>new Response('',{status:500}), async()=>new Response('broken'), async()=>Response.json({pro:true})]) {
    assert.equal((await readAuthoritativeSubscription('user_123','sk_test_fake',fetcher,now)).allowed,false);
  }
  assert.equal((await readAuthoritativeSubscription('user_123',undefined,()=>{throw Error('must not call')},now)).allowed,false);
});
test('webhooks only sync individual billing payers', () => {
  assert.equal(billingEventUser({type:'subscriptionItem.canceled',data:{payer:{user_id:'user_1'}}}), 'user_1');
  for(const event of [{type:'user.updated',data:{id:'user_1'}},{type:'subscription.active',data:{payer:{organization_id:'org_1',user_id:'user_1'}}},{type:'subscription.active',data:{payer:{}}}]) assert.equal(billingEventUser(event),null);
});
test('replayed and out-of-order snapshots cannot replace newer state', () => {
  assert.equal(shouldApplySnapshot(200,100), false);
  assert.equal(shouldApplySnapshot(200,200), false);
  assert.equal(shouldApplySnapshot(200,201), true);
  assert.equal(shouldApplySnapshot(null,100), true);
});

test('authoritative lookup hydrates omitted subscription features from the matching user plan', async () => {
  let calls = 0;
  const result = await readAuthoritativeSubscription('user_123', 'sk_test_fake', async (url) => {
    calls++;
    if(url.includes('/billing/plans')) return Response.json({data:[{id:'plan_pro',slug:'pro',for_payer_type:'user',features:[{slug:'tether_agent'}]}],total_count:1});
    return Response.json(subscription([item({plan:{id:'plan_pro',slug:'pro',features:[]}})]));
  }, now);
  assert.equal(result.allowed,true);
  assert.equal(calls,2);
});
test('a missing feature, mismatched plan id or catalog failure cannot grant Pro', async () => {
  for (const catalog of [null, {data:[{id:'other',slug:'pro',for_payer_type:'user',features:[{slug:'tether_agent'}]}],total_count:1}, {data:[{id:'plan_pro',slug:'pro',for_payer_type:'user',features:[]}],total_count:1}]) {
    const result=await readAuthoritativeSubscription('user_123','sk_test_fake',async url=>url.includes('/billing/plans') ? (catalog ? Response.json(catalog) : new Response('',{status:503})) : Response.json(subscription()),now);
    assert.equal(result.allowed,false);
  }
});

test('active canceled-at items show nonrenewal while preserving access only through the paid period', () => {
  const paid = subscription([item({ status: 'active', canceled_at: now - 1 })]);
  const result = agentEntitlement(paid, now);
  assert.equal(result.canceled, true);
  assert.equal(result.allowed, true);
  assert.equal(result.accessUntil, now + 1000);
  assert.equal(agentEntitlement(paid, now + 1000).allowed, false);
  for (const canceled_at of [null, undefined, 'invalid', now + 1]) {
    assert.equal(agentEntitlement(subscription([item({ canceled_at })]), now).canceled, false);
  }
});
