// Firestore security-rules tests for Holidate (run with: cd tests && npm test)
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, deleteDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-holidate',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
  });
});
after(async () => { await env?.cleanup(); });

// Trip t1: owner alice, member bob. Stranger: mallory. Invite SUN-1111 opens t1.
// Mallory owns her own trip t9.
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'trips', 't1'), { name: 'Winter Sun', type: 'Couple', ownerUid: 'alice', memberUids: ['alice', 'bob'], items: [] });
    await setDoc(doc(db, 'trips', 't9'), { name: 'Mallory trip', type: 'Friends', ownerUid: 'mallory', memberUids: ['mallory'] });
    await setDoc(doc(db, 'invites', 'SUN-1111'), { ownerUid: 'alice', tripId: 't1', createdAt: 1 });
  });
});
const as = uid => env.authenticatedContext(uid).firestore();
const trip = (uid, id = 't1') => doc(as(uid), 'trips', id);

// ---- H-01: trip membership / ownership ----
test('member (non-owner) cannot take over ownerUid', async () => {
  await assertFails(updateDoc(trip('bob'), { ownerUid: 'bob' }));
});
test('member (non-owner) cannot add strangers or remove others', async () => {
  await assertFails(updateDoc(trip('bob'), { memberUids: arrayUnion('mallory') }));
  await assertFails(updateDoc(trip('bob'), { memberUids: ['bob'] }));
  await assertFails(updateDoc(trip('bob'), { memberUids: ['bob', 'mallory'] }));
});
test('member cannot sneak a membership change in with a collaborative edit', async () => {
  await assertFails(updateDoc(trip('bob'), { items: [{ name: 'Aruba' }], memberUids: ['alice', 'bob', 'mallory'] }));
});
test('member CAN edit collaborative fields', async () => {
  await assertSucceeds(updateDoc(trip('bob'), { items: [{ name: 'Aruba' }], prefs: { bob: { room: 'Shared' } } }));
});
test('member cannot rename the trip (owner-only field)', async () => {
  await assertFails(updateDoc(trip('bob'), { name: 'Bob’s trip now' }));
});
test('member can leave (remove only themselves)', async () => {
  await assertSucceeds(updateDoc(trip('bob'), { memberUids: arrayRemove('bob') }));
});
test('owner CAN add and remove members', async () => {
  await assertSucceeds(updateDoc(trip('alice'), { memberUids: arrayUnion('carol') }));
  await assertSucceeds(updateDoc(trip('alice'), { memberUids: arrayRemove('bob') }));
});
test('owner cannot hand off ownerUid or remove themselves', async () => {
  await assertFails(updateDoc(trip('alice'), { ownerUid: 'bob' }));
  await assertFails(updateDoc(trip('alice'), { memberUids: ['bob'] }));
});
test('stranger cannot read or edit the trip', async () => {
  await assertFails(getDoc(trip('mallory')));
  await assertFails(updateDoc(trip('mallory'), { items: [] }));
});
test('new trip must start with only its owner', async () => {
  await assertSucceeds(setDoc(doc(as('carol'), 'trips', 't2'), { name: 'New', ownerUid: 'carol', memberUids: ['carol'] }));
  await assertFails(setDoc(doc(as('carol'), 'trips', 't3'), { name: 'New', ownerUid: 'alice', memberUids: ['carol'] }));
  await assertFails(setDoc(doc(as('carol'), 'trips', 't4'), { name: 'New', ownerUid: 'carol', memberUids: ['carol', 'alice'] }));
});

// ---- Joining via invite ----
test('holder of a valid invite can add ONLY themselves', async () => {
  await assertSucceeds(updateDoc(trip('carol'), { memberUids: arrayUnion('carol'), joinCode: 'SUN-1111' }));
});
test('joining fails with a fake code, or when adding someone else too', async () => {
  await assertFails(updateDoc(trip('carol'), { memberUids: arrayUnion('carol'), joinCode: 'SUN-0000' }));
  await assertFails(updateDoc(trip('carol'), { memberUids: arrayUnion('carol', 'dave'), joinCode: 'SUN-1111' }));
  await assertFails(updateDoc(trip('carol'), { memberUids: arrayUnion('carol'), joinCode: 'SUN-1111', ownerUid: 'carol' }));
});
test('an invite for another trip does not open this one', async () => {
  await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), 'invites', 'SUN-9999'), { ownerUid: 'mallory', tripId: 't9', createdAt: 1 }); });
  await assertFails(updateDoc(trip('carol'), { memberUids: arrayUnion('carol'), joinCode: 'SUN-9999' }));
});

// ---- H-02: invite codes ----
test('stranger cannot overwrite or delete someone else’s invite', async () => {
  const inv = doc(as('mallory'), 'invites', 'SUN-1111');
  await assertFails(setDoc(inv, { ownerUid: 'mallory', tripId: 't9', createdAt: 2 }));
  await assertFails(updateDoc(inv, { tripId: 't9' }));
  await assertFails(deleteDoc(inv));
});
test('member who is not the owner cannot mint invites', async () => {
  await assertFails(setDoc(doc(as('bob'), 'invites', 'SUN-2222'), { ownerUid: 'bob', tripId: 't1', createdAt: 2 }));
});
test('cannot mint an invite pointing at a trip you do not own', async () => {
  await assertFails(setDoc(doc(as('mallory'), 'invites', 'SUN-3333'), { ownerUid: 'mallory', tripId: 't1', createdAt: 2 }));
  await assertFails(setDoc(doc(as('mallory'), 'invites', 'SUN-3334'), { ownerUid: 'alice', tripId: 't1', createdAt: 2 }));
});
test('owner can mint, but not re-point, and can delete their invite', async () => {
  const inv = doc(as('alice'), 'invites', 'SUN-4444');
  await assertSucceeds(setDoc(inv, { ownerUid: 'alice', tripId: 't1', createdAt: 2 }));
  await assertFails(updateDoc(inv, { tripId: 't9' }));
  await assertSucceeds(deleteDoc(inv));
});
test('anyone can fetch an invite by exact code (needed to join)', async () => {
  await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(), 'invites', 'SUN-1111')));
});
