import { expect, test } from '@playwright/test';
import { themes } from '../src/data/themes';
test('默认欢迎页、错误提示、空历史与资料恢复', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /我的故事架/ }).click();
  await expect(page.getByText('故事架在等第一束星光')).toBeVisible();
  await page.getByRole('button', { name: '创作第一个故事' }).click();
  await page.getByLabel('主角名字').fill('');
  await page.getByRole('button', { name: '开启我的专属故事' }).click();
  await expect(page.getByText('请输入 1～16 个字的主角名字')).toBeVisible();
  await page.getByLabel('主角名字').fill('桃桃');
  await page.getByLabel('孩子年龄').selectOption('9');
  await page.getByLabel('兴趣小宇宙').fill('天文');
  await page.reload();
  await expect(page.getByLabel('主角名字')).toHaveValue('桃桃');
  await expect(page.getByLabel('孩子年龄')).toHaveValue('9');
  await expect(page.getByLabel('兴趣小宇宙')).toHaveValue('天文');
});
for (const theme of themes)
  test(`${theme.name}完整阅读、回退更改分支、刷新和历史`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.getByLabel('主角名字').fill('小月');
    await page.getByLabel('兴趣小宇宙').fill('恐龙');
    await page.getByRole('button', { name: new RegExp(theme.english) }).click();
    await page.getByRole('button', { name: '开启我的专属故事' }).click();
    await expect(page.getByRole('heading', { name: `小月的${theme.name}冒险` })).toBeVisible();
    await expect(page.getByRole('button', { name: '上一页', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: '下一页', exact: true }).click();
    await expect(page.getByRole('button', { name: '下一页', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: new RegExp(theme.routes[0]) }).click();
    await page.getByRole('button', { name: '下一页', exact: true }).click();
    await expect(page.getByText(theme.routeResults[0], { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '上一页', exact: true }).click();
    await page.getByRole('button', { name: new RegExp(theme.routes[1]) }).click();
    await page.getByRole('button', { name: '下一页', exact: true }).click();
    await expect(page.getByText(theme.routeResults[1], { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText(theme.routeResults[1], { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '下一页', exact: true }).click();
    await expect(page.getByRole('button', { name: '下一页', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: new RegExp(theme.solutions[1]) }).click();
    await page.getByRole('button', { name: '下一页', exact: true }).click();
    await expect(page.getByText(theme.endings[1], { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '下一页', exact: true }).click();
    await expect(page.getByRole('heading', { name: theme.badge, exact: true })).toBeVisible();
    await page.getByRole('button', { name: /去我的故事架/ }).click();
    await page.getByRole('button', { name: new RegExp(`小月的${theme.name}冒险`) }).click();
    await expect(page.getByRole('heading', { name: theme.badge, exact: true })).toBeVisible();
    await page.getByRole('button', { name: '重新冒险，试试另一种选择' }).click();
    await page.getByRole('button', { name: '下一页', exact: true }).click();
    await expect(page.getByRole('button', { name: '下一页', exact: true })).toBeDisabled();
    expect(errors).toEqual([]);
  });
test('375px 手机无横向溢出，语音 API 不存在时仍可阅读', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
  });
  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(375);
  await page.getByRole('button', { name: '开启我的专属故事' }).click();
  await expect(page.getByText('当前浏览器不支持语音，文字故事一样精彩。')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(375);
});
test('语音播放、暂停、继续、停止与翻页取消', async ({ page }) => {
  await page.addInitScript(() => {
    const calls: string[] = [];
    (window as unknown as { speechCalls: string[] }).speechCalls = calls;
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () => [],
        speak: () => calls.push('speak'),
        pause: () => calls.push('pause'),
        resume: () => calls.push('resume'),
        cancel: () => calls.push('cancel'),
      },
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: class {
        lang = '';
        rate = 1;
      },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: '开启我的专属故事' }).click();
  await page.getByRole('button', { name: '朗读这一页' }).click();
  await page.getByRole('button', { name: '暂停朗读' }).click();
  await page.getByRole('button', { name: '继续朗读' }).click();
  await page.getByRole('button', { name: '停止朗读' }).click();
  await expect(page.getByRole('button', { name: '停止朗读' })).toBeDisabled();
  const calls = await page.evaluate(
    () => (window as unknown as { speechCalls: string[] }).speechCalls,
  );
  expect(calls).toEqual(expect.arrayContaining(['speak', 'pause', 'resume', 'cancel']));
  await page.getByRole('button', { name: '朗读这一页' }).click();
  await page.getByRole('button', { name: '下一页', exact: true }).click();
  await expect(page.getByRole('button', { name: '朗读这一页' })).toBeVisible();
  expect(
    await page.evaluate(() => (window as unknown as { speechCalls: string[] }).speechCalls.at(-1)),
  ).toBe('cancel');
});
test('存储损坏与禁用时显示提示，应用仍可使用', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('starry-storyland:v1', 'broken'));
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('无法读取');
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('disabled');
    };
  });
  await page.getByRole('button', { name: '开启我的专属故事' }).click();
  await expect(page.getByRole('status')).toContainText('无法保存');
  await expect(page.getByText('当前进度仅在本次会话中保留')).toBeVisible();
  await expect(page.getByRole('button', { name: '下一页', exact: true })).toBeEnabled();
});
