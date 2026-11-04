# 第 6 周：星梦故事素材图书馆

输入故事创意，系统检索故事模板、图片和声音素材，提供结构化创作建议。检索在本机运行，无需 API Key；安装依赖可能需要网络。

## 启动

需要 Python 3.10+。在 PowerShell 中运行：

```powershell
cd 'E:\AIGC作业\personalized-kids-storybook\week6_asset_search'
python -m pip install -r requirements.txt
python app.py
```

打开 `http://127.0.0.1:5179/`，输入想法或点击预设创意。关闭终端会停止服务。如端口占用，使用 `python app.py --port 5180` 并打开对应地址。图片与提示音可在页面查看、播放。

## 素材和检索方法

`assets/manifest.json` 保存 12 个故事模板、20 张图片、5 个声音素材的文本描述及路径。20 张图片中 **4 张是第 3 周实际生成的绘本插画，16 张是程序绘制的主题素材卡**，并非 20 幅不同的绘本插画。5 种声音为本地程序合成的短提示音，不是现场录音。

`search.py` 使用中文字符 1～3 gram 的 TF-IDF 稀疏向量与余弦相似度，配合少量手写同义词扩展，按类型返回相似度大于零的前三个素材。分数是词面向量相似度，**不是正确概率**；未知词或表述差异较大时可能无结果或出现弱相关结果。故事建议来自匹配的素材描述，不是大模型生成。

**课程差异：本版没有 CLIP 图像特征检索，也没有跨模态图像编码或语义向量模型。**图片与音频均按人工维护的文字描述进行文本向量匹配。若老师严格要求 CLIP，仍需安装并配置模型、编码实际图片、补做图文检索及评估。字符向量检索不等同于基于语义嵌入的 RAG。

## 构建与测试

素材已包含在项目中。重新生成素材会覆盖 `assets/` 下同名文件，并需要相邻目录 `../week3_picturebook/images/` 四幅插画及 Windows 微软雅黑字体：

```powershell
python build_assets.py
python -m unittest discover -s tests -v
```

单元测试覆盖三个主题查询、类型过滤、排序、空输入与无匹配。浏览器验证需要在父项目安装 Node 依赖并安装 Edge，先启动 `python app.py`，然后在另一个终端运行 `node verify.mjs`。已在 1440px 和 375px 执行页面搜索、资源加载与宽度检查。结果详情见 `docs/evaluation.md`。

`build_assets.py` 可重建清单、素材卡和合成声音；模板及人工描述在脚本的 `DATA` 中维护，原始森林图来自第 3 周项目。更新素材后重启服务以重建向量索引。
