# 第 4 周：小月与风铃树的歌

根据第 2 周森林故事扩写的离线多角色有声书：保留寻找风铃树歌声、发现藤蔓、伙伴合作和温柔结局的主线，增加森林精灵露露及其对话。现成成品无需 API、网络或额外安装：

- [`output/story.mp3`](output/story.mp3)：约 7 分 13.69 秒，31 段台词。
- [`output/index.html`](output/index.html)：本地同步阅读页面，双击打开；支持播放控制、逐句高亮与点击台词跳转。必须保留 `output/` 中的音频及 `images/`。
- [`story.json`](story.json)：故事文本、角色与情绪标签。
- [`docs/voice-mapping.md`](docs/voice-mapping.md)：音色与语速映射、限制和检验结果。

## 重新合成音频（Windows）

需要 Windows 中安装下列四种中文语音、PowerShell 7（`pwsh`）、Python 3.10+ 与 FFmpeg（`ffmpeg` 在 PATH）。无需第三方 Python 包或 API Key。不同电脑上的系统语音可用性可能不同。

```powershell
cd 'E:\AIGC作业\personalized-kids-storybook\week4_audiobook'
python build_audio.py
python build_reader.py
```

为防覆盖，`build_audio.py` 检测到 `output/story.mp3` 或 `output/timeline.json` 已存在会停止；重新合成前请先备份并手动移走旧文件。脚本以 Windows 语音合成逐句输出临时 WAV，在句间加入 0.45 秒静音，使用 FFmpeg 转 MP3，同时根据实际片段时长生成时间轴。`build_reader.py` 会覆盖 `output/index.html` 和 `output/images/` 的同名文件；其图片读取自相邻第 3 周项目。

## 测试与局限

生成时长由 FFprobe 实测为 433.69 秒；程序检查全部 31 段时间戳连续且不重叠。浏览器已在 1440px / 375px 下验证音频加载、四场景、31 行台词、图片、逐句高亮和点击跳转，无横向溢出与页面脚本错误。`node verify.mjs` 可复测，需要先在父项目执行 `npm install` 并安装 Microsoft Edge。

这些是自动化与技术检查，**没有声称已完成人工听感评审**；建议本人从头试听，判断中文发音、音量、语速、角色辨识和情感是否符合课程要求。情绪标签用于选语速，没有调用具备真实情感控制能力的神经网络 TTS；音色为本机系统语音，并非真人。未添加背景音效（课程中为可选项）。需要其他电脑复现时，请先确认相应语音是否可选。第 2 周故事不是大模型 API 生成，请向老师说明。
