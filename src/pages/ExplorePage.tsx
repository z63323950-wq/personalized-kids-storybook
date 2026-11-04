import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Headphones, Film, Search, Sparkles, ArrowUpRight } from 'lucide-react';
import manifest from '../data/assetManifest.json';
import './explore.css';

const base = import.meta.env.BASE_URL;
const entries = [
  {title:'森林绘本',subtitle:'PICTURE BOOK',description:'翻开小月和小狐狸的四幕森林冒险。',icon:BookOpen,url:'experiences/picturebook/index.html',color:'green'},
  {title:'有声故事',subtitle:'LISTEN TO A STORY',description:'边听边读，点击文字可以跳到想听的地方。',icon:Headphones,url:'experiences/audiobook/index.html',color:'gold'},
  {title:'故事小影院',subtitle:'STORY TIME',description:'跟着插画、配音和音乐，重温风铃树的故事。',icon:Film,url:'experiences/video/story-video.mp4',color:'lavender'},
];
type Asset = {id:string; type:string; title:string; text:string; description:string; theme:string; path?:string; origin?:string};
function scoreAsset(item:Asset, query:string):number {
  const aliases:Record<string,string>={'宇宙':'太空星际星球飞船','太空':'宇宙星际星球飞船','星际':'太空宇宙星球','探险':'探索冒险','海底':'海洋海湾','环保':'保护环境垃圾珊瑚','画画':'绘画艺术色彩'};
  let expanded=query.trim().toLowerCase();for(const [key,value] of Object.entries(aliases))if(query.includes(key))expanded+=value;
  const chunks=Array.from(new Set([...expanded].filter(c=>!/[\s，。！？、,.!?]/.test(c))));const hay=(item.title+item.text).toLowerCase();
  return chunks.reduce((n,c)=>n+(hay.includes(c)?1:0),0)/(chunks.length||1);
}
export function ExplorePage({onHome}:{onHome:()=>void}){
  const [query,setQuery]=useState('');const [submitted,setSubmitted]=useState('');
  const results=useMemo(()=>{if(!submitted.trim())return [];return (manifest as Asset[]).map(item=>({...item,score:scoreAsset(item,submitted)})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));},[submitted]);
  return <main className="explore-page"><button className="text-button" onClick={onHome}><ArrowLeft size={16}/> 返回故事创作</button><div className="explore-hero"><span className="section-kicker">A WORLD OF LITTLE WONDERS</span><h1>把所有的奇遇，<br/><em>放进同一座故事乐园。</em></h1><p>读绘本、听故事、看动画，或用一个小小的想法寻找创作灵感。</p></div><div className="experience-grid">{entries.map(({title,subtitle,description,icon:Icon,url,color})=><a className={`experience-card ${color}`} key={title} href={base+url} target="_blank" rel="noreferrer"><span className="experience-icon"><Icon size={25}/></span><span className="experience-english">{subtitle}</span><h2>{title}<ArrowUpRight size={19}/></h2><p>{description}</p><span className="experience-action">打开体验 →</span></a>)}</div><section className="search-section"><div className="section-heading"><div><span className="section-kicker">THE INSPIRATION LIBRARY</span><h2>从一个想法，找到故事的线索</h2></div></div><p className="explore-description">搜索故事模板、画面与声音，试试“机器人恐龙探索太空”或“保护海洋珊瑚”。</p><form className="explore-search" onSubmit={e=>{e.preventDefault();setSubmitted(query.trim())}}><label className="sr-only" htmlFor="asset-query">故事创意</label><input id="asset-query" maxLength={200} value={query} onChange={e=>setQuery(e.target.value)} placeholder="输入你的故事创意…"/><button className="primary" type="submit"><Search size={17}/> 寻找灵感</button></form><div className="search-chips">{['森林风铃','机器人恐龙太空探险','保护海洋珊瑚'].map(x=><button type="button" key={x} onClick={()=>{setQuery(x);setSubmitted(x)}}>{x}</button>)}</div>{submitted&&<div aria-live="polite"><p className="search-hint">{results.length?`为“${submitted}”找到 ${results.length} 条灵感。`:'暂时没有找到，试试其他关键词。'}</p>{['template','image','sound'].map(kind=>{const items=results.filter(item=>item.type===kind).slice(0,3);return <div key={kind}><h3 className="result-heading">{{template:'故事模板',image:'画面素材',sound:'声音素材'}[kind]}</h3><div className="result-grid">{items.length?items.map(item=><article className="asset-card" key={item.id}>{kind==='image'&&item.path&&<img src={base+'experiences/library/'+item.path.replace('assets/','')} alt={item.title}/>}<div><h4>{item.title}</h4><p>{item.description}</p>{item.origin&&kind==='image'&&<small>{item.origin}</small>}{kind==='sound'&&item.path&&<audio controls preload="none" src={base+'experiences/library/'+item.path.replace('assets/','')}/>}</div></article>):<p className="search-hint">没有匹配的素材。</p>}</div></div>})}</div>}<p className="search-hint">根据素材文字描述和关键词匹配；图片未使用图像识别。</p></section><section className="explore-create"><Sparkles size={30}/><div><h2>想让自己成为故事主角？</h2><p>选择名字、年龄和兴趣，亲手决定故事的方向。</p></div><button className="primary" onClick={onHome}>开始创作 →</button></section></main>
}
