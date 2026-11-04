# 第 7 周：离线故事创作图工作流

基于 LangGraph 的交互式原型：输入故事创意，规则选择主题，生成结构化故事；用户可在中途修改名字、场景或主题，然后继续执行四类工具，生成图片、语音和短视频。**不调用大模型或付费 API**。

## 已有两个真实运行案例

| 案例 | 输入 | 中途干预 | 输出 |
|---|---|---|---|
| 森林 | 小狐狸森林风铃；小月，7 岁 | 名字改为小星、场景改为蘑菇山谷 | [`cases/forest/`](cases/forest/) |
| 宇宙 | 和机器人到太空探险；明明，8 岁 | 场景改为水晶星球 | [`cases/space/`](cases/space/) |

每个目录含 `story.json`、4 张 `images/` 图片、`narration.txt`、`narration.mp3`、`story.mp4` 和 `workflow-log.json`。流程日志记录输入、规划、工具步骤和修改；若失败会在新建的输出目录中写入 `error.txt`，不代表完整成功。

## 启动和运行

Windows、Python 3.10+、PowerShell 7（pwsh）、本机中文语音 Microsoft Huihui Desktop、FFmpeg 和 FFprobe、微软雅黑字体。安装依赖需要网络：

```powershell
cd 'E:\AIGC作业\personalized-kids-storybook\week7_story_agent'
python -m pip install -r requirements.txt
python -X utf8 agent.py --idea '小狐狸在森林寻找风铃' --name 小月 --age 7 --out cases/my-story
```

程序显示初稿后依次询问主角名字、场景和主题；留空保留原值，主题使用 `forest` / `space` / `ocean`。修改后会重新生成故事，再往后执行。输出目录必须不存在，以防覆盖。执行 `python -m unittest discover -s tests -v` 运行测试。

依赖相邻的 `week2_story_generator/storygen.py`、`week3_picturebook/images/`、`week6_asset_search/assets/`；不要单独移动此目录。无命中的关键词默认森林；安装依赖本身可能需要网络。默认有系统语音才能生成 MP3。

## 架构

```mermaid
flowchart LR
    A[创意和主角] --> B[规则规划主题]
    B --> C[故事生成工具]
    C --> D[用户审阅并修改]
    D --> E[重新生成故事]
    E --> F[图片素材选择工具]
    F --> G[本地语音工具]
    G --> H[FFmpeg视频工具]
    H --> I[成品和流程日志]
```

四个工具节点分别负责故事、图片素材、语音、视频；节点由 LangGraph 顺序调用。工具函数在图中直接注册为节点，不使用大模型进行函数调用。

## 作业差异和已知限制

- 流程是**规则规划的固定有向图**，不是由大模型自主规划或进行多步推理的 Agent，也没有模型决定工具调用。LangGraph 属于 LangChain 生态的图工作流框架；课程要求是 LangChain 或 LlamaIndex，是否接受 LangGraph 的这种使用方式需教师确认。
- 图像工具复用本地素材，不为新故事生成新图片；森林图是第 3 周固定小月，宇宙、海洋是第 6 周示意素材卡，人物与新名字或具体场景不保证一致。因而不能声称完成课程要求的逐场景 AI 生图。
- 语音为 Windows 单音色朗读，视频场景时长按文本长度估算，非逐句对齐；无背景音乐或字幕。故事文本是本地模板，不理解任意创意，用户干预只支持名字、场景和主题。
- 演示案例是实际运行结果，但尚未完整人工试听和评估。请在提交前审阅。用户的自由文字会显示在故事和日志中，避免输入隐私信息。
