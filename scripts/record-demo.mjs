import { chromium } from '@playwright/test';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
// Run against an existing local dev server: npm run dev, then npm run demo.
const baseURL = process.env.DEMO_URL || 'http://127.0.0.1:5173';
const output = path.resolve('docs');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  recordVideo: { dir: path.join(output, 'recordings'), size: { width: 1440, height: 1000 } },
});
const page = await context.newPage();
const recordingStartedAt = Date.now();
let mobileStartSeconds = 0;
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const video = page.video();
const hold = (ms) => page.waitForTimeout(ms);
async function caption(text) {
  await page.evaluate((text) => {
    let el = document.getElementById('demo-caption');
    if (!el) {
      el = document.createElement('div');
      el.id = 'demo-caption';
      Object.assign(el.style, {
        position: 'fixed',
        bottom: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        borderRadius: '40px',
        background: '#214b39ed',
        color: '#fff9e9',
        zIndex: '9999',
        font: '15px Microsoft YaHei, sans-serif',
        boxShadow: '0 5px 25px #0002',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      });
      document.body.append(el);
    }
    el.textContent = text;
  }, text);
}
const click = async (name) =>
  page.getByRole('main').getByRole('button', { name, exact: true }).click();
const next = () => click('下一页');
try {
  await page.goto(baseURL);
  await hold(2500);
  await page.screenshot({ path: path.join(output, 'home-desktop.png'), fullPage: true });
  await caption('星梦故事屋 · 把名字写进童话，让孩子成为冒险的主角');
  await hold(4500);
  await page.getByLabel('主角名字').fill('小月');
  await page.getByLabel('孩子年龄').selectOption('7');
  await page.getByLabel('兴趣小宇宙').fill('恐龙、绘画');
  await page.getByLabel('主角名字').scrollIntoViewIfNeeded();
  await caption('姓名、年龄、兴趣，都将影响你的专属故事');
  await hold(4500);
  await page.getByRole('button', { name: /THE ENCHANTED FOREST/ }).click();
  await click('开启我的专属故事');
  await hold(1500);
  await caption('第一站 · 奇幻森林：原创插画、分页阅读和自动保存');
  await hold(4000);
  await page.screenshot({ path: path.join(output, 'reader-desktop.png'), fullPage: true });
  const voice = page.getByRole('button', { name: '朗读这一页', exact: true });
  if (await voice.count()) {
    await voice.click();
    await hold(1500);
    const pause = page.getByRole('button', { name: '暂停朗读', exact: true });
    if (await pause.count()) await pause.click();
    await hold(1000);
    const stop = page.getByRole('button', { name: '停止朗读', exact: true });
    if (await stop.isEnabled()) await stop.click();
  }
  await next();
  await caption('第一次选择 · 两条路线，解锁不同线索');
  await hold(4000);
  await page.getByRole('button', { name: /沿着发光的小溪前进/ }).click();
  await hold(1500);
  await next();
  await hold(4000);
  await next();
  await caption('第二次选择 · 你的办法将改变故事结局');
  await hold(3500);
  await page.getByRole('button', { name: /邀请每个朋友一起合奏/ }).click();
  await page.screenshot({ path: path.join(output, 'choice-desktop.png'), fullPage: true });
  await hold(1500);
  await next();
  await hold(3500);
  await next();
  await caption('完成冒险 · 收获属于小月的「森林守护者」成就');
  await hold(5000);
  await page.screenshot({ path: path.join(output, 'achievement-desktop.png'), fullPage: true });
  await click('开启新故事');
  await page.getByRole('button', { name: /A LITTLE COSMIC ADVENTURE/ }).click();
  await click('开启我的专属故事');
  await hold(1000);
  await caption('第二站 · 星际探险：喜欢恐龙，就遇见机器人恐龙阿咚');
  await hold(5500);
  await page.screenshot({ path: path.join(output, 'space-desktop.png'), fullPage: true });
  await click('修改资料 / 切换主题');
  await page.getByRole('button', { name: /SECRETS OF THE BLUE/ }).click();
  await click('开启我的专属故事');
  await hold(1000);
  await caption('第三站 · 海底寻宝：与小海龟一起守护蔚蓝');
  await hold(5000);
  await page.screenshot({ path: path.join(output, 'ocean-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: /我的故事架/ }).click();
  await caption('我的故事架 · 自动收藏最近 12 个故事，保留选择和阅读进度');
  await hold(4500);
  await page.screenshot({ path: path.join(output, 'library-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: /小月的奇幻森林冒险/ }).click();
  await hold(1500);
  await page.reload();
  await hold(1200);
  await caption('刷新后继续阅读 · 历史与成就都还在');
  await hold(3500);
  await click('开启新故事');
  mobileStartSeconds = (Date.now() - recordingStartedAt) / 1000;
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => document.getElementById('demo-caption')?.remove());
  await hold(2000);
  await page.screenshot({ path: path.join(output, 'home-mobile.png'), fullPage: true });
  await page.getByLabel('主角名字').scrollIntoViewIfNeeded();
  await hold(3000);
  await page.getByRole('button', { name: /THE ENCHANTED FOREST/ }).scrollIntoViewIfNeeded();
  await hold(3000);
  await click('开启我的专属故事');
  await hold(3000);
  await page.screenshot({ path: path.join(output, 'reader-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: '下一页', exact: true }).scrollIntoViewIfNeeded();
  await hold(3000);
  await context.close();
  const original = await video.path();
  const webm = path.join(output, 'demo.webm');
  await rename(original, webm);
  const probe = spawnSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      webm,
    ],
    { encoding: 'utf8' },
  );
  const duration = Number(probe.stdout?.trim());
  // 保留全部操作；机器负载导致长等待时，把成片调整到 110 秒。
  const timing = duration > 120 ? `,setpts=${110 / duration}*PTS` : '';
  const videoFilter = `[0:v]split[desktop][source];[source]crop=374:812:0:0,scale=-2:920,pad=1440:1000:(ow-iw)/2:(oh-ih)/2:color=0xfaf8f1[phone];[desktop][phone]overlay=enable='gte(t,${mobileStartSeconds})'${timing}[out]`;
  const conversion = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      webm,
      '-filter_complex',
      videoFilter,
      '-map',
      '[out]',
      '-r',
      '25',
      '-c:v',
      'libx264',
      '-threads',
      '2',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      path.join(output, 'demo.mp4'),
    ],
    { encoding: 'utf8' },
  );
  const report = {
    recordedAt: new Date().toISOString(),
    baseURL,
    pageErrors: errors,
    mp4: conversion.status === 0,
    webm: 'docs/demo.webm',
    originalDurationSeconds: duration || null,
    mp4TargetSeconds: duration > 120 ? 110 : duration || null,
    mobileStartSeconds,
    note: '真实浏览器操作录像；包含说明字幕。系统语音是否发声取决于浏览器及本机语音服务，录像不录系统音频。',
  };
  await writeFile(path.join(output, 'demo-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
