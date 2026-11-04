"""Build a small reproducible local asset library, without downloading assets."""
import json, math, struct, wave, shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parent
DATA=[
('森林风铃','森林 小狐狸 精灵 友谊 勇气 风铃 树 藤蔓','寻找森林里沉默的风铃树并与狐狸朋友合作。','forest'),
('蘑菇小屋','森林 蘑菇 迷路 寻路 分享 动物','帮助迷路的小獾找到蘑菇小屋。','forest'),
('森林雨伞','森林 雨天 动物 伞 团队 关怀','为雨中的小动物搭一把大叶伞。','forest'),
('萤火虫之夜','森林 夜晚 萤火虫 光 帮助','帮助萤火虫点亮通往家的路。','forest'),
('小溪的歌','森林 小溪 水 音乐 合作 自然','找回小溪流淌的声音。','forest'),
('星际灯塔','太空 宇宙 星际 机器人 飞船 星球 探险 灯塔 团队','与机器人点亮未知星球的灯塔。','space'),
('月球邮局','太空 月亮 邮递 飞船 机器人 寻找','把丢失的信送到月球邮局。','space'),
('恐龙星球','太空 宇宙 恐龙 机器人 星球 探索','和机器人恐龙探索陌生星球。','space'),
('海洋花园','海底 海洋 海龟 珊瑚 环保 垃圾 保护','和小海龟清理海湾，种下珊瑚。','ocean'),
('贝壳宝藏','海底 海洋 珍珠 贝壳 海马 寻宝 友谊','与海马寻找帮助珊瑚生长的宝物。','ocean'),
('鲸鱼音乐会','海洋 鲸鱼 音乐 保护 动物 友谊','帮助小鲸鱼举办海底音乐会。','ocean'),
('机器人画室','机器人 绘画 艺术 色彩 创造 想象','与机器人一起创作彩虹画。','space'),
]
def main():
    assets=ROOT/'assets';images=assets/'images';sounds=assets/'sounds';images.mkdir(parents=True,exist_ok=True);sounds.mkdir(parents=True,exist_ok=True)
    records=[]
    for i,(title,tags,description,theme) in enumerate(DATA,1):
        records.append({'id':f't{i:02}','type':'template','title':title,'text':f'{tags} {description}','description':description,'theme':theme})
    original=ROOT.parent/'week3_picturebook/images'
    for i in range(1,5):
        target=images/f'forest-original-{i:02}.png';shutil.copy2(original/f'scene-{i:02}.png',target)
        desc=['相遇出发 小月 小狐狸 森林 风铃树','寻找线索 小月 小狐狸 观察 藤蔓 风铃','合作行动 小月 小狐狸 解开 藤蔓','庆祝 小月 小狐狸 森林 风铃'][i-1]
        records.append({'id':f'i{i:02}','type':'image','title':f'森林绘本原始插画 {i}','text':desc,'description':desc,'theme':'forest','path':f'assets/images/{target.name}','origin':'第3周AI生成插画'})
    fontpath='C:/Windows/Fonts/msyh.ttc'; font=ImageFont.truetype(fontpath,25)
    for n in range(16):
        title,tags,desc,theme=DATA[n%len(DATA)]; palette={'forest':('#dbeed3','#33674e'),'space':('#deddf1','#565686'),'ocean':('#d6eeee','#287786')}[theme]
        im=Image.new('RGB',(640,400),palette[0]);d=ImageDraw.Draw(im);d.ellipse((390,25,590,225),fill='#f8e9b5');d.polygon([(0,300),(125,185),(245,300),(375,165),(640,315),(640,400),(0,400)],fill=palette[1]);d.rounded_rectangle((30,30,375,117),radius=15,fill='#fffdf1');d.text((48,46),title,font=font,fill='#294238');d.text((48,78),f'场景素材卡 {n+1:02}',font=font,fill='#51664d')
        filename=f'card-{n+1:02}.png';im.save(images/filename)
        records.append({'id':f'i{n+5:02}','type':'image','title':f'{title}场景卡 {n+1:02}','text':tags+' '+desc,'description':desc,'theme':theme,'path':f'assets/images/{filename}','origin':'程序绘制的主题素材卡，非独立生成的绘本插画'})
    for n,(title,freq,tags) in enumerate([('风铃',880,'森林 风铃 树 清脆'),('溪水',320,'森林 小溪 水 柔和'),('星际信号',660,'太空 宇宙 飞船 机器人'),('海洋气泡',220,'海洋 海底 气泡 海龟'),('庆祝铃声',550,'友谊 庆祝 成功 快乐')],1):
        path=sounds/f'sound-{n:02}.wav';rate=22050
        with wave.open(str(path),'wb') as w:
            w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate)
            buf=bytearray()
            for i in range(rate*2):
                t=i/rate;env=(min(1,t*8)*max(0,1-t/2));val=int(4500*env*(math.sin(2*math.pi*freq*t)+0.3*math.sin(2*math.pi*freq*1.5*t)))
                buf.extend(struct.pack('<h',max(-32768,min(32767,val))))
            w.writeframes(buf)
        records.append({'id':f's{n:02}','type':'sound','title':title,'text':tags,'description':f'程序合成的{title}提示音','theme':'space' if n==3 else 'ocean' if n==4 else 'forest','path':f'assets/sounds/{path.name}','origin':'程序合成音色，仅作情境提示，不是现场录音'})
    (assets/'manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'素材生成完成：{len(DATA)} 个模板，20 张图片（4 张绘本 + 16 张素材卡），5 种合成提示音')
if __name__=='__main__': main()
