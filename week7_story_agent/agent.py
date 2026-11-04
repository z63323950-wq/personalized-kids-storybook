"""Local LangGraph workflow: four explicit tools, bounded rule planner and review gate."""
from __future__ import annotations
import argparse, importlib.util, json, os, shutil, subprocess, sys, tempfile, wave
from datetime import datetime, timezone
from pathlib import Path
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=Path(__file__).resolve().parent
BASE=ROOT.parent
spec=importlib.util.spec_from_file_location('week2_storygen',BASE/'week2_story_generator/storygen.py')
storygen=importlib.util.module_from_spec(spec);spec.loader.exec_module(storygen)

class State(TypedDict, total=False):
    idea:str; name:str; age:int; setting:str; theme:str; out:str; story:dict; log:list; mode:str; review:dict

def record(state, tool, detail):
    return state.get('log',[])+[{'time':datetime.now(timezone.utc).isoformat(),'tool':tool,'detail':detail}]

def planner(state):
    text=state['idea']; theme='space' if any(x in text for x in ('星际','宇宙','太空','飞船','星球')) else 'ocean' if any(x in text for x in ('海底','海洋','海龟','珊瑚','海湾')) else 'forest'
    settings={'forest':'萤光森林','space':'星光星球','ocean':'蓝贝壳海湾'}
    return {'theme':theme,'setting':settings[theme], 'log':record(state,'planner',f'按关键词选择主题 {theme}；计划：故事 → 核对修改 → 配图 → 语音 → 视频')}

def writing_tool(state):
    story=storygen.make_story(state['name'],state['age'],state['setting'],state['theme'],'中',state['age'])
    path=Path(state['out'])/'story.json';path.write_text(json.dumps(story,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return {'story':story,'log':record(state,'writing_tool',f'生成并校验 {len(story["scenes"])} 场景结构化故事')}

def review_node(state):
    print('\n初稿：',state['story']['title'],'\n',state['story']['scenes'][0]['text'],flush=True)
    if state.get('mode')=='interactive':
        new_name=input('主角名字（回车保留）：').strip();new_setting=input('故事场景（回车保留）：').strip();new_theme=input('主题 forest / space / ocean（回车保留）：').strip()
        changes={k:v for k,v in {'name':new_name,'setting':new_setting,'theme':new_theme}.items() if v}
    else: changes=state.get('review',{})
    if set(changes)-{'name','setting','theme'}: raise ValueError('仅支持修改 name、setting、theme')
    merged={**state,**changes}
    if changes:
        story=storygen.make_story(merged['name'],merged['age'],merged['setting'],merged['theme'],'中',merged['age'])
        (Path(state['out'])/'story.json').write_text(json.dumps(story,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    else: story=state['story']
    return {**changes,'story':story,'log':record(state,'human_review',f'用户修改：{json.dumps(changes,ensure_ascii=False)}；故事已重新生成' if changes else '用户保留初稿')}

def image_tool(state):
    out=Path(state['out'])/'images';out.mkdir(exist_ok=True)
    if state['theme']=='forest': sources=[BASE/f'week3_picturebook/images/scene-{i:02}.png' for i in range(1,5)]; origin='第3周固定森林插画'
    else:
        data=json.loads((BASE/'week6_asset_search/assets/manifest.json').read_text(encoding='utf-8'))
        found=[BASE/'week6_asset_search'/r['path'] for r in data if r['type']=='image' and r['theme']==state['theme']]
        if not found: raise RuntimeError('主题缺少本地图片素材')
        sources=[found[i%len(found)] for i in range(4)];origin='第6周程序绘制主题素材卡'
    for i,p in enumerate(sources,1):shutil.copy2(p,out/f'scene-{i:02}.png')
    return {'log':record(state,'image_tool',f'每场景分配1张现有图片；来源：{origin}。非按新角色生成。')}

def audio_tool(state):
    out=Path(state['out']); powershell=shutil.which('pwsh');ffmpeg=shutil.which('ffmpeg')
    if not powershell or not ffmpeg: raise RuntimeError('需要 PowerShell 7 和 FFmpeg')
    script=ROOT/'speak.ps1'; text=out/'narration.txt';text.write_text('\n'.join(s['text'] for s in state['story']['scenes']),encoding='utf-8-sig')
    with tempfile.TemporaryDirectory(prefix='week7voice-') as temp:
        wav=Path(temp)/'narration.wav'
        subprocess.run([powershell,'-NoProfile','-File',str(script),'-TextPath',str(text),'-WavPath',str(wav)],check=True)
        subprocess.run([ffmpeg,'-v','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','128k',str(out/'narration.mp3')],check=True)
    return {'log':record(state,'audio_tool','Windows 本地中文语音朗读四场景，生成 narration.mp3；单音色')}

def video_tool(state):
    out=Path(state['out']); audio=out/'narration.mp3'
    probe=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(audio)],capture_output=True,text=True,check=True)
    duration=float(probe.stdout.strip()); font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',28)
    # Overall scene allocation is proportional to text length; it is not sentence-level alignment.
    lengths=[len(s['text']) for s in state['story']['scenes']];weights=[x/sum(lengths) for x in lengths]
    with tempfile.TemporaryDirectory(prefix='week7video-') as temp:
        temp=Path(temp);entries=[]
        for i,scene in enumerate(state['story']['scenes'],1):
            image=ImageOps.fit(Image.open(out/f'images/scene-{i:02}.png').convert('RGB'),(1280,720));draw=ImageDraw.Draw(image)
            draw.rectangle((0,625,1280,720),fill='#1b362d');draw.text((40,648),f'第 {i} 幕 · {scene["description"][:28]}',font=font,fill='white')
            file=temp/f'{i:02}.png';image.save(file);entries.extend([f"file '{file.as_posix()}'",f'duration {duration*weights[i-1]:.6f}'])
        entries.append(f"file '{(temp/'04.png').as_posix()}'")
        listing=temp/'frames.txt';listing.write_text('\n'.join(entries),encoding='utf-8')
        subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(listing),'-i',str(audio),'-c:v','libx264','-preset','veryfast','-pix_fmt','yuv420p','-r','12','-c:a','aac','-t',str(duration),'-movflags','+faststart',str(out/'story.mp4')],check=True)
    return {'log':record(state,'video_tool',f'合成静态场景视频 {duration:.1f} 秒；画面时间按字数估算，非逐句对齐')}

