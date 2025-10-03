import db from '../src/lib/offlineDb';

test('can write and read a message', async () => {
  const id = 'test-msg-1';
  await db.messages.put({ id, createdAt: Date.now(), status: 'pending', text: 'hello' });
  const found = await db.messages.get(id);
  expect(found.text).toBe('hello');
  await db.messages.delete(id);
});
