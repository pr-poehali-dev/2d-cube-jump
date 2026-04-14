import { useState, useEffect } from 'react';
import { playSelect, playClick, resumeAudio } from '@/lib/sounds';
import Icon from '@/components/ui/icon';

interface Props {
  onBack: () => void;
  onSelectLevel: (level: number) => void;
  bestScores?: Record<number, number>;
}

const levels = [
  { id: 1, name: 'НЕОН-СТАРТ',      difficulty: 'ЛЕГКО',   color: '#06D6A0', stars: 3, emoji: '🌿' },
  { id: 2, name: 'ЭЛЕКТРО-БЕЗДНА',  difficulty: 'ЛЕГКО',   color: '#3A86FF', stars: 3, emoji: '⚡' },
  { id: 3, name: 'ОГНЕННЫЙ ПУТЬ',   difficulty: 'СРЕДНЕ',  color: '#FFBE0B', stars: 2, emoji: '🔥' },
  { id: 4, name: 'ПЛАЗМА-ШТОРМ',    difficulty: 'СРЕДНЕ',  color: '#FF006E', stars: 2, emoji: '🌀' },
  { id: 5, name: 'КИСЛОТНЫЙ РАЙ',   difficulty: 'СЛОЖНО',  color: '#8338EC', stars: 1, emoji: '☢️' },
  { id: 6, name: 'АПОКАЛИПСИС',     difficulty: 'БЕЗУМИЕ', color: '#FB5607', stars: 1, emoji: '💀' },
];

export default function LevelSelect({ onBack, onSelectLevel, bestScores = {} }: Props) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleSelect = (lvl: typeof levels[0]) => {
    resumeAudio();
    playSelect();
    onSelectLevel(lvl.id);
  };

  const handleBack = () => {
    resumeAudio();
    playClick();
    onBack();
  };

  return (
    <div className={`menu-screen ${visible ? 'menu-visible' : ''}`}>
      <div className="levels-bg" />

      <div className="menu-content levels-content">
        <div className="levels-header">
          <button className="btn-back" onClick={handleBack}>
            <Icon name="ArrowLeft" size={20} />
            НАЗАД
          </button>
          <h2 className="levels-title">ВЫБОР УРОВНЯ</h2>
          <div />
        </div>

        <div className="levels-grid">
          {levels.map((lvl) => (
            <div
              key={lvl.id}
              className={`level-card level-unlocked ${hovered === lvl.id ? 'level-hovered' : ''}`}
              style={{ '--level-color': lvl.color } as React.CSSProperties}
              onClick={() => handleSelect(lvl)}
              onMouseEnter={() => setHovered(lvl.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="level-glow" />
              <div className="level-emoji">{lvl.emoji}</div>
              <div className="level-number">#{lvl.id}</div>
              <div className="level-name">{lvl.name}</div>
              <div className="level-difficulty" style={{ color: lvl.color }}>{lvl.difficulty}</div>
              <div className="level-stars">
                {[1, 2, 3].map((s) => (
                  <span key={s} className={s <= lvl.stars ? 'star-filled' : 'star-empty'}>★</span>
                ))}
              </div>
              {bestScores[lvl.id] ? (
                <div className="level-best">🏆 {bestScores[lvl.id].toLocaleString()}</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
