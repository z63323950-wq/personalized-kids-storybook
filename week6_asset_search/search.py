"""Chinese character n-gram TF-IDF vector search across curated metadata."""
import json
from pathlib import Path
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

ROOT=Path(__file__).resolve().parent
ALIASES={'宇宙':'太空 星际 星球 飞船','太空':'宇宙 星际 星球 飞船','星际':'宇宙 太空 星球 飞船','探险':'探索 冒险','寻宝':'宝藏 寻找','环保':'保护 环境 垃圾 珊瑚','海底':'海洋 海湾','保护环境':'环保 海洋 垃圾 珊瑚','森林':'树林 树 狐狸 精灵','画画':'绘画 艺术 色彩'}
def expand(query):
    return query+' '+' '.join(value for key,value in ALIASES.items() if key in query)
class AssetSearch:
    def __init__(self, manifest=ROOT/'assets/manifest.json'):
        self.records=json.loads(manifest.read_text(encoding='utf-8'))
        if not isinstance(self.records,list) or not self.records: raise ValueError('素材清单为空')
        self.model=TfidfVectorizer(analyzer='char',ngram_range=(1,3),sublinear_tf=True,preprocessor=lambda text: ''.join(text.lower().split()))
        self.vectors=self.model.fit_transform([r['title']+' '+r['text'] for r in self.records])
    def search(self,query,kind='all',limit=5):
        query=query.strip()
        if not 1<=len(query)<=200: raise ValueError('请输入 1～200 字的故事创意')
        if kind not in ('all','template','image','sound'): raise ValueError('未知素材类型')
        if type(limit) is not int or not 1<=limit<=20: raise ValueError('结果数须在 1～20 之间')
        scores=cosine_similarity(self.model.transform([expand(query)]),self.vectors).ravel()
        found=[{**r,'score':round(float(scores[i]),4)} for i,r in enumerate(self.records) if (kind=='all' or r['type']==kind) and scores[i]>0]
        return sorted(found,key=lambda r:(-r['score'],r['id']))[:limit]
    def recommend(self,query):
        return {kind:self.search(query,kind,3) for kind in ('template','image','sound')}
    def suggestions(self,query):
        selected=self.recommend(query)
        top=selected['template'][0] if selected['template'] else None
        return {'idea':query.strip(),'suggested_theme':top['theme'] if top else None,'story_template':top['title'] if top else None,'scene':top['description'] if top else None,'image_assets':[r['title'] for r in selected['image']],'sound_assets':[r['title'] for r in selected['sound']],'note':'文本向量基于素材描述；图片未使用 CLIP 图像特征。'}
