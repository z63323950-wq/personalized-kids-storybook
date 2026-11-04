# 第 3 周：小月的奇幻森林绘本

以第 2 周的离线结构化 JSON 故事为输入，配上四个场景的 AI 绘本插画，并用 Python 排版成无需联网即可阅读的网页。

## 打开与重新生成网页

直接双击 `storybook/index.html`；或在 PowerShell 中运行：

```powershell
cd 'E:\AIGC作业\personalized-kids-storybook\week3_picturebook'
python build_book.py
```

可使用网页右上角“打印 / 保存 PDF”，在浏览器打印窗口选择“另存为 PDF”。排版脚本需要 Python 3.10 及以上，仅使用标准库。它读取 `../week2_story_generator/docs/samples/forest.json` 和 `images/scene-01.png` 至 `scene-04.png`，输出 `storybook/`。图片缺失或故事结构不完整时会提示错误。脚本会更新输出目录中的同名绘本和插图；如已手动修改成品，请先另存。

指定其他故事：

```powershell
python build_book.py --story 路径\story.json --images 路径\images --output 路径\book
```

插图数量须与故事场景数量一致，并依次命名 `scene-01.png`、`scene-02.png` 等。本脚本负责排版，不会自行生成插图。

## 与课程要求的差异

- 插画使用 Codex 的内置图像生成功能，结合首张场景图作为角色参考；没有配置、编写或调用文生图 API，图片生成代码与 API 调用环节因此尚未完成。
- 第 2 周故事使用固定模板生成，并非来自大模型 API。网页排版代码、四张实际插画、角色一致性说明和 AI 协作记录均已保留。
- 本绘本为一个完成案例，不是支持任意角色自动生成配图的完整自动化系统。是否接受无需 API 的方案，需由老师决定。

## 文件

- `images/`：原始插画，每个场景一张。
- `storybook/index.html`：完整网页绘本；`storybook/images/` 是排版输出所需副本。
- `build_book.py`：结构化 JSON 与插画的排版脚本。
- `docs/consistency.md`：角色一致性方法、逐场景说明、提示词和效果评价。
- `ai_log.md`：如实记录 AI 协作的草稿，个人审阅与反思由本人补充。
- `verify.mjs`：可选的浏览器检查脚本，需在父项目运行 `npm install` 并安装 Microsoft Edge；在本目录执行 `node verify.mjs`。已实际检查 1440px 和 375px：4 个场景均显示、图片加载正常、无横向溢出或页面脚本错误，截图在 `docs/preview-1440.png` 与 `docs/preview-375.png`。
