import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Compass,
  Feather,
  Heart,
  LoaderCircle,
  Sparkles,
  Sprout,
  Rocket,
  Waves,
} from 'lucide-react';
import type { Profile, ThemeId } from '../types';
import { themes } from '../data/themes';
import { validateProfile } from '../engine/storyEngine';
import { Illustration } from '../components/Illustration';
const icons = { forest: Sprout, space: Rocket, ocean: Waves };
export function HomePage({
  profile,
  onProfile,
  onGenerate,
}: {
  profile: Profile;
  onProfile: (p: Profile) => void;
  onGenerate: (p: Profile) => Promise<void>;
}) {
  const [draft, setDraft] = useState(profile);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (!Object.keys(validateProfile(next)).length) onProfile(next);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateProfile(draft);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    setBusy(true);
    setFailure('');
    try {
      await onGenerate(draft);
    } catch {
      setFailure('故事暂时没能打开，请再试一次。');
      setBusy(false);
    }
  }
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> 每一个孩子，都值得拥有自己的故事
          </div>
          <h1>
            小小的你，
            <br />
            大大的
            <span className="magic-word">
              奇妙世界
              <svg viewBox="0 0 300 20" aria-hidden="true">
                <path d="M4 14Q150-3 296 9" />
              </svg>
            </span>
            <span className="heading-star">✧</span>
          </h1>
          <p>
            把名字写进童话，把喜欢变成魔法。
            <br />
            在星梦故事屋，让孩子成为冒险的主角。
          </p>
          <div className="hero-pills">
            <span>
              <Feather size={15} /> 原创互动故事
            </span>
            <span>
              <Heart size={15} /> 适合 3–12 岁
            </span>
            <span>
              <Sparkles size={15} /> 每次都有新发现
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="orbit-label">A LITTLE WONDER, JUST FOR YOU</div>
          <Illustration theme={draft.theme} hero />
          <div className="art-note">
            <span>✦</span> 下一页，会遇见怎样的自己？
          </div>
        </div>
      </section>
      <form onSubmit={submit} noValidate>
        <section className="creator-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">LET THE STORY BEGIN</span>
              <h2>今天，谁是故事的主角？</h2>
            </div>
            <span className="step-caption">只需一点点想象，故事就会发生</span>
          </div>
          <div className="profile-card">
            <div className="field">
              <label htmlFor="name">
                主角名字 <span>01</span>
              </label>
              <input
                id="name"
                value={draft.name}
                maxLength={40}
                onChange={(e) => update('name', e.target.value)}
                placeholder="给小小冒险家起个名字"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <small className="error" id="name-error">
                  {errors.name}
                </small>
              )}
            </div>
            <div className="field age-field">
              <label htmlFor="age">
                孩子年龄 <span>02</span>
              </label>
              <div className="select-wrap">
                <select
                  id="age"
                  value={draft.age}
                  onChange={(e) => update('age', Number(e.target.value))}
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={i + 3}>
                      {i + 3} 岁
                    </option>
                  ))}
                </select>
              </div>
              {errors.age && <small className="error">{errors.age}</small>}
            </div>
            <div className="field interest-field">
              <label htmlFor="interests">
                兴趣小宇宙 <span>03</span>
              </label>
              <input
                id="interests"
                value={draft.interests}
                maxLength={80}
                onChange={(e) => update('interests', e.target.value)}
                placeholder="例如：恐龙、绘画、音乐"
                aria-invalid={!!errors.interests}
                aria-describedby={errors.interests ? 'interests-error' : undefined}
              />
              {errors.interests && (
                <small className="error" id="interests-error">
                  {errors.interests}
                </small>
              )}
              <div className="interest-chips">
                {['恐龙', '魔法', '动物', '机器人', '绘画', '音乐'].map((interest) => (
                  <button
                    type="button"
                    key={interest}
                    className={draft.interests.includes(interest) ? 'active' : ''}
                    onClick={() => update('interests', interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="world-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">PICK YOUR LITTLE ADVENTURE</span>
              <h2>
                选一个世界，让想象出发 <Compass size={24} />
              </h2>
            </div>
            <span className="step-caption">3 个奇妙世界 · 无限种可能</span>
          </div>
          <div className="theme-grid" role="group" aria-label="故事主题">
            {themes.map((theme) => {
              const Icon = icons[theme.id];
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-card ${theme.id} ${draft.theme === theme.id ? 'selected' : ''}`}
                  aria-pressed={draft.theme === theme.id}
                  onClick={() => update('theme', theme.id as ThemeId)}
                >
                  <div className="theme-art">
                    <Illustration theme={theme.id} />
                    <span className="selection-check">
                      {draft.theme === theme.id ? <Check size={15} /> : null}
                    </span>
                    <span className="theme-number">0{themes.indexOf(theme) + 1}</span>
                  </div>
                  <div className="theme-content">
                    <span className="theme-english">{theme.english}</span>
                    <h3>
                      <Icon size={21} />
                      {theme.name}
                      <ArrowRight className="card-arrow" size={19} />
                    </h3>
                    <p>{theme.description}</p>
                    <div className="theme-tag">{theme.tagline}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
        <div className="launch-row">
          <div>
            <span className="tiny-stars">✧ ✦</span>
            <p>
              一个名字，一份热爱，一场属于你的冒险。
              <small>无需注册 · 免费创作 · 自动保存到本设备</small>
            </p>
          </div>
          <button className="primary launch" disabled={busy} type="submit">
            {busy ? <LoaderCircle className="spin" size={21} /> : <Sparkles size={21} />}{' '}
            {busy ? '正在装好你的冒险背包…' : '开启我的专属故事'}{' '}
            {!busy && <ArrowRight size={20} />}
          </button>
        </div>
        {failure && (
          <p role="alert" className="error">
            {failure}
          </p>
        )}
      </form>
      <div className="values-strip">
        <span>
          <Sprout size={18} /> 让好奇心自由生长
        </span>
        <i />
        <span>
          <Heart size={18} /> 每一次选择，都值得被鼓励
        </span>
        <i />
        <span>
          <BookIcon /> 把陪伴，藏进故事里
        </span>
      </div>
    </main>
  );
}
function BookIcon() {
  return <Feather size={18} />;
}
