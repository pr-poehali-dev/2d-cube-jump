import { useEffect, useState } from 'react';
import { playClick, resumeAudio } from '@/lib/sounds';
import Icon from '@/components/ui/icon';

interface Props {
  bestScores: Record<number, number>;
  onBack: () => void;
}

const levelNames: Record<number, string> = {
  1: '🌿 НЕОН-СТАРТ',
  2: '⚡ ЭЛЕКТРО-БЕЗДНА',
  3: '🔥 ОГНЕННЫЙ ПУТЬ',
  4: '🌀 ПЛАЗМА-ШТОРМ',
  5: '☢️ КИСЛОТНЫЙ РАЙ',
  6: '💀 АПОКАЛИПСИС',
};

export default function LeaderboardScreen({ bestScores, onBack }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const totalScore = Object.values(bestScores).reduce((a, b) => a + b, 0);
  const levelsCompleted = Object.keys(bestScores).length;

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
          <h2 className="levels-title">РЕКОРДЫ</h2>
          <div />
        </div>

        <div className="lb-summary">
          <div className="lb-summary-item">
            <span className="lb-summary-label">СУММА ОЧКОВ</span>
            <span className="lb-summary-value" style={{ color: '#FFBE0B' }}>{totalScore.toLocaleString()}</span>
          </div>
          <div className="lb-summary-divider" />
          <div className="lb-summary-item">
            <span className="lb-summary-label">УРОВНЕЙ ПРОЙДЕНО</span>
            <span className="lb-summary-value" style={{ color: '#06D6A0' }}>{levelsCompleted} / 6</span>
          </div>
        </div>

        <div className="lb-list">
          {[1, 2, 3, 4, 5, 6].map((id) => {
            const score = bestScores[id] ?? 0;
            const done = score > 0;
            return (
              <div key={id} className={`lb-row ${done ? 'lb-row-done' : 'lb-row-empty'}`}>
                <span className="lb-rank">#{id}</span>
                <span className="lb-name">{levelNames[id]}</span>
                <span className="lb-score">
                  {done ? (
                    <><Icon name="Trophy" size={14} /> {score.toLocaleString()}</>
                  ) : (
                    <span className="lb-not-played">—</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
