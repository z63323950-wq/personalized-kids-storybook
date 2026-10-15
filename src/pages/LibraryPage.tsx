import { ArrowLeft, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import type { Story } from '../types';
import { getTheme } from '../data/themes';
import { Illustration } from '../components/Illustration';
export function LibraryPage({
  stories,
  onOpen,
  onHome,
}: {
  stories: Story[];
  onOpen: (s: Story) => void;
  onHome: () => void;
}) {
  return (
    <main className="library-page">
      <button className="text-button" onClick={onHome}>
        <ArrowLeft size={17} /> 返回故事创作
      </button>
      <div className="library-heading">
        <span className="section-kicker">YOUR LITTLE BOOKSHELF</span>
        <h1>把每一次奇遇，轻轻收藏。</h1>
        <p>最近的 12 个故事会自动留在这台设备上，随时回来，继续你的冒险。</p>
      </div>
      {!stories.length ? (
        <div className="empty-state">
          <BookOpen size={44} />
          <h2>故事架在等第一束星光</h2>
          <p>写下名字，创造一本属于你的故事吧。</p>
          <button className="primary" onClick={onHome}>
            <Sparkles size={18} /> 创作第一个故事
          </button>
        </div>
      ) : (
        <div className="library-grid">
          {stories.map((story) => {
            const theme = getTheme(story.profile.theme);
            return (
              <button
                className={`saved-story ${theme.id}`}
                key={story.id}
                onClick={() => onOpen(story)}
              >
                <Illustration theme={theme.id} />
                <div>
                  <span className="theme-english">
                    {theme.name} · {story.page === 5 ? '已获得成就' : `读到第 ${story.page + 1} 页`}
                  </span>
                  <h2>
                    {story.profile.name}的{theme.name}冒险
                  </h2>
                  <p>
                    {story.profile.interests} · {story.profile.age} 岁
                  </p>
                  <footer>
                    <time>{new Date(story.createdAt).toLocaleDateString('zh-CN')}</time>
                    <span>
                      继续阅读 <ArrowRight size={15} />
                    </span>
                  </footer>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}
