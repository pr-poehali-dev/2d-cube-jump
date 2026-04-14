import { useEffect, useState } from 'react';
import { playDeath, playClick, resumeAudio } from '@/lib/sounds';
import Icon from '@/components/ui/icon';

interface Props {
  level: number;
  score: number;
  bestScore: number;
  onRestart: () => void;
  onMenu: () => void;
  onLevels: () => void;
}

const deathMessages = [
  'ИГРА ОКОНЧЕНА',
  'ТЫ УМЕР',
  'EPIC FAIL',
  'ПОПРОБУЙ ЕЩЁ РАЗ',
  'НЕ СДАВАЙСЯ',
];

export default function DeathScreen({ level, score, bestScore, onRestart, onMenu, onLevels }: Props) {
  const [visible, setVisible] = useState(false);
  const [msg] = useState(() => deathMessages[Math.floor(Math.random() * deathMessages.length)]);
  const [shakeCount, setShakeCount] = useState(0);
  const isNewRecord = score > bestScore;

  useEffect(() => {
    playDeath();
    setTimeout(() => setVisible(true), 100);
    const interval = setInterval(() => {
      setShakeCount((c) => c + 1);
    }, 80);
    setTimeout(() => clearInterval(interval), 600);
  }, []);

  const handle = (cb: () => void) => {
    resumeAudio();
    playClick();
    cb();
  };

  return (
    <div className={`death-overlay ${visible ? 'death-visible' : ''}`}>
      <div className="death-cracks">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="crack" style={{ '--crack-angle': `${i * 45}deg` } as React.CSSProperties} />
        ))}
      </div>

      <div className={`death-panel ${shakeCount > 0 && shakeCount < 8 ? 'death-shake' : ''}`}>
        <div className="death-skull">💀</div>

        <h2 className="death-title">{msg}</h2>

        {isNewRecord && (
          <div className="new-record">
            <Icon name="Trophy" size={18} />
            НОВЫЙ РЕКОРД!
          </div>
        )}

        <div className="death-stats">
          <div className="death-stat">
            <div className="death-stat-label">УРОВЕНЬ</div>
            <div className="death-stat-value">{level}</div>
          </div>
          <div className="death-stat">
            <div className="death-stat-label">ОЧКИ</div>
            <div className="death-stat-value" style={{ color: isNewRecord ? '#FFBE0B' : undefined }}>
              {score.toLocaleString()}
            </div>
          </div>
          <div className="death-stat">
            <div className="death-stat-label">РЕКОРД</div>
            <div className="death-stat-value">{Math.max(score, bestScore).toLocaleString()}</div>
          </div>
        </div>

        <div className="death-buttons">
          <button className="btn-game btn-primary" onClick={() => handle(onRestart)}>
            <Icon name="RotateCcw" size={20} />
            ЕЩЁ РАЗ!
          </button>
          <button className="btn-game btn-secondary" onClick={() => handle(onLevels)}>
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
