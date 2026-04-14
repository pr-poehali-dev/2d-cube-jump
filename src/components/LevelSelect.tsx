import { useState, useEffect } from 'react';
import { playSelect, playClick, resumeAudio } from '@/lib/sounds';
import Icon from '@/components/ui/icon';

interface Props {
  onBack: () => void;
  onSelectLevel: (level: number) => void;
}

const levels = [
  { id: 1, name: 'НЕОН-СТАРТ', difficulty: 'ЛЕГКО', color: '#06D6A0', stars: 3, unlocked: true, emoji: '🌿' },
  { id: 2, name: 'ЭЛЕКТРО-БЕЗДНА', difficulty: 'ЛЕГКО', color: '#3A86FF', stars: 2, unlocked: true, emoji: '⚡' },
  { id: 3, name: 'ОГНЕННЫЙ ПУТ', difficulty: 'СРЕДНЕ', color: '#FFBE0B', stars: 1, unlocked: true, emoji: '🔥' },
  { id: 4, name: 'ПЛАЗМА-ШТОРМ', difficulty: 'СРЕДНЕ', color: '#FF006E', stars: 0, unlocked: true, emoji: '🌀' },
  { id: 5, name: 'КИСЛОТНЫЙ РАЙ', difficulty: 'СЛОЖНО', color: '#8338EC', stars: 0, unlocked: false, emoji: '☢️' },
  { id: 6, name: 'АПОКАЛИПСИС', difficulty: 'БЕЗУМИЕ', color: '#FB5607', stars: 0, unlocked: false, emoji: '💀' },
];

export default function LevelSelect({ onBack, onSelectLevel }: Props) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleSelect = (level: typeof levels[0]) => {
    if (!level.unlocked) return;
    resumeAudio();
    playSelect();
    onSelectLevel(level.id);
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
              className={`level-card ${lvl.unlocked ? 'level-unlocked' : 'level-locked'} ${hovered === lvl.id ? 'level-hovered' : ''}`}
              style={{ '--level-color': lvl.color } as React.CSSProperties}
              onClick={() => handleSelect(lvl)}
              onMouseEnter={() => setHovered(lvl.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="level-glow" />
              {!lvl.unlocked && (
                <div className="level-lock">
                  <Icon name="Lock" size={32} />
                </div>
              )}
              <div className="level-emoji">{lvl.emoji}</div>
              <div className="level-number">#{lvl.id}</div>
              <div className="level-name">{lvl.name}</div>
              <div className="level-difficulty" style={{ color: lvl.color }}>{lvl.difficulty}</div>
              <div className="level-stars">
                {[1, 2, 3].map((s) => (
                  <span key={s} className={s <= lvl.stars ? 'star-filled' : 'star-empty'}>★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
