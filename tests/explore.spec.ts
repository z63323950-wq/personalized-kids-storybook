import { test, expect } from '@playwright/test';
test('统一入口支持检索、素材播放与体验链接', async ({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'故事乐园 ✦'}).click();
  await page.getByRole('button',{name:'机器人恐龙太空探险'}).click();
  await expect(page.getByRole('heading',{name:'恐龙星球',exact:true})).toBeVisible();
  await expect(page.locator('.asset-card img').first()).toBeVisible();
  await expect(page.locator('.asset-card audio').first()).toHaveAttribute('src',/sounds/);
  for(const [name,route] of [['森林绘本','picturebook/index.html'],['有声故事','audiobook/index.html'],['故事小影院','video/story-video.mp4']]){
    const link=page.getByRole('link',{name:new RegExp(name)});const href=await link.getAttribute('href');expect(href).toContain(route);expect((await page.request.get(href!)).ok()).toBeTruthy();
  }
  await page.getByRole('button',{name:'开始创作 →'}).click();await expect(page.getByLabel('主角名字')).toBeVisible();
});
test('手机端入口与搜索无横向溢出',async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('/');await page.getByRole('button',{name:'故事乐园 ✦'}).click();
  await page.getByRole('button',{name:'保护海洋珊瑚'}).click();await expect(page.getByRole('heading',{name:'海洋花园',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
