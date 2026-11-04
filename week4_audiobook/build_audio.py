"""Offline Windows TTS, assemble WAV and generate MP3 plus segment timestamps."""
import json
import shutil
import subprocess
import tempfile
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def main():
    if not shutil.which('ffmpeg'): raise RuntimeError('找不到 ffmpeg，请先安装并加入 PATH。')
    story = json.loads((ROOT / 'story.json').read_text(encoding='utf-8'))
    output = ROOT / 'output'; output.mkdir(exist_ok=True)
    if any((output / name).exists() for name in ('story.mp3', 'timeline.json')):
        raise RuntimeError('输出文件已存在，请先备份并手动移走旧文件后再生成。')
    with tempfile.TemporaryDirectory(prefix='story-audio-') as temp:
        folder = Path(temp)
        powershell = shutil.which('pwsh')
        if not powershell: raise RuntimeError('需要 PowerShell 7（pwsh），请安装后重试。')
        subprocess.run([powershell,'-NoProfile','-File',str(ROOT/'synthesize.ps1'),'-StoryPath',str(ROOT/'story.json'),'-OutputDir',str(folder)],check=True)
        wav_files = sorted(folder.glob('*.wav'))
        if len(wav_files) != len(story['segments']): raise RuntimeError('生成的语音片段数与剧本不符')
        timeline, elapsed, pause = [], 0.0, 0.45
        with wave.open(str(folder/'joined.wav'),'wb') as joined:
            expected = None
            for segment, filename in zip(story['segments'], wav_files):
                with wave.open(str(filename),'rb') as source:
                    params=(source.getnchannels(),source.getsampwidth(),source.getframerate(),source.getcomptype())
                    if expected is None:
                        expected=params; joined.setnchannels(params[0]); joined.setsampwidth(params[1]); joined.setframerate(params[2])
                    if params != expected: raise RuntimeError('语音格式不一致，无法无损拼接')
                    duration=source.getnframes()/source.getframerate()
                    joined.writeframes(source.readframes(source.getnframes()))
                    silence_frames=round(source.getframerate()*pause)
                    joined.writeframes(b'\0'*(silence_frames*source.getnchannels()*source.getsampwidth()))
                    timeline.append({**segment,'start':round(elapsed,3),'end':round(elapsed+duration,3)})
                    elapsed += duration+silence_frames/source.getframerate()
        if elapsed < 180: raise RuntimeError(f'合成时长只有 {elapsed:.1f} 秒，不满足三分钟要求；请扩写剧本。')
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(folder/'joined.wav'),'-codec:a','libmp3lame','-b:a','128k',str(output/'story.mp3')],check=True)
        (output/'timeline.json').write_text(json.dumps({'title':story['title'],'duration':round(elapsed,3),'segments':timeline},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(f'生成完成：{elapsed:.1f} 秒，{len(timeline)} 句')

if __name__ == '__main__':
    try: main()
    except (RuntimeError, subprocess.CalledProcessError, OSError, ValueError) as exc: raise SystemExit(f'生成失败：{exc}')
