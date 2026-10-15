import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStory, defaultProfile } from '../engine/storyEngine';
import { isStory, loadState, saveState } from './storage';
afterEach(() => vi.unstubAllGlobals());
describe('本地保存的防御性读取', () => {
  it('恢复合法进度并拒绝不可能的阅读页', () => {
    const story = createStory(defaultProfile, 1);
    expect(isStory(story)).toBe(true);
    expect(isStory({ ...story, page: 4 })).toBe(false);
    expect(isStory({ ...story, page: -1 })).toBe(false);
    expect(isStory({ ...story, choices: { 1: 8 } })).toBe(false);
  });
  it('损坏 JSON 优雅降级', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{broken' });
    expect(loadState().state).toBeNull();
    expect(loadState().warning).toBeTruthy();
  });
  it('过滤损坏故事，同时保留合法故事', () => {
    const story = createStory(defaultProfile, 1);
    vi.stubGlobal('localStorage', {
      getItem: () =>
        JSON.stringify({
          profile: defaultProfile,
          stories: [story, { ...story, page: 99 }],
          activeId: story.id,
        }),
    });
    expect(loadState().state?.stories).toHaveLength(1);
    expect(loadState().state?.activeId).toBe(story.id);
  });
  it('禁用存储或配额不足时返回失败而不抛出', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new Error('quota');
      },
    });
    expect(saveState({ profile: defaultProfile, stories: [], activeId: null })).toBe(false);
  });
});
