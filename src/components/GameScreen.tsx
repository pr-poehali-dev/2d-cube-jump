import { useEffect, useState, useCallback } from 'react';
import { playJump, playVictory, resumeAudio } from '@/lib/sounds';
import PauseScreen from './PauseScreen';
import Icon from '@/components/ui/icon';

interface Props {
  level: number;
  onDeath: (score: number) => void;
  onMenu: () => void;
}

export default function GameScreen({ level, onDeath, onMenu }: Props) {
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playerY, setPlayerY] = useState(0);
  const [jumping, setJumping] = useState(false);
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setScore((s) => s + level * 10);
    }, 200);
    return () => clearInterval(interval);
  }, [paused, level]);

  const jump = useCallback(() => {
    if (jumping) return;
    resumeAudio();
    playJump();
    setJumping(true);
    setCombo((c) => c + 1);
    setPlayerY(1);
    setTimeout(() => {
      setPlayerY(0);
      setTimeout(() => setJumping(false), 200);
    }, 400);
  }, [jumping]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (e.code === 'Escape') return;
        jump();
      }
      if (e.code === 'Escape') setPaused((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  const handleDeath = () => {
    onDeath(score);
  };

  const handlePauseMenu = () => {
    setPaused(false);
    onMenu();
  };

  const handleRestart = () => {
    setPaused(false);
    setScore(0);
    setCombo(0);
  };

  return (
    <div className="game-screen" onClick={jump}>
      <div className="game-hud">
        <div className="hud-left">
          <div className="hud-score">
            <span className="hud-label">ОЧКИ</span>
            <span className="hud-value">{score.toLocaleString()}</span>
          </div>
          {combo > 2 && (
            <div className="hud-combo">x{combo} COMBO!</div>
          )}
        </div>
        <div className="hud-center">
          <span className="hud-level">УРОВЕНЬ {level}</span>
        </div>
        <div className="hud-right">
          <button
            className="btn-pause"
            onClick={(e) => { e.stopPropagation(); setPaused(true); }}
          >
            <Icon name="Pause" size={20} />
          </button>
        </div>
      </div>

      <div className="game-world">
        <div className="game-bg-layer layer-1" />
        <div className="game-bg-layer layer-2" />
        <div className="game-bg-layer layer-3" />

        <div className="game-ground">
          <div className="ground-line" />
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="ground-tile" style={{ animationDelay: `${i * -0.4}s` }} />
          ))}
        </div>

        <div
          className={`game-player ${jumping ? 'player-jump' : ''}`}
          style={{ bottom: `calc(120px + ${playerY * 120}px)` }}
        >
          <div className="player-body">🏃</div>
          <div className="player-shadow" />
        </div>

        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="obstacle"
            style={{ animationDelay: `${i * -2.5}s`, animationDuration: `${4 - level * 0.2}s` }}
          />
        ))}
      </div>

      <div className="game-controls-hint">
        ПРОБЕЛ / НАЖМИ — ПРЫЖОК
      </div>

      <div className="game-demo-buttons">
        <button
          className="btn-demo btn-demo-death"
          onClick={(e) => { e.stopPropagation(); handleDeath(); }}
        >
          💀 Смерть
        </button>
        <button
          className="btn-demo btn-demo-win"
          onClick={(e) => { e.stopPropagation(); playVictory(); }}
        >
          🏆 Победа
        </button>
      </div>

      {paused && (
        <PauseScreen
          level={level}
          score={score}
          onResume={() => setPaused(false)}
          onRestart={handleRestart}
          onMenu={handlePauseMenu}
        />
      )}
    </div>
  );
}
