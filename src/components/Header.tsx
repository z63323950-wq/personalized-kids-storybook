import { BookOpen, Stars, ArrowUpRight } from 'lucide-react';
export function Header({
  count,
  onHome,
  onLibrary,
  onExplore,
}: {
  count: number;
  onHome: () => void;
  onLibrary: () => void;
  onExplore: () => void;
}) {
  return (
    <header className="site-header">
      <button className="brand" onClick={onHome} aria-label="星梦故事屋首页">
        <span className="brand-icon">
          <Stars size={27} />
        </span>
        <span>
          星梦故事屋<small>STARRY STORYLAND</small>
        </span>
      </button>
      <nav aria-label="主导航">
        <button className="explore-nav" onClick={onExplore}>故事乐园 ✦</button>
        <button className="nav-home" onClick={onHome}>
          开启新故事 <ArrowUpRight size={15} />
        </button>
        <button className="library-button" onClick={onLibrary}>
          <BookOpen size={18} /> 我的故事架 <span>{count}</span>
        </button>
      </nav>
    </header>
  );
}
