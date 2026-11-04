# 第 2 周探索：离线结构化儿童故事生成器

根据主角名字、年龄、场景、主题、长度、受众年龄，使用本地固定模板生成结构化 JSON。支持奇幻森林、星际探险、海底寻宝；包含角色设定、四个场景、情绪、视觉提示词和寓意。无需联网、API Key 或付费服务。

**课程要求差异：**按用户选择，本版本不调用大模型 API，因此不满足课程“Python 直接调用大模型 API”的要求；也没有真实的三种 Prompt 策略生成质量实验。它是可运行的节省费用方案，是否能替代正式作业请向老师确认。参见 `docs/prompt-comparison.md`。

## 环境和运行

Python 3.10+；只用标准库，不需要安装依赖。在 PowerShell 中运行：

```powershell
cd 'E:\AIGC作业\personalized-kids-storybook\week2_story_generator'
python storygen.py --name 小月 --age 7 --setting 水晶山谷 --theme space --length 中 --audience 7 --output outputs/my-story.json
```

主题代码为 `forest`、`space`、`ocean`；长度为 `短`、`中`、`长`；两个年龄都为 3～12。输出文件已存在时程序会拒绝覆盖，改用不同文件名即可。固定模板的长度选择只调整部分内容，不保证精确字数。

```powershell
python -m unittest discover -s tests -v
python storygen.py --help
```

三个主题的实际离线样例位于 `docs/samples/`。生成 JSON 的 `visual_prompt` 为文字，不是已生成的图片。相同输入产生相同输出；请人工检查内容及适龄性。`ai_log.md` 是协作记录草稿，个人审阅和反思应由本人如实补充。

`storygen.py` 含本地主题素材、生成逻辑、结构校验及命令行接口；`tests/` 测试主题、个性化、无效输入、结构缺失与防止覆盖。故事 JSON 字段为 `title`、`characters`、`scenes`、`moral`，与课程指定结构一致。
