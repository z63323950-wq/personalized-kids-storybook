import { validateProfile } from '../engine/storyEngine';
import type { Profile, Story } from '../types';
const KEY = 'starry-storyland:v1';
export interface SavedState {
  profile: Profile;
  stories: Story[];
  activeId: string | null;
}
export function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== 'object') return false;
  const p = value as Profile;
  return (
    typeof p.name === 'string' &&
    typeof p.interests === 'string' &&
    typeof p.age === 'number' &&
    Object.keys(validateProfile(p)).length === 0
  );
}
export function isStory(value: unknown): value is Story {
  if (!value || typeof value !== 'object') return false;
  const s = value as Story;
  return (
    typeof s.id === 'string' &&
    typeof s.createdAt === 'string' &&
    Number.isFinite(Date.parse(s.createdAt)) &&
    isProfile(s.profile) &&
    Number.isInteger(s.seed) &&
    s.seed >= 0 &&
    Number.isInteger(s.page) &&
    s.page >= 0 &&
    s.page < 6 &&
    !!s.choices &&
    typeof s.choices === 'object' &&
    [s.choices[1], s.choices[3]].every((c) => c === undefined || c === 0 || c === 1) &&
    (s.page <= 1 || s.choices[1] !== undefined) &&
    (s.page <= 3 || s.choices[3] !== undefined)
  );
}
export function loadState(): { state: SavedState | null; warning: string } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { state: null, warning: '' };
    const parsed = JSON.parse(raw);
    if (!isProfile(parsed.profile) || !Array.isArray(parsed.stories)) throw new Error('invalid');
    const stories = parsed.stories.filter(isStory).slice(0, 12);
    return {
      state: {
        profile: parsed.profile,
        stories,
        activeId: stories.some((s: Story) => s.id === parsed.activeId) ? parsed.activeId : null,
      },
      warning: stories.length < parsed.stories.length ? '部分旧故事无法读取，其余故事已恢复。' : '',
    };
  } catch {
    return { state: null, warning: '浏览器保存的数据暂时无法读取，你仍然可以开始新的冒险。' };
  }
}
export function saveState(state: SavedState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
