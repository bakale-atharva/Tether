// Direct registered-function checks, without a Vitest or E2E runner.
import './ts-imports.mjs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const requests = await import('../convex/agentRequests.ts');
const chat = await import('../convex/agentChat.ts');
const { reserveAgentCapacity, agentLimits } = await import('../convex/lib/agentQuota.ts');
const { calculateRateLimit } = await import('@convex-dev/rate-limiter');

function fixture(subject = 'alice') {
  const rows = new Map();
  let counter = 0;
  const calls = [], scheduled = [], limits = new Map();
  const add = (table, value) => { const row = { _id: `${table}-${++counter}`, _creationTime: Date.now(), table, ...value }; rows.set(row._id, row); return row; };
  const alice = add('users', { tokenIdentifier: 'test|alice', clerkUserId: 'alice' });
  const bob = add('users', { tokenIdentifier: 'test|bob', clerkUserId: 'bob' });
  const conversation = add('agentConversations', { ownerId: alice._id, threadId: 'thread-a', title: 'Private', updatedAt: Date.now() });
  const request = add('agentRequests', { ownerId: alice._id, kind:'private', conversationId: conversation._id, threadId: 'thread-a', promptMessageId:'prompt-a', promptOrder:0, clientRequestId:'existing-request-00001', status:'queued', attempt:1, expiresAt:Date.now()+180000 });
  conversation.lastRequestId = request._id;
  const lock = add('agentLocks', { ownerId:alice._id, requestId:request._id });
  const ctx = {
    auth: { getUserIdentity: async () => subject ? { tokenIdentifier:`test|${subject}`, subject } : null },
    db: {
      get: async (_table,id) => rows.get(id) ?? null,
      query: table => {
        const conditions=[];
        const q = { eq(k,v) { conditions.push([k,v]); return q; } };
        const results = () => [...rows.values()].filter(r=>r.table===table && conditions.every(([k,v])=>r[k]===v));
        const chain={ withIndex(_index, fn) { fn(q); return chain; }, unique:async()=>results()[0]??null, order:()=>chain, paginate:async()=>({page:results(),isDone:true,continueCursor:''}) };
        return chain;
      },
      insert: async (table,value) => add(table,value)._id,
      patch: async (_table,id,value) => { Object.assign(rows.get(id), value); },
    },
    scheduler: { runAfter: async (delay,ref,args) => { scheduled.push({delay,ref,args}); return 'scheduled'; } },
    runQuery: async () => { throw Error('Unexpected component query'); },
    runMutation: async (ref,args) => {
      calls.push({ref,args});
      if(args.name) {
        const value = calculateRateLimit(limits.get(args.name), args.config, Date.now(), 1);
        if(value.value >= 0) limits.set(args.name, { value:value.value, ts:value.ts });
        return {ok:value.value >= 0, retryAfter:value.retryAfter};
      }
      if(args.messages) return {messages:args.messages.map((m,i)=>({_id:'saved-prompt',order:1,stepOrder:i,message:m.message}))};
      return false; // abortStream with no current stream
    },
  };
  return {ctx,rows,calls,scheduled,alice,bob,conversation,request,lock,limits};
}

