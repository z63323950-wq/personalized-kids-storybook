# 第 5 周作业：小月与风铃树的歌 · 故事视频

选用课程允许的**剪辑式路线**，把前几周的四幅森林故事插画、多角色旁白与对话合成为 MP4，并按第 4 周逐句时间轴叠加中文字幕，加入程序合成的轻柔和弦背景音乐。

## 文件

- `output/story-video.mp4`：完整故事视频。
- `output/story-subtitles.srt`：可单独编辑的字幕文件；成片也含烧录字幕。
- `make_video.py`：字幕排版、画面时长、音乐合成、音视频合成脚本。
- `ai_log.md`：协作日志草稿。

## 构建条件与命令

Windows、Python 3.10+、Pillow、FFmpeg 和 FFprobe。Pillow 可通过 `python -m pip install Pillow` 安装；FFmpeg 和 FFprobe 需在 PATH 中。本机已安装微软雅黑字体 `C:\Windows\Fonts\msyh.ttc`。原始素材依赖相邻的 `week3_picturebook/images/` 和 `week4_audiobook/output/story.mp3`、`timeline.json`。

```powershell
cd 'E:\AIGC作业\personalized-kids-storybook\week5_story_video'
python make_video.py
```

为避免覆盖现有成片，若 `output/story-video.mp4` 已存在请先备份并手动移走。程序会更新同目录 SRT。素材不存在或时间轴无效时停止并报错。

## 剪辑流程

1. 读取第 4 周的配音和逐句开始、结束时间，核验顺序及总时长。
2. 根据每句所属场景选择第 3 周对应插画，用 Pillow 将角色、情绪、台词绘制在画面下方。
3. 用 Python 标准库按和弦生成柔和伴奏，不使用第三方音乐素材；FFmpeg 将伴奏以较低音量混入配音，编码 H.264 视频和 AAC 音频。
4. 同时输出 SRT；字幕按第 4 周音频切片时间对齐，句间停顿保留画面上的上一句字幕。

## 实际限制

本视频为静态插画剪辑，非文生视频或逐帧动画；每场景内画面保持静止。语音为离线 Windows 系统合成，情绪主要通过文本及语速控制；尚需本人完整试听检查咬字、音乐与人声的平衡、字幕时机。字幕采用整句时间戳，不是逐字卡拉 OK。原故事是本地模板的扩写，不是大模型 API 生成；AI 插画用内置图像工具生成。第 2 至第 5 周素材之间存在这些课程要求上的差异，应按实际情况说明。
