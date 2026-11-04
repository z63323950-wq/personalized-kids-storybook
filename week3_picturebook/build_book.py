"""将已有结构化故事和已生成插图排版成可离线打开的网页绘本。"""
import argparse
import html
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def build(story_file: Path, image_dir: Path, output: Path) -> None:
    story = json.loads(story_file.read_text(encoding='utf-8'))
    if not isinstance(story.get('title'), str) or not isinstance(story.get('moral'), str) or not isinstance(story.get('scenes'), list) or not story['scenes']:
        raise ValueError('故事缺少标题、寓意或场景列表')
    for index, scene in enumerate(story['scenes'], 1):
        if scene.get('scene_id') != index or not all(isinstance(scene.get(key), str) and scene[key].strip() for key in ('description','text')):
            raise ValueError(f'第 {index} 个场景数据不完整')
        if not (image_dir / f'scene-{index:02}.png').is_file():
            raise FileNotFoundError(f'缺少场景插图：{image_dir / f"scene-{index:02}.png"}')
    output.mkdir(parents=True, exist_ok=True)
    image_output = output / 'images'
    image_output.mkdir(exist_ok=True)
    esc = html.escape
    sections = []
    for i, scene in enumerate(story['scenes'], 1):
        shutil.copy2(image_dir / f'scene-{i:02}.png', image_output / f'scene-{i:02}.png')
        sections.append(f'''<section class="spread" id="scene-{i}" aria-label="第{i}幕"><div class="illustration"><img src="images/scene-{i:02}.png" alt="{esc(scene['description'], quote=True)}的插画"></div><div class="words"><p class="chapter">CHAPTER {i:02} · {esc(scene.get('mood',''))}</p><h2>{esc(scene['description'])}</h2><p class="story">{esc(scene['text'])}</p><div class="page-no">✦ &nbsp; {i:02} / {len(story['scenes']):02}</div></div></section>''')
    document = f'''<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(story['title'])} · 星梦绘本</title><style>
    *{{box-sizing:border-box}}body{{margin:0;background:#f7f4e9;color:#294638;font-family:"Microsoft YaHei",sans-serif}}header{{max-width:1160px;margin:auto;padding:25px 20px;display:flex;justify-content:space-between;border-bottom:1px solid #dce3d6;align-items:center}}header span{{font-size:12px;letter-spacing:2px;color:#879881}}button{{border:0;padding:12px 20px;border-radius:24px;background:#315e47;color:white;cursor:pointer;font-size:14px}}button:focus-visible,a:focus-visible{{outline:3px solid #b08027;outline-offset:3px}}.cover{{max-width:1160px;margin:40px auto 32px;padding:0 20px;display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center}}.cover img{{width:100%;border-radius:48% 48% 12px 12px;aspect-ratio:1.3;object-fit:cover}}.cover h1{{font:700 clamp(32px,4vw,58px)/1.35 Georgia,"Songti SC",serif;margin:15px 0}}.cover p{{color:#748874;line-height:2}}.eyebrow,.chapter{{color:#a08758;letter-spacing:3px;font-size:10px}}main{{max-width:1120px;margin:auto}}.spread{{display:grid;grid-template-columns:1.18fr 1fr;min-height:490px;background:#fffefa;border:1px solid #dfe6d8;border-radius:22px;overflow:hidden;margin:26px 20px;box-shadow:0 10px 40px #425b3710}}.illustration img{{width:100%;height:100%;object-fit:cover;display:block}}.words{{padding:48px 46px;display:flex;flex-direction:column;justify-content:center}}h2{{font:700 25px/1.5 Georgia,"Songti SC",serif}}.story{{font:18px/2.2 Georgia,"Songti SC",serif;color:#566c58}}.page-no{{margin-top:30px;color:#a3aa91;font-size:11px}}.ending{{text-align:center;padding:50px 20px 80px;color:#60765d}}.ending strong{{display:block;font:700 25px/1.6 Georgia,serif;margin:12px}}footer{{text-align:center;padding:25px;color:#8e9a85;font-size:12px}}@media(max-width:700px){{header span{{display:none}}.cover,.spread{{grid-template-columns:1fr}}.cover{{gap:20px;margin-top:25px}}.cover img{{max-height:280px}}.spread{{margin:18px 15px}}.illustration img{{aspect-ratio:1.4}}.words{{padding:25px}}.story{{font-size:16px}}}}@media print{{header button{{display:none}}.cover{{break-after:page}}.spread{{break-after:page;break-inside:avoid;min-height:0;margin:0;box-shadow:none}}}}
    </style></head><body><header><strong>✦ 星梦绘本屋</strong><span>A LITTLE ADVENTURE, JUST FOR YOU</span><button onclick="window.print()">打印 / 保存 PDF</button></header><div class="cover"><div><p class="eyebrow">A STORY ABOUT FRIENDSHIP & COURAGE</p><h1>{esc(story['title'])}</h1><p>为小小冒险家准备的一本森林绘本。<br>翻开这一页，让勇气和好奇心一起出发。</p><a href="#scene-1">开始阅读 ↓</a></div><img src="images/scene-01.png" alt="故事封面：森林里的小月和小狐狸"></div><main>{''.join(sections)}<section class="ending"><span>THE END · 故事的小小礼物</span><strong>{esc(story['moral'])}</strong><p>愿每一次发现，都有朋友陪在身边。</p></section></main><footer>✦ 用温柔的想象，点亮每一颗小小的心。</footer></body></html>'''
    (output / 'index.html').write_text(document, encoding='utf-8')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='根据 JSON 和插图生成离线网页绘本')
    parser.add_argument('--story', type=Path, default=ROOT.parent/'week2_story_generator/docs/samples/forest.json')
    parser.add_argument('--images', type=Path, default=ROOT/'images')
    parser.add_argument('--output', type=Path, default=ROOT/'storybook')
    args = parser.parse_args()
    try:
        build(args.story, args.images, args.output)
        print(f'生成成功：{args.output / "index.html"}')
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        parser.exit(1, f'生成失败：{exc}\n')
