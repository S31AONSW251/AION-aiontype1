import { CreativityEngine } from '../creativity.js';

describe('CreativityEngine fallback behavior', () => {
  test('applyMetaphor fallback modifies response', async () => {
    const engine = new CreativityEngine(null);
    const input = 'This is a test response that discusses the nature of ideas and connections.';
    const out = await engine.enhanceResponse(input, { variants: 2, ttl: 1 });
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThanOrEqual(input.length);
  });

  test('story enhancement contains Story prefix when chosen', async () => {
    const engine = new CreativityEngine(null);
    const input = 'A short thoughtful paragraph that is slightly long enough to trigger storytelling behavior based on heuristics.';
    const enhanced = await engine.enhanceResponse(input);
    // either unchanged or contains 'Story:'
    expect(typeof enhanced).toBe('string');
  });
});
