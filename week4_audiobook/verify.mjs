import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { readFile, mkdir } from 'node:fs/promises';
const data=JSON.parse(await readFile('output/timeline.json','utf8'));
if(data.duration<180 || data.segments.length!==31) throw new Error('时长或台词数量异常');
for(let i=0;i<data.segments.length;i++){
  const s=data.segments[i];
  if(!(s.start<s.end && (i===0 || s.start>=data.segments[i-1].end))) throw new Error(`时间轴异常：${i}`);
}
await mkdir('docs',{recursive:true});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge'});
try{
  for(const width of [1440,375]){
    const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve('output/index.html')).href);
    await page.waitForFunction(()=>document.querySelector('audio').readyState>=1);
    const state=await page.evaluate(()=>({width:document.documentElement.scrollWidth,scenes:document.querySelectorAll('.scene').length,lines:document.querySelectorAll('.line').length,broken:Array.from(document.images).filter(x=>!x.complete||!x.naturalWidth).length,duration:document.querySelector('audio').duration}));
    if(state.width>width||state.scenes!==4||state.lines!==31||state.broken||Math.abs(state.duration-data.duration)>0.2)throw new Error(JSON.stringify(state));
    await page.evaluate(t=>{const audio=document.querySelector('audio');audio.currentTime=t;audio.dispatchEvent(new Event('timeupdate'));},data.segments[10].start+0.1);
    if(await page.locator('.line.active').getAttribute('data-index')!=='10')throw new Error('seek 同步高亮失败');
    await page.locator('.line').nth(20).click();
    const time=await page.locator('audio').evaluate(a=>a.currentTime);
    if(Math.abs(time-data.segments[20].start)>2)throw new Error('点击台词跳转失败');
    await page.locator('audio').evaluate(a=>{a.pause();a.currentTime=0});
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:`docs/preview-${width}.png`,fullPage:true});
    if(errors.length)throw new Error(errors.join('; '));
    console.log(JSON.stringify({viewport:width,...state,seek:'ok',click:'ok',errors}));
    await page.close();
  }
} finally {await browser.close()}