def finish(state):
    out=Path(state['out']);log=record(state,'finish','创作流程完成；请检查声音和图文一致性')
    (out/'workflow-log.json').write_text(json.dumps({'input':state['idea'],'name':state['name'],'theme':state['theme'],'setting':state['setting'],'events':log},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return {'log':log}

def run(args):
    out=Path(args.out).resolve();out.mkdir(parents=True,exist_ok=False)
    graph=StateGraph(State)
    for name,fn in [('plan',planner),('write',writing_tool),('review',review_node),('images',image_tool),('audio',audio_tool),('video',video_tool),('finish',finish)]:graph.add_node(name,fn)
    chain=[START,'plan','write','review','images','audio','video','finish',END]
    for a,b in zip(chain,chain[1:]):graph.add_edge(a,b)
    initial={'idea':args.idea,'name':args.name,'age':args.age,'out':str(out),'mode':args.mode,'review':args.review,'log':[]}
    try:
        result=graph.compile().invoke(initial)
        print(f'\n完成：{out}\n主题：{result["theme"]}\n视频：{out / "story.mp4"}')
    except Exception as exc:
        (out/'error.txt').write_text(str(exc),encoding='utf-8');raise

if __name__=='__main__':
    p=argparse.ArgumentParser(description='离线故事图工作流（不调用模型）')
    p.add_argument('--idea',required=True);p.add_argument('--name',default='小月');p.add_argument('--age',type=int,default=7);p.add_argument('--out',required=True)
    p.add_argument('--mode',choices=('interactive','automatic'),default='interactive');p.add_argument('--review',type=json.loads,default={},help='自动验收用 JSON，如 {"name":"小星"}')
    try:run(p.parse_args())
    except (ValueError,OSError,RuntimeError,subprocess.CalledProcessError) as exc:sys.exit(f'运行失败：{exc}')
