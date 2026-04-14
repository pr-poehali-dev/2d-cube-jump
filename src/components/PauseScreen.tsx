import { useEffect, useState } from 'react';
import { playClick, resumeAudio } from '@/lib/sounds';
import Icon from '@/components/ui/icon';

interface Props {
  level: number;
  score: number;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export default function PauseScreen({ level, score, onResume, onRestart, onMenu }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 30);
  }, []);

  const handle = (cb: () => void) => {
    resumeAudio();
    playClick();
    cb();
  };

  return (
    <div className={`pause-overlay ${visible ? 'pause-visible' : ''}`}>
      <div className="pause-panel">
        <div className="pause-stripe" />

        <div className="pause-icon-wrap">
          <Icon name="Pause" size={40} />
        </div>

        <h2 className="pause-title">ПАУЗА</h2>

        <div className="pause-stats">
          <div className="pause-stat">
            <span className="pause-stat-label">УРОВЕНЬ</span>
            <span className="pause-stat-value">{level}</span>
          </div>
          <div className="pause-stat-divider" />
          <div className="pause-stat">
            <span className="pause-stat-label">ОЧКИ</span>
            <span className="pause-stat-value">{score.toLocaleString()}</span>
          </div>
        </div>

        <div className="pause-buttons">
          <button className="btn-game btn-primary" onClick={() => handle(onResume)}>
            <Icon name="Play" size={20} />
            ПРОДОЛЖИТЬ
          </button>
          <button className="btn-game btn-secondary" onClick={() => handle(onRestart)}>
            <Icon name="RotateCcw" size={20} />
            НАЧАТЬ ЗАНОВО
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
