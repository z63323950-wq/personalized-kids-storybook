# 发布与提交

## 当前状态

本地项目完整可运行。当前机器未检测到 GitHub 可用授权，因此未创建 GitHub/Gitee 远程仓库。不要把 Sites 源码内部存储地址作为 GitHub 仓库链接提交。

Sites 站点入口：[星梦故事屋](https://starry-storyland-z-20261015.nicemochi13.chatgpt.site)。默认站点为所有者私有，需对应账号登录，不能将私有链接冒充为教师可直接访问的公开链接。是否部署成功请以交付时的实际部署回执和最终回复为准。

## 使用 GitHub CLI 发布

安装 [GitHub CLI](https://cli.github.com/)，然后在项目目录执行。登录是你本人在浏览器中完成的授权步骤。

```powershell
cd 'E:\AIGC作业\personalized-kids-storybook'
gh auth login
gh repo create personalized-kids-storybook --public --source=. --remote=origin --push
gh repo view --web
```

若同名仓库已存在，改用另一个名称，或手动添加已有仓库的真实地址后执行 `git push -u origin main`；不要强制覆盖已有仓库。

## GitHub Pages

1. 打开新仓库的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 选择 **GitHub Actions**。
3. 打开 **Actions → Test and deploy GitHub Pages → Run workflow**。
4. 工作流会安装依赖、运行单元测试和浏览器测试、构建，再上传 `dist`。
5. 成功后从工作流的 `github-pages` 环境或 Pages 页面复制真实部署地址。
6. 将仓库和部署地址补入 README，提交更新。

无 GitHub CLI 时也可在 GitHub 网站新建空仓库，再按其页面提供的命令添加 remote 并 push。视频、截图、源码、锁文件、中文 README 和验收报告已随项目准备。

## 本地演示

```bash
npm install
npm run dev
```

`dist/` 是可托管的静态构建产物。部署到其他静态托管平台时，构建命令使用 `npm run build`，发布目录使用 `dist`。