test('cross-user history, stream reads, rename, request state and stop reject before component access',async()=>{
  for(const [fn,args] of [
    [chat.messages,{threadId:'thread-a',paginationOpts:{cursor:null,numItems:10}}],
    [chat.rename,{threadId:'thread-a',title:'forged'}],
    [requests.state,{threadId:'thread-a'}],
  ]) { const f=fixture('bob'); await assert.rejects(fn._handler(f.ctx,args), /not found/i); assert.equal(f.calls.length,0); }
  const f=fixture('bob'); await assert.rejects(requests.stop._handler(f.ctx,{requestId:f.request._id}),/not found/i); assert.equal(f.calls.length,0);
  assert.equal(await chat.detail._handler(f.ctx,{threadId:'thread-a'}),null);
  assert.deepEqual((await chat.list._handler(f.ctx,{paginationOpts:{cursor:null,numItems:10}})).page,[]);
});
test('signed-out operations reject and downgrade does not prevent owner history reads',async()=>{
  const f=fixture(null); await assert.rejects(chat.detail._handler(f.ctx,{threadId:'thread-a'}),/sign in/i);
  const owner=fixture(); assert.equal((await chat.detail._handler(owner.ctx,{threadId:'thread-a'})).title,'Private');
});
test('worker claim is once-only and rejects duplicate, stale and expired attempts',async()=>{
  const f=fixture();
  assert.ok(await requests.claim._handler(f.ctx,{requestId:f.request._id,attempt:1}));
  assert.equal(await requests.claim._handler(f.ctx,{requestId:f.request._id,attempt:1}),null);
  assert.equal(await requests.claim._handler(f.ctx,{requestId:f.request._id,attempt:0}),null);
  const expired=fixture(); expired.request.expiresAt=0;
  assert.equal(await requests.claim._handler(expired.ctx,{requestId:expired.request._id,attempt:1}),null);
  assert.equal(expired.request.status,'failed'); assert.equal(expired.lock.requestId,undefined);
});
test('queued stop prevents provider execution; running stop retains lock until worker settles',async()=>{
  const f=fixture(); await requests.stop._handler(f.ctx,{requestId:f.request._id});
  assert.equal(f.request.status,'canceled'); assert.equal(f.lock.requestId,undefined);
  assert.equal(await requests.claim._handler(f.ctx,{requestId:f.request._id,attempt:1}),null);
  const running=fixture(); running.request.status='running';
  await requests.stop._handler(running.ctx,{requestId:running.request._id});
  assert.equal(running.request.status,'stopping'); assert.equal(running.lock.requestId,running.request._id);
  await assert.rejects(reserveAgentCapacity(running.ctx,running.alice._id,true),/current response/i);
  await requests.finish._handler(running.ctx,{requestId:running.request._id,attempt:1});
  assert.equal(running.request.status,'canceled'); assert.equal(running.lock.requestId,undefined);
});
test('stale completion and timeout cannot overwrite a retry or clear another lock',async()=>{
  const f=fixture(); f.request.attempt=2; f.request.status='running';
  await requests.finish._handler(f.ctx,{requestId:f.request._id,attempt:1});
  await requests.expire._handler(f.ctx,{requestId:f.request._id,attempt:1});
  assert.equal(f.request.status,'running'); assert.equal(f.lock.requestId,f.request._id);
  f.lock.requestId='different-request';
  await requests.finish._handler(f.ctx,{requestId:f.request._id,attempt:2,error:{code:'PROVIDER_ERROR',message:'Please retry'}});
  assert.equal(f.request.status,'failed'); assert.equal(f.lock.requestId,'different-request');
});
test('retry reuses original prompt and request and consumes cooldown only',async()=>{
  const f=fixture(); f.request.status='failed'; f.lock.requestId=undefined;
  await requests.restart._handler(f.ctx,{requestId:f.request._id});
  assert.equal(f.request.attempt,2); assert.equal(f.request.promptMessageId,'prompt-a'); assert.equal(f.request.status,'queued');
  assert.equal([...f.rows.values()].filter(r=>r.table==='agentRequests').length,1);
  assert.deepEqual(f.calls.map(c=>c.args.name),['agentCooldown']);
});
test('new submissions reserve quota once; duplicate delivery never creates another prompt',async()=>{
  const f=fixture(); f.lock.requestId=undefined;
  const args={threadId:'thread-a',prompt:'A new question',clientRequestId:'new-request-0000001'};
  const id=await requests.enqueue._handler(f.ctx,args);
  assert.equal(await requests.enqueue._handler(f.ctx,args),id);
  assert.deepEqual(f.calls.filter(c=>c.args.name).map(c=>c.args.name),['agentCooldown','agentDaily']);
  assert.equal(f.calls.filter(c=>c.args.messages).length,1);
  await assert.rejects(requests.enqueue._handler(f.ctx,{...args,clientRequestId:'new-request-0000002'}),/current response/i);
});
test('UTC fixed window permits exactly 50 requests and resets at midnight',()=>{
  const config=agentLimits.limits.agentDaily;
  const now=Date.UTC(2026,9,23,23,59,59); let state;
  for(let i=0;i<50;i++) { const result=calculateRateLimit(state,config,now,1); assert.equal(result.value >= 0,true); state={value:result.value,ts:result.ts}; }
  assert.equal(calculateRateLimit(state,config,now,1).value >= 0,false);
  assert.equal(calculateRateLimit(state,config,now+1000,1).value >= 0,true);
});
test('five-second cooldown has capacity one and no burst',()=>{
  const config=agentLimits.limits.agentCooldown; const now=Date.now();
  const first=calculateRateLimit(undefined,config,now,1); assert.equal(first.value >= 0,true);
  const state={value:first.value,ts:first.ts};
  assert.equal(calculateRateLimit(state,config,now+4999,1).value >= 0,false);
  assert.equal(calculateRateLimit(state,config,now+5000,1).value >= 0,true);
});

