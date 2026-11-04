"""离线结构化儿童故事生成器。剧情来自本地模板，不调用模型。"""
import argparse
import json
import sys
from pathlib import Path

THEMES = {
    'forest': {'name':'奇幻森林','friend':'小狐狸栗栗','appearance':'橘色毛发，白色尾尖，背绿色小包','task':'找回风铃树的歌声','clue':'一条细藤缠住了风铃','solution':'扶住树枝，轻轻解开藤蔓','moral':'细心观察和互相帮助能解决问题','landscape':'绿树、蘑菇与暖色阳光'},
    'space': {'name':'星际探险','friend':'机器人点点','appearance':'圆形银色身体，蓝色眼灯，胸前有星星徽章','task':'点亮星球的灯塔','clue':'灯塔旁的晶石能够储存阳光','solution':'和伙伴调整晶石的方向，收集阳光','moral':'好奇和合作能带来新的发现','landscape':'星空、彩色星球和发光晶石'},
    'ocean': {'name':'海底寻宝','friend':'小海龟泡泡','appearance':'绿色龟壳带浅色纹路，戴黄色小围巾','task':'帮助珊瑚花园恢复生机','clue':'一只宝箱里装着珊瑚种子，海湾里漂着垃圾','solution':'和海洋朋友清理垃圾，种下珊瑚种子','moral':'保护环境需要每个朋友一起行动','landscape':'碧蓝海水、珊瑚和贝壳'},
}

def validate(story):
    def text(value): return isinstance(value, str) and bool(value.strip())
    if not isinstance(story, dict) or not text(story.get('title')) or not text(story.get('moral')):
        raise ValueError('缺少故事标题或寓意')
    chars, scenes = story.get('characters'), story.get('scenes')
    if not isinstance(chars, list) or not chars or any(not isinstance(c, dict) or any(not text(c.get(k)) for k in ('name','traits','appearance')) for c in chars):
        raise ValueError('角色信息不完整')
    if not isinstance(scenes, list) or not 3 <= len(scenes) <= 6:
        raise ValueError('需要 3～6 个场景')
    for i, scene in enumerate(scenes, 1):
        if not isinstance(scene, dict) or type(scene.get('scene_id')) is not int or scene['scene_id'] != i or any(not text(scene.get(k)) for k in ('description','text','mood','visual_prompt')):
            raise ValueError(f'场景 {i} 字段缺失或编号错误')

def make_story(name, age, setting, theme, length, audience):
    """按主题挑选剧情，按受众年龄和长度调整表达。"""
    if not isinstance(name, str) or not 1 <= len(name.strip()) <= 20: raise ValueError('主角名须为 1～20 字')
    if not isinstance(setting, str) or not 1 <= len(setting.strip()) <= 100: raise ValueError('场景须为 1～100 字')
    if type(age) is not int or type(audience) is not int or not 3 <= age <= 12 or not 3 <= audience <= 12: raise ValueError('年龄须为 3～12 岁的整数')
    if theme not in THEMES or length not in ('短','中','长'): raise ValueError('未知的主题或故事长度')
    name, setting = name.strip(), setting.strip()
    t = THEMES[theme]; friend = t['friend']; hero_look = '戴蓝色星星帽，穿黄色外套，背红色小包'
    beginnings = [f'{age}岁的{name}来到了{setting}。{friend}向{name}挥手：“我们一起{t["task"]}吧！”',
                  f'在{setting}，{age}岁的{name}遇见了{friend}。伙伴们邀请{name}一起{t["task"]}。',
                  f'{age}岁的{name}走进{setting}，听{friend}讲起这次任务：{t["task"]}。他们决定先收集线索，再商量办法。']
    band = 0 if audience <= 5 else 1 if audience <= 8 else 2
    texts = [beginnings[band], f'{name}和{friend}仔细观察，发现{t["clue"]}。“这可能是重要的线索！”{name}说。',
             f'大家决定{t["solution"]}。{friend}陪在身边，{name}一点一点地尝试。',
             f'任务完成了！{friend}感谢{name}，朋友们高兴地庆祝。{name}把这次经历记在小本子上。']
    addition = {'短':'','中':'一路上，朋友们停下来倾听彼此的想法。','长':'他们先画下观察到的线索，又轮流提出自己的建议。每一次尝试，都让大家更加了解这个世界。'}[length]
    story = {'title':f'{name}的{t["name"]}之旅','characters':[{'name':name,'traits':'好奇、乐于帮助朋友','appearance':hero_look}, {'name':friend,'traits':'友善、愿意合作','appearance':t['appearance']}], 'scenes':[], 'moral':t['moral']}
    for i, body in enumerate(texts, 1):
        story['scenes'].append({'scene_id':i,'description':f'{setting}：{["相遇出发","发现线索","合作行动","庆祝归来"][i-1]}',
            'text':body + (addition if i == 2 else ''),'mood':['好奇','期待','专注','喜悦'][i-1],
            'visual_prompt':f'儿童绘本风格，{t["landscape"]}，场景在{setting}；主角{name}{hero_look}，伙伴{friend}{t["appearance"]}；画面表现：{body}'})
    validate(story)
    return story

def main(argv=None):
    p = argparse.ArgumentParser(description='离线固定模板，生成结构化儿童故事 JSON。')
    p.add_argument('--name', required=True); p.add_argument('--age', required=True, type=int)
    p.add_argument('--setting', required=True); p.add_argument('--theme', required=True, choices=THEMES)
    p.add_argument('--length', choices=('短','中','长'), default='中'); p.add_argument('--audience', required=True, type=int)
    p.add_argument('--output', required=True, type=Path)
    args = p.parse_args(argv)
    try:
        story = make_story(args.name,args.age,args.setting,args.theme,args.length,args.audience)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with args.output.open('x', encoding='utf-8') as handle:
            json.dump(story, handle, ensure_ascii=False, indent=2); handle.write('\n')
        print(f'离线故事已保存：{args.output}')
        return 0
    except (ValueError, OSError) as exc:
        print(f'生成失败：{exc}', file=sys.stderr); return 1

if __name__ == '__main__': raise SystemExit(main())
