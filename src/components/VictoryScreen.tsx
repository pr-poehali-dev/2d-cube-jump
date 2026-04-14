import { useEffect, useState } from 'react';
import { playClick, resumeAudio } from '@/lib/sounds';
import Icon from '@/components/ui/icon';

interface Props {
  level: number;
  score: number;
  bestScore: number;
  onNextLevel: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onLevels: () => void;
  hasNextLevel: boolean;
}

const fireworks = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 60,
  color: ['#FF006E', '#FFBE0B', '#06D6A0', '#3A86FF', '#8338EC', '#FB5607'][i % 6],
  delay: Math.random() * 1.5,
  size: Math.random() * 10 + 5,
}));

export default function VictoryScreen({ level, score, bestScore, onNextLevel, onRestart, onMenu, onLevels, hasNextLevel }: Props) {
  const [visible, setVisible] = useState(false);
  const isNewRecord = score > bestScore;

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
  }, []);

  const handle = (cb: () => void) => {
    resumeAudio();
    playClick();
    cb();
  };

  const stars = score > 800 ? 3 : score > 400 ? 2 : 1;

  return (
    <div className={`victory-overlay ${visible ? 'victory-visible' : ''}`}>
      {fireworks.map((fw) => (
        <div
          key={fw.id}
          className="firework"
          style={{
            left: `${fw.x}%`,
            top: `${fw.y}%`,
            width: fw.size,
            height: fw.size,
            background: fw.color,
            animationDelay: `${fw.delay}s`,
            boxShadow: `0 0 8px ${fw.color}`,
          }}
        />
      ))}

      <div className="victory-panel">
        <div className="victory-top-bar" />

        <div className="victory-trophy">🏆</div>

        <h2 className="victory-title">УРОВЕНЬ ПРОЙДЕН!</h2>

        <div className="victory-stars">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`victory-star ${s <= stars ? 'star-on' : 'star-off'}`}
              style={{ animationDelay: `${s * 0.15}s` }}
            >★</span>
          ))}
        </div>

        {isNewRecord && (
          <div className="new-record">
            <Icon name="Trophy" size={16} />
            НОВЫЙ РЕКОРД!
          </div>
        )}

        <div className="victory-stats">
          <div className="victory-stat">
            <div className="victory-stat-label">УРОВЕНЬ</div>
            <div className="victory-stat-value">{level}</div>
          </div>
          <div className="victory-stat">
            <div className="victory-stat-label">ОЧКИ</div>
            <div className="victory-stat-value" style={{ color: isNewRecord ? '#FFBE0B' : '#fff' }}>
              {score.toLocaleString()}
            </div>
          </div>
          <div className="victory-stat">
            <div className="victory-stat-label">РЕКОРД</div>
            <div className="victory-stat-value">{Math.max(score, bestScore).toLocaleString()}</div>
          </div>
        </div>

        <div className="victory-buttons">
          {hasNextLevel && (
            <button className="btn-game btn-primary" onClick={() => handle(onNextLevel)}>
              <Icon name="ChevronRight" size={20} />
              СЛЕДУЮЩИЙ УРОВЕНЬ
            </button>
          )}
          <button className="btn-game btn-secondary" onClick={() => handle(onRestart)}>
            <Icon name="RotateCcw" size={20} />
            ПОВТОРИТЬ
          </button>
          <button className="btn-game btn-outline" onClick={() => handle(onLevels)}>
            <Icon name="LayoutGrid" size={20} />
            УРОВНИ
          </button>
          <button className="btn-game btn-outline" onClick={() => handle(onMenu)}>
            <Icon name="Home" size={20} />
            В МЕНЮ
          </button>
        </div>
      </div>
    </div>
  );
}