test('generation worker fails closed on revoked Pro and never reaches the model',async()=>{
  const {run} = await import('../convex/agentGeneration.ts');
  const {ConvexError} = await import('convex/values');
  const calls=[];
  const ctx={
    runMutation: async (_ref,args) => {calls.push(args); return calls.length===1 ? {threadId:'private-thread',promptMessageId:'saved',clerkUserId:'verified-owner'} : null;},
    runAction: async (_ref,args) => { assert.equal(args.clerkUserId,'verified-owner'); throw new ConvexError({code:'PRO_REQUIRED'}); },
    runQuery: async ()=>{throw Error('Must deny before preparing model');},
  };
  await run._handler(ctx,{requestId:'request',attempt:1});
  assert.equal(calls.length,2); assert.equal(calls[1].error.code,'PRO_REQUIRED');
});


test('profile update preserves resubmitted current avatar and banner attachments', async () => {
  const { updateProfile } = await import('../convex/users.ts');
  const f = fixture();
  f.alice.avatarUploadId = 'existing-avatar';
  f.alice.bannerUploadId = 'existing-banner';
  f.rows.set('existing-avatar', { _id: 'existing-avatar', ownerId: f.alice._id, purpose: 'avatar', status: 'attached' });
  f.rows.set('existing-banner', { _id: 'existing-banner', ownerId: f.alice._id, purpose: 'banner', status: 'attached' });
  await updateProfile._handler(f.ctx, { displayName: 'Updated name', bio: 'Updated bio', avatarUploadId: 'existing-avatar', bannerUploadId: 'existing-banner' });
  assert.equal(f.alice.displayName, 'Updated name');
  assert.equal(f.alice.avatarUploadId, 'existing-avatar');
  assert.equal(f.alice.bannerUploadId, 'existing-banner');
  assert.ok(f.rows.has('existing-avatar'));
  assert.ok(f.rows.has('existing-banner'));
});

test('live entitlement policy accepts Clerk SDK class instances with valid paid features', async()=>{
  const {agentEntitlement}=await import('../convex/lib/billing.ts');
  class Feature {slug='tether_agent';}
  class Plan {slug='pro'; features=[new Feature()];}
  class Item {status='active';periodStart=Date.now()-1000;periodEnd=Date.now()+60000;isFreeTrial=false;plan=new Plan();}
  class Subscription {id='sub_sdk_resource';status='active';updatedAt=Date.now();subscriptionItems=[new Item()];}
  assert.equal(agentEntitlement(new Subscription(),Date.now()).allowed,true);
});
