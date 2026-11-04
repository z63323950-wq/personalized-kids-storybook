import { useState } from 'react';
import { Stars } from 'lucide-react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ReaderPage } from './pages/ReaderPage';
import { LibraryPage } from './pages/LibraryPage';
import { useStoryLibrary } from './hooks/useStoryLibrary';
import { createStory } from './engine/storyEngine';
import type { Profile, Story } from './types';
import { ExplorePage } from './pages/ExplorePage';
export default function App() {
  const library = useStoryLibrary();
  const [page, setPage] = useState<'home' | 'reader' | 'library' | 'explore'>(
    library.active ? 'reader' : 'home',
  );
  const navigate = (next: typeof page) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const home = () => {
    library.goHome();
    navigate('home');
  };
  const open = (story: Story) => {
    library.saveStory(story);
    navigate('reader');
  };
  async function generate(profile: Profile) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    open(createStory(profile));
  }
  return (
    <>
      <Header count={library.stories.length} onHome={home} onLibrary={() => navigate('library')} onExplore={() => navigate('explore')} />
      {library.warning && (
        <div className="warning" role="status">
          {library.warning}
        </div>
      )}
      {page === 'home' && (
        <HomePage
          profile={library.profile}
          onProfile={library.updateProfile}
          onGenerate={generate}
        />
      )}{' '}
      {page === 'reader' && library.active && (
        <ReaderPage
          story={library.active}
          savingFailed={library.warning.includes('无法保存')}
          onChange={library.saveStory}
          onHome={home}
          onLibrary={() => navigate('library')}
        />
      )}{' '}
      {page === 'library' && <LibraryPage stories={library.stories} onOpen={open} onHome={home} />}
      {page === 'explore' && <ExplorePage onHome={home} />}
      <footer className="site-footer">
        <span>
          <Stars size={17} /> 星梦故事屋
        </span>
        <p>让每一颗小小的心，都拥有大大的世界。</p>
        <small>MADE FOR LITTLE DREAMERS</small>
      </footer>
    </>
  );
}
