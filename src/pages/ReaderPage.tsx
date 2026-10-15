import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Home,
  Pause,
  Play,
  RotateCcw,
  Square,
  Trophy,
  Volume2,
} from 'lucide-react';
import { getTheme } from '../data/themes';
import { canAdvance, choose, getScenes, TOTAL_PAGES } from '../engine/storyEngine';
import { useSpeech } from '../hooks/useSpeech';
import { Illustration } from '../components/Illustration';
import type { Choice, Story } from '../types';
export function ReaderPage({
  story,
  onChange,
  onHome,
  onLibrary,
  savingFailed = false,
}: {
  story: Story;
  onChange: (s: Story) => void;
  onHome: () => void;
  onLibrary: () => void;
  savingFailed?: boolean;
}) {
  const theme = getTheme(story.profile.theme),
    scenes = getScenes(story),
    scene = scenes[story.page];
  const speech = useSpeech(
    [scene.title, ...scene.paragraphs, scene.question, ...(scene.options ?? [])]
      .filter(Boolean)
      .join('。'),
  );
  const finished = story.page === TOTAL_PAGES - 1;
  const selected = story.page === 1 || story.page === 3 ? story.choices[story.page] : undefined;
  const turnPage = (page: number) => {
    onChange({ ...story, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <main className={`reader-page ${theme.id}`}>
      <div className="reader-top">
        <button className="text-button" onClick={onHome}>
          <ArrowLeft size={17} /> 修改资料 / 切换主题
        </button>
        <span className="saved-label">
          {!savingFailed && <Check size={14} />}
          {savingFailed ? '当前进度仅在本次会话中保留' : '进度已自动保存在本设备'}
        </span>
      </div>
      <div className="reader-heading">
        <div>
          <span className="section-kicker">{theme.english}</span>
          <h1>
            {story.profile.name}的{theme.name}冒险
          </h1>
        </div>
        <span className="reader-age">
          {story.profile.age} 岁的想象力 · {story.profile.interests}
        </span>
      </div>
      <div className="progress-label">
        <span>{finished ? '冒险完成，收获一颗勇敢的心' : '每一页，都离奇迹近一点'}</span>
        <span>
          第 {story.page + 1} / {TOTAL_PAGES} 页
        </span>
      </div>
      <progress aria-label="故事阅读进度" max={TOTAL_PAGES} value={story.page + 1} />
      <article className="storybook" key={story.page}>
        <div className="book-art">
          <Illustration theme={theme.id} hero />
          <div className="book-art-caption">
            <span>CHAPTER {String(story.page + 1).padStart(2, '0')}</span>
            <p>
              {
                [
                  '一封特别的邀请',
                  '跟着好奇心出发',
                  '每个发现都有意义',
                  '你的选择，让故事不同',
                  '小小勇气，大大奇迹',
                  '把星光带回家',
                ][story.page]
              }
            </p>
          </div>
          <div className="book-companion">旅途伙伴 · {theme.friend}</div>
        </div>
        <div className="book-text">
          <span className="chapter-label">
            {finished ? 'THE HAPPY ENDING' : `STORY ${String(story.page + 1).padStart(2, '0')}`}{' '}
            <span>✧</span>
          </span>
          <h2>{scene.title}</h2>
          <div className={`story-paragraphs age-${story.profile.age <= 5 ? 'young' : 'regular'}`}>
            {scene.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {scene.options && (
            <fieldset className="choice-box">
              <legend>{scene.question}</legend>
              {scene.options.map((option, i) => (
                <button
                  key={option}
                  type="button"
                  className={`choice ${selected === i ? 'chosen' : ''}`}
                  aria-pressed={selected === i}
                  onClick={() => onChange(choose(story, story.page as 1 | 3, i as Choice))}
                >
                  <span>{selected === i ? <Check size={16} /> : String.fromCharCode(65 + i)}</span>
                  {option}
                  <ArrowRight size={16} />
                </button>
              ))}
              <small>
                {selected === undefined
                  ? '选择一条路，才能翻开下一页。'
                  : '选择已记录，下一页将因你而不同。'}
              </small>
            </fieldset>
          )}
          {finished && (
            <div className="achievement">
              <div className="medal">
                <Trophy size={30} />
              </div>
              <div>
                <span>专属于 {story.profile.name} 的成就</span>
                <h3>{theme.badge}</h3>
                <p>
                  {story.choices[3] === 0
                    ? '用合作与勇气，点亮新的可能'
                    : '用耐心与智慧，发现温柔的力量'}
                </p>
              </div>
              <span className="award-sparkle">✦</span>
            </div>
          )}
          <div className="speech-controls">
            {speech.supported ? (
              <>
                <button className="text-button" onClick={speech.toggle}>
                  {speech.status === 'speaking' ? (
                    <Pause size={17} />
                  ) : speech.status === 'paused' ? (
                    <Play size={17} />
                  ) : (
                    <Volume2 size={17} />
                  )}{' '}
                  {speech.status === 'speaking'
                    ? '暂停朗读'
                    : speech.status === 'paused'
                      ? '继续朗读'
                      : '朗读这一页'}
                </button>
                <button
                  className="stop-button"
                  onClick={speech.stop}
                  disabled={speech.status === 'idle'}
                  aria-label="停止朗读"
                >
                  <Square size={14} />
                </button>
              </>
            ) : (
              <span className="muted">当前浏览器不支持语音，文字故事一样精彩。</span>
            )}
          </div>
          {speech.error && (
            <p className="error" role="status">
              {speech.error}
            </p>
          )}
        </div>
      </article>
      <div className="reader-navigation">
        <button
          className="secondary"
          disabled={story.page === 0}
          onClick={() => turnPage(story.page - 1)}
        >
          <ArrowLeft size={17} /> 上一页
        </button>
        <span className="page-dots" aria-hidden="true">
          {scenes.map((_, i) => (
            <i key={i} className={i === story.page ? 'current' : ''} />
          ))}
        </span>
        {finished ? (
          <button className="primary" onClick={onHome}>
            <Home size={17} /> 开启新故事
          </button>
        ) : (
          <button
            className="primary"
            disabled={!canAdvance(story)}
            onClick={() => turnPage(story.page + 1)}
          >
            下一页 <ArrowRight size={17} />
          </button>
        )}
      </div>
      {finished && (
        <div className="end-actions">
          <button
            className="text-button"
            onClick={() => onChange({ ...story, page: 0, choices: {} })}
          >
            <RotateCcw size={16} /> 重新冒险，试试另一种选择
          </button>
          <button className="text-button" onClick={onLibrary}>
            <BookOpen size={16} /> 去我的故事架
          </button>
        </div>
      )}
    </main>
  );
}
