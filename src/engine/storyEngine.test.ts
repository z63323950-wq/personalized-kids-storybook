import { describe, expect, it } from 'vitest';
import {
  canAdvance,
  choose,
  createStory,
  defaultProfile,
  getScenes,
  interestKit,
  validateProfile,
} from './storyEngine';
import { themes } from '../data/themes';
import type { Choice } from '../types';
describe('个性化与表单验证', () => {
  it('拒绝空输入、超长输入、非整数与越界年龄', () => {
    expect(validateProfile(defaultProfile)).toEqual({});
    for (const name of ['', '   ', '星'.repeat(17)])
      expect(validateProfile({ ...defaultProfile, name }).name).toBeTruthy();
    for (const age of [2, 13, NaN, 7.5])
      expect(validateProfile({ ...defaultProfile, age }).age).toBeTruthy();
    for (const interests of ['', ' '.repeat(3), '龙'.repeat(41)])
      expect(validateProfile({ ...defaultProfile, interests }).interests).toBeTruthy();
    expect(() => createStory({ ...defaultProfile, name: '' })).toThrow();
  });
  it('修剪输入、保留姓名，并按年龄改变篇幅和表达', () => {
    const young = createStory({ ...defaultProfile, name: '  桃桃  ', age: 3 }, 0);
    const older = createStory({ ...defaultProfile, name: '桃桃', age: 12 }, 0);
    expect(young.profile.name).toBe('桃桃');
    expect(getScenes(young)[0].paragraphs.join('')).toContain('桃桃');
    expect(getScenes(young)[0].paragraphs[0].length).toBeLessThan(
      getScenes(older)[0].paragraphs[0].length,
    );
    expect(getScenes(older)[2].paragraphs.join('')).toContain('验证');
  });
  it('兴趣同时影响工具和具体行动，自由输入也有作用', () => {
    const dinosaur = interestKit({ ...defaultProfile, theme: 'space', interests: '恐龙' });
    const painting = interestKit({ ...defaultProfile, interests: '绘画' });
    expect(dinosaur.tool).toContain('机器人恐龙');
    expect(dinosaur.action).not.toEqual(painting.action);
    expect(interestKit({ ...defaultProfile, interests: '园艺' }).tool).toContain('园艺');
    expect(
      getScenes(createStory({ ...defaultProfile, interests: '园艺' }, 0))[2].paragraphs.join(''),
    ).toContain('园艺');
  });
  it('同一 seed 生成可重现正文，不同 seed 改变开场', () => {
    expect(getScenes(createStory(defaultProfile, 0))).toEqual(
      getScenes(createStory(defaultProfile, 0)),
    );
    expect(getScenes(createStory(defaultProfile, 1))[0]).not.toEqual(
      getScenes(createStory(defaultProfile, 0))[0],
    );
  });
});
describe('三个主题全部分支路径', () => {
  for (const theme of themes)
    for (const route of [0, 1] as Choice[])
      for (const ending of [0, 1] as Choice[]) {
        it(`${theme.name}：路线 ${route} → 结局 ${ending} 连贯完成`, () => {
          let story = createStory({ ...defaultProfile, theme: theme.id }, 0);
          expect(canAdvance(story)).toBe(true);
          story = { ...story, page: 1 };
          expect(canAdvance(story)).toBe(false);
          story = choose(story, 1, route);
          expect(canAdvance(story)).toBe(true);
          story = { ...story, page: 3 };
          expect(canAdvance(story)).toBe(false);
          story = choose(story, 3, ending);
          expect(canAdvance(story)).toBe(true);
          const scenes = getScenes(story);
          expect(scenes).toHaveLength(6);
          expect(scenes[2].paragraphs).toContain(theme.routeResults[route]);
          expect(scenes[4].paragraphs).toContain(theme.endings[ending]);
          expect(scenes[5].paragraphs.join('')).toContain(theme.badge);
          expect(scenes[5].paragraphs.join('')).toContain(theme.routes[route]);
          expect(scenes[5].paragraphs.join('')).toContain(theme.solutions[ending]);
          expect(canAdvance({ ...story, page: 5 })).toBe(false);
        });
      }
  it('修改第一个选择时清除后续选择，相同选择保留', () => {
    let story = choose(choose(createStory(defaultProfile, 0), 1, 0), 3, 1);
    expect(choose(story, 1, 0).choices[3]).toBe(1);
    story = choose(story, 1, 1);
    expect(story.choices[3]).toBeUndefined();
  });
  it('主题背景、任务和结局各不相同', () => {
    const texts = themes.map(
      (t) => getScenes(createStory({ ...defaultProfile, theme: t.id }, 0))[5].paragraphs[0],
    );
    expect(new Set(texts).size).toBe(3);
  });
});
