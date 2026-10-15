import { useId } from 'react';
import type { ThemeId } from '../types';
/** 原创矢量绘本场景：无外部素材、离线可用，并随主题切换。 */
export function Illustration({ theme, hero = false }: { theme: ThemeId; hero?: boolean }) {
  const id = useId().replace(/:/g, '');
  const colors = {
    forest: ['#c8dfca', '#eef0cd', '#2d6753'],
    space: ['#333b67', '#a4a9ce', '#e1d9b5'],
    ocean: ['#92ced5', '#dbefdf', '#166c79'],
  }[theme];
  return (
    <svg
      className={`illustration ${hero ? 'hero-illustration' : ''}`}
      viewBox="0 0 600 420"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={
        {
          forest: '月光下的小狐狸、精灵树屋和森林绘本',
          space: '小小宇航员与机器人一起探索星球',
          ocean: '小海龟游过珊瑚花园和贝壳宝箱',
        }[theme]
      }
    >
      <defs>
        <linearGradient id={id} x2="0" y2="1">
          <stop stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[1]} />
        </linearGradient>
        <radialGradient id={`${id}glow`}>
          <stop stopColor="#fff3b4" stopOpacity=".8" />
          <stop offset="1" stopColor="#fff3b4" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}shadow`}>
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#244b3a" floodOpacity=".13" />
        </filter>
      </defs>
      <rect width="600" height="420" fill={`url(#${id})`} />
      <circle cx="380" cy="125" r="125" fill={`url(#${id}glow)`} />
      <circle cx="435" cy="75" r="34" fill="#fff4c5" />
      {[
        [83, 60],
        [183, 96],
        [329, 42],
        [495, 168],
        [270, 80],
        [535, 58],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 5}v10m-5-5h10`}
          stroke={theme === 'space' ? '#fff5cd' : '#fffbea'}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      {theme === 'forest' && (
        <>
          <path d="M0 260Q100 160 220 262T600 228V420H0" fill="#9cbd9c" />
          <path d="M0 330Q160 230 340 320T600 290V420H0" fill="#73a187" />
          <path
            d="M290 420Q248 341 360 285Q397 258 378 224"
            fill="none"
            stroke="#eadbb3"
            strokeWidth="38"
          />
          <g fill="#386c53">
            <path d="M60 16 2 222h44v132h29V222h56z" />
            <path d="m560 14-74 248h55v109h36V262h46z" />
          </g>
          <g fill="#527f5c">
            <path d="m116 80-51 185h39v61h23v-61h44z" />
            <path d="m494 113-49 161h36v59h22v-59h38z" />
          </g>
          <g filter={`url(#${id}shadow)`}>
            <path d="M226 155h142v160H226z" fill="#b28b60" />
            <path d="m207 160 89-84 91 84z" fill="#356b51" />
            <path d="m216 144 80-68 81 68" fill="none" stroke="#e6dca9" strokeWidth="5" />
            <rect x="282" y="229" width="42" height="86" rx="21" fill="#f2d993" />
            <rect x="244" y="181" width="35" height="36" rx="12" fill="#ffe8a5" />
            <path d="M261 181v36m-17-18h35" stroke="#977956" strokeWidth="4" />
            <path d="M333 179v33" stroke="#c2ab80" strokeWidth="9" />
            <path d="M340 311h-127" stroke="#7c6349" strokeWidth="8" strokeLinecap="round" />
          </g>
          <g transform="translate(390 303)">
            <path d="M30 42Q92 11 75-17 111 12 76 54Z" fill="#d77e43" />
            <ellipse cx="25" cy="35" rx="28" ry="32" fill="#e99c55" />
            <path d="m-5 6 2-42 25 24 25-25 4 43-24 24z" fill="#e99c55" />
            <path d="m-5 6 27 11L51 6 26 29z" fill="#fff2ce" />
            <circle cx="12" cy="0" r="3" />
            <circle cx="36" cy="0" r="3" />
            <circle cx="25" cy="17" r="4" fill="#3c453c" />
            <ellipse cx="22" cy="42" rx="13" ry="18" fill="#ffebc7" />
          </g>
          <g transform="translate(125 312)">
            <path d="M0 33v30m18-31v20" stroke="#f5e6c4" strokeWidth="9" />
            <path d="M-23 32q23-47 47 0z" fill="#cb7056" />
            <circle cx="-5" cy="22" r="4" fill="#ffebce" />
            <circle cx="12" cy="26" r="3" fill="#ffebce" />
          </g>
          <g fill="#e4dda2">
            <circle cx="198" cy="266" r="3" />
            <circle cx="382" cy="183" r="4" />
            <circle cx="150" cy="193" r="3" />
          </g>
        </>
      )}
      {theme === 'space' && (
        <>
          <circle cx="139" cy="142" r="57" fill="#d5ad88" />
          <ellipse
            cx="139"
            cy="142"
            rx="91"
            ry="18"
            transform="rotate(-25 139 142)"
            fill="none"
            stroke="#eee1bc"
            strokeWidth="9"
          />
          <circle cx="475" cy="220" r="23" fill="#8998bd" />
          <path d="M0 345Q270 240 600 333V420H0" fill="#b9b6cd" />
          <ellipse cx="490" cy="364" rx="48" ry="12" fill="#989bb8" />
          <ellipse cx="109" cy="379" rx="58" ry="14" fill="#989bb8" />
          <g transform="translate(296 234)" filter={`url(#${id}shadow)`}>
            <rect x="-46" y="33" width="92" height="86" rx="28" fill="#f5eee0" />
            <path
              d="m-22 112-9 38m51-38 12 38"
              stroke="#f5eee0"
              strokeWidth="22"
              strokeLinecap="round"
            />
            <circle r="61" fill="#efe9df" />
            <circle cy="-3" r="46" fill="#45687e" />
            <path
              d="M-29-23q24-23 49-5"
              fill="none"
              stroke="#99c4ce"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <rect x="-18" y="55" width="37" height="27" rx="6" fill="#dfac78" />
            <path
              d="m-42 49-26 34m107-32 32-15"
              stroke="#f5eee0"
              strokeWidth="18"
              strokeLinecap="round"
            />
          </g>
          <g transform="translate(430 298)">
            <rect x="-24" y="0" width="62" height="50" rx="14" fill="#80b4a8" />
            <rect x="-18" y="12" width="49" height="18" rx="6" fill="#314f61" />
            <circle cx="-5" cy="21" r="3" fill="#ffe4a0" />
            <circle cx="19" cy="21" r="3" fill="#ffe4a0" />
            <path d="M7 0v-18m-18 68-7 20m44-20 7 20" stroke="#80b4a8" strokeWidth="9" />
            <circle cx="7" cy="-20" r="7" fill="#ffe4a0" />
          </g>
        </>
      )}
      {theme === 'ocean' && (
        <>
          <path d="M100 0 240 420h80L190 0m110 0 70 420h80L390 0" fill="#eff7dc" opacity=".16" />
          <path d="M0 330q165-35 320 4t280-4v90H0" fill="#ded6af" />
          <g transform="translate(265 204) rotate(-10)">
            <ellipse cx="0" cy="0" rx="80" ry="57" fill="#548f7b" />
            <path
              d="m-56-28 54-22 57 24-4 48-53 26-52-22z"
              fill="none"
              stroke="#94bc8e"
              strokeWidth="5"
            />
            <path d="M0-50v100m-54-76 108 48m0-48L-53 26" stroke="#94bc8e" strokeWidth="4" />
            <ellipse cx="89" cy="-9" rx="33" ry="28" fill="#91ba89" />
            <circle cx="103" cy="-18" r="5" fill="#264d47" />
            <path d="M96 2q9 9 18-2" stroke="#426e5a" strokeWidth="3" fill="none" />
            <ellipse cx="-43" cy="-56" rx="30" ry="13" fill="#91ba89" transform="rotate(20)" />
            <ellipse cx="-24" cy="61" rx="36" ry="14" fill="#91ba89" transform="rotate(-13)" />
          </g>
          <g stroke="#cf8e83" strokeWidth="11" strokeLinecap="round">
            <path d="M78 370v-100m0 50-27-30m27 13 28-35m-28 82 35-20" />
          </g>
          <g stroke="#609d90" strokeWidth="10" strokeLinecap="round">
            <path d="M510 380q-40-45 0-100m12 100q45-65 20-83" fill="none" />
          </g>
          <g transform="translate(350 315)">
            <rect width="94" height="55" rx="9" fill="#bb8c51" />
            <path d="M0 8q47-63 94 0z" fill="#e9bf74" />
            <path d="M22 2v51m52-51v51" stroke="#f4d99a" strokeWidth="9" />
            <rect x="39" y="19" width="16" height="18" rx="3" fill="#fbe3a1" />
          </g>
          {[
            [100, 100],
            [423, 141],
            [468, 91],
            [393, 249],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={8 + i * 2}
              fill="none"
              stroke="#e7f5e4"
              strokeWidth="3"
              opacity=".7"
            />
          ))}
          <path d="m150 315 7 13 15 1-11 11 3 15-14-7-14 7 3-15-11-11 15-1z" fill="#ce927c" />
        </>
      )}
      <path d="M0 406q140-36 295 0t305-10v24H0" fill={colors[2]} opacity=".35" />
      {hero && (
        <g transform="translate(224 350) rotate(-7)" filter={`url(#${id}shadow)`}>
          <path d="M0 0q48-15 82 7 35-22 82-7v61q-47-12-82 4Q44 48 0 61z" fill="#fffae5" />
          <path d="M82 7v58" stroke="#d9caa2" strokeWidth="3" />
          <path
            d="m15 15 45 4m-45 8 45 4m40-12 43-6m-43 19 43-6"
            stroke="#c5bc9a"
            strokeWidth="3"
          />
        </g>
      )}
    </svg>
  );
}
