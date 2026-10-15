import { getTheme } from '../data/themes';
import type { Choice, Profile, Scene, Story } from '../types';
export const TOTAL_PAGES = 6;
export const defaultProfile: Profile = {
  name: '小星',
  age: 7,
  interests: '恐龙、绘画',
  theme: 'forest',
};
export function validateProfile(p: Profile): Partial<Record<keyof Profile, string>> {
  const errors: Partial<Record<keyof Profile, string>> = {};
  if (!p.name.trim() || p.name.trim().length > 16) errors.name = '请输入 1～16 个字的主角名字';
  if (!Number.isInteger(p.age) || p.age < 3 || p.age > 12) errors.age = '年龄需要在 3～12 岁之间';
  if (!p.interests.trim() || p.interests.trim().length > 40)
    errors.interests = '请输入 1～40 个字的兴趣爱好';
  if (!['forest', 'space', 'ocean'].includes(p.theme)) errors.theme = '请选择一个故事世界';
  return errors;
}
export function createStory(profile: Profile, seed = Math.floor(Math.random() * 10000)): Story {
  if (Object.keys(validateProfile(profile)).length) throw new Error('请先完善主角资料');
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    profile: { ...profile, name: profile.name.trim(), interests: profile.interests.trim() },
    seed,
    choices: {},
    page: 0,
  };
}
/** 修改较早的分支会清除依赖它的后续选择，避免前后剧情矛盾。 */
export function choose(story: Story, page: 1 | 3, value: Choice): Story {
  const choices = { ...story.choices, [page]: value };
  if (page === 1 && story.choices[1] !== value) delete choices[3];
  return { ...story, choices, page };
}
export function canAdvance(story: Story): boolean {
  return (
    story.page < TOTAL_PAGES - 1 &&
    (!(story.page === 1 || story.page === 3) || story.choices[story.page] !== undefined)
  );
}
/** 兴趣改变伙伴或工具及解决事件的方法；自由输入也成为故事中的实践活动。 */
export function interestKit(profile: Profile): { tool: string; action: string } {
  const { interests, theme } = profile;
  const kits: [RegExp, string, string][] = [
    [
      /恐龙/,
      theme === 'space' ? '机器人恐龙阿咚' : '会点头的恐龙罗盘',
      '你模仿恐龙一大一小的脚步，把线索排成有规律的顺序',
    ],
    [/魔法/, '星屑魔法笔', '你用魔法笔画出想法，朋友们照着图画一起试一试'],
    [/动物/, '动物声音记录盒', '你仔细听朋友们的声音，从重复的节奏中找到了线索'],
    [/机器人/, '积木机器人小方', '你为小方安排三个简单步骤，它帮大家把散乱的零件排好'],
    [/绘画|画画/, '彩虹画板', '你把观察到的线索画成一张图，大家一看就明白了'],
    [/音乐|唱歌/, '口袋木琴', '你敲出一段有规律的节奏，让大家跟着节拍一起行动'],
  ];
  const matches = kits.filter(([re]) => re.test(interests));
  if (matches.length)
    return {
      tool: matches.map((k) => k[1]).join('和'),
      action: matches.map((k) => k[2]).join('；'),
    };
  return {
    tool: `“${interests}”灵感手册`,
    action: `你把平时学习${interests}时用过的“观察、尝试、再调整”方法教给朋友，大家试着把线索重新排列`,
  };
}
export function getScenes(story: Story): Scene[] {
  const p = story.profile,
    t = getTheme(p.theme),
    kit = interestKit(p);
  const route = story.choices[1] ?? 0,
    solution = story.choices[3] ?? 0;
  const opening = [
    '一封贴着星星邮票的邀请信落在窗边',
    '一颗柔软的小光点停在你的书页上',
    '睡前翻开绘本时，一扇小小的光门出现了',
  ][story.seed % 3];
  const young = p.age <= 5,
    older = p.age >= 9;
  const reflection = older
    ? '你发现，解决问题不一定要马上知道答案。先观察线索，再提出猜想，和伙伴一起验证，每一次尝试都让答案更近一点。'
    : young
      ? '试一试，真开心！有朋友帮忙，办法就多啦。'
      : '原来，先认真观察，再和朋友分享想法，就能找到新的办法。';
  const enrich = (simple: string, regular: string, complex: string) =>
    young ? simple : older ? complex : regular;
  return [
    {
      title: `${p.name}的奇妙邀请`,
      paragraphs: [
        enrich(
          `${p.name}，你好呀！${opening}。一起去${t.place}吧！`,
          `${opening}。“${p.name}，我们需要你的帮助！”${t.friend}的声音从里面传来。${p.age}岁的你背上小包，向${t.place}出发。`,
          `${opening}。信中写道：“${p.name}，${t.place}有一道等待解开的谜题。”${p.age}岁的你决定把这次旅程当作一次探索，带着好奇心寻找答案。`,
        ),
        `因为你喜欢${p.interests}，背包里还装着${kit.tool}。这份小小的爱好，会在旅途中派上用场。`,
      ],
    },
    {
      title: '两条路，新的发现',
      paragraphs: [
        enrich(
          `${t.friend}向你挥挥手。“${p.name}，我们要${t.mission}。”前面有两条路。你想走哪条？`,
          `“${p.name}，欢迎你！”${t.friend}把任务告诉你：${t.mission}。前方出现两条路，每条路都藏着不同的发现。`,
          `${t.friend}解释了这次任务：${t.mission}。你们商量先收集信息，再制定计划。两条路线各有线索，你会怎样开始调查？`,
        ),
      ],
      question: '小小冒险家，你想怎么出发？',
      options: t.routes,
    },
    {
      title: route === 0 ? '藏在线索里的惊喜' : '一位新朋友的礼物',
      paragraphs: [
        t.routeResults[route],
        `“${p.name}，你的${kit.tool}能帮忙吗？”${t.friend}问。${kit.action}。`,
        reflection,
      ],
    },
    {
      title: '把小小想法变成光',
      paragraphs: [
        enrich(
          `到啦！可是事情还没有做好。${t.friend}说：“${p.name}，我们一起想办法吧。”`,
          `线索把你们带到了目的地。要${t.mission}，还需要最后一步。${p.name}拿出${kit.tool}，想到两种办法。`,
          `你们整理了途中获得的线索，但线索本身还不是答案。要${t.mission}，需要把观察变成行动。${p.name}提出两种可以验证的方案。`,
        ),
        route === 0
          ? '一路收集的自然线索，让你们学会了细心观察。'
          : '新朋友分享的知识，让你们懂得了互相请教。',
      ],
      question: '这一次，你来决定故事的方向',
      options: t.solutions,
    },
    {
      title: solution === 0 ? '一起试试，就有奇迹' : '一个想法，许多微光',
      paragraphs: [
        t.endings[solution],
        `在行动之前，${kit.action}。${t.friend}笑着说：“谢谢你，${p.name}！你的爱好变成了大家的好办法。”`,
        enrich(
          '你笑了。朋友们也笑了。你们一起做到了！',
          '这次没有谁是独自完成任务的。每个小小的帮助，都让最后的成功多了一点光。',
          '你在心里记下：不同的方法会带来不同的发现。认真倾听、尊重伙伴的长处，比急着证明自己更有力量。',
        ),
      ],
    },
    {
      title: `${p.name}，你让世界亮了一点`,
      paragraphs: [
        `${t.mission}的任务完成了！${t.friend}把“${t.badge}”徽章轻轻别在你的背包上。`,
        `这趟冒险里，你选择了${t.routes[route]}，又决定${t.solutions[solution]}。你的选择，写成了独一无二的一页。`,
        enrich(
          '星星亮啦。带着好梦，明天再见！',
          `回到家，你把${kit.tool}放在枕边。原来，喜欢的事情和温柔的勇气，可以带你走很远。下一次冒险，已经在星光里等你了。`,
          '你把这次探索记录下来：从不同的路线收集信息，用自己喜欢的方式思考，再把方法分享给伙伴。真正的宝藏，是愿意继续探索的心。',
        ),
      ],
    },
  ];
}
