import { useState, useEffect } from 'react';
import { playSelect, playClick, resumeAudio } from '@/lib/sounds';
import { LEVEL_META } from '@/lib/gameConfig';
import Icon from '@/components/ui/icon';

interface Props {
  onBack: () => void;
  onSelectLevel: (level: number) => void;
  bestScores?: Record<number, number>;
}

export default function LevelSelect({ onBack, onSelectLevel, bestScores = {} }: Props) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const handleSelect = (id: number) => {
    resumeAudio(); playSelect(); onSelectLevel(id);
  };

  const handleBack = () => { resumeAudio(); playClick(); onBack(); };

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

        <div className="levels-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {LEVEL_META.map((lvl) => {
            const best = bestScores[lvl.id] ?? 0;
            const stars = best > 800 * lvl.id ? 3 : best > 400 * lvl.id ? 2 : best > 0 ? 1 : 0;

            return (
              <div
                key={lvl.id}
                className={`level-card level-unlocked ${hovered === lvl.id ? 'level-hovered' : ''}`}
                style={{ '--level-color': lvl.color } as React.CSSProperties}
                onClick={() => handleSelect(lvl.id)}
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
                    <span key={s} className={s <= stars ? 'star-filled' : 'star-empty'}>★</span>
                  ))}
                </div>
                {best > 0 && <div className="level-best">🏆 {best.toLocaleString()}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
