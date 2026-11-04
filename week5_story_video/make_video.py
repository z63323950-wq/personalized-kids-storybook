"""用第 3 周插画、第 4 周配音时间轴制作本地故事视频。"""
from __future__ import annotations
import json, math, shutil, struct, subprocess, tempfile, wave
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
FONT = Path('C:/Windows/Fonts/msyh.ttc')

def wrap(text, font, draw, max_width):
    lines, current = [], ''
    for char in text:
        candidate = current + char
        if current and draw.textlength(candidate, font=font) > max_width:
            lines.append(current); current = char
        else: current = candidate
    if current: lines.append(current)
    return lines

def make_music(path, duration):
    """原创低音量合成伴奏：柔和和弦；仅标准库，无外部素材。"""
    rate=22050; chords=[(130.81,164.81,196.0),(110.0,130.81,164.81),(87.31,110.0,130.81),(98.0,123.47,146.83)]
    with wave.open(str(path),'wb') as out:
        out.setnchannels(1); out.setsampwidth(2); out.setframerate(rate)
        block=[]
        for i in range(math.ceil(duration*rate)):
            t=i/rate; freqs=chords[int(t//8)%len(chords)]
            fade=min(1,t/3,(duration-t)/3); fade=max(0,fade)
            amp=sum(math.sin(2*math.pi*f*t)*0.5+math.sin(2*math.pi*2*f*t)*0.12 for f in freqs)/3
            block.append(struct.pack('<h',int(amp*1600*fade)))
            if len(block)==8192: out.writeframesraw(b''.join(block));block=[]
        out.writeframesraw(b''.join(block))

def main():
    for cmd in ('ffmpeg','ffprobe'):
        if not shutil.which(cmd): raise RuntimeError(f'未找到 {cmd}')
    timeline=json.loads((BASE/'week4_audiobook/output/timeline.json').read_text(encoding='utf-8'))
    segments=timeline['segments']; duration=float(timeline['duration'])
    if len(segments)<1 or duration<60: raise ValueError('故事时间轴为空或短于 60 秒')
    if not FONT.exists(): raise FileNotFoundError('缺少微软雅黑字体 C:/Windows/Fonts/msyh.ttc')
    for i,s in enumerate(segments):
        if s['scene'] not in (1,2,3,4) or s['start']<0 or s['end']<=s['start'] or (i and s['start']<segments[i-1]['end']): raise ValueError(f'时间轴错误：第 {i+1} 句')
    out=ROOT/'output';out.mkdir(exist_ok=True)
    target=out/'story-video.mp4'
    if target.exists(): raise FileExistsError('成片已存在，请先备份并移走旧文件')
    font=ImageFont.truetype(str(FONT),31); rolefont=ImageFont.truetype(str(FONT),22)
    srt=[]
    def stamp(t):
        ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
    with tempfile.TemporaryDirectory(prefix='story-video-') as temp:
        temp=Path(temp); entries=[]
        for i,seg in enumerate(segments):
            source=BASE/f'week3_picturebook/images/scene-{seg["scene"]:02}.png'
            im=ImageOps.fit(Image.open(source).convert('RGB'),(1280,720),method=Image.Resampling.LANCZOS)
            overlay=Image.new('RGBA',im.size,(0,0,0,0));draw=ImageDraw.Draw(overlay)
            lines=wrap(seg['text'],font,draw,1120)
            boxheight=77+len(lines)*45
            draw.rounded_rectangle((40,720-boxheight-20,1240,700),radius=18,fill=(20,35,26,200))
            draw.text((75,720-boxheight-7),f'{seg["role"]}  ·  {seg["emotion"]}',font=rolefont,fill='#f6d79d')
            for j,line in enumerate(lines): draw.text((75,720-boxheight+27+j*45),line,font=font,fill='white')
            frame=Image.alpha_composite(im.convert('RGBA'),overlay).convert('RGB'); name=f'{i:03}.jpg';frame.save(temp/name,quality=88)
            end=segments[i+1]['start'] if i+1<len(segments) else duration
            entries.extend([f"file '{name}'",f'duration {end-seg["start"]:.3f}'])
            srt.append(f'{i+1}\n{stamp(seg["start"])} --> {stamp(seg["end"])}\n{seg["role"]}：{seg["text"]}\n')
        entries.append(f"file '{len(segments)-1:03}.jpg'")
        (temp/'frames.txt').write_text('\n'.join(entries)+'\n',encoding='utf-8')
        (out/'story-subtitles.srt').write_text('\n'.join(srt),encoding='utf-8-sig')
        make_music(temp/'music.wav',duration)
        args=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(temp/'frames.txt'),'-i',str(BASE/'week4_audiobook/output/story.mp3'),'-i',str(temp/'music.wav'),'-filter_complex','[1:a]volume=1[voice];[2:a]volume=0.45[music];[voice][music]amix=inputs=2:duration=first:normalize=0[a]','-map','0:v','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-r','12','-c:a','aac','-b:a','128k','-t',str(duration),'-movflags','+faststart',str(target)]
        subprocess.run(args,check=True)
    print(f'生成成功：{target}，{duration:.2f}秒，{len(segments)}段字幕')

if __name__=='__main__':
    try: main()
    except (OSError,ValueError,KeyError,RuntimeError,subprocess.CalledProcessError) as e: raise SystemExit(f'生成失败：{e}')
