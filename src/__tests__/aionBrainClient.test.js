import { think } from '../services/aionBrainClient';

describe('aionBrainClient', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('calls brain think endpoint and returns json', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ response: 'ok' }) });
    const out = await think('hello', {});
    expect(out.response).toBe('ok');
    expect(global.fetch).toHaveBeenCalled();
  });

  it('throws when endpoint is not ok', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(think('hi', {})).rejects.toThrow();
  });
});
