import { useEffect, useState } from 'react';
import { playClick, resumeAudio } from '@/lib/sounds';
import Icon from '@/components/ui/icon';

interface Props {
  onPlay: () => void;
  onLevels: () => void;
  onRecords: () => void;
  onSettings: () => void;
  onShop: () => void;
  totalCoins: number;
}

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 12 + 4,
  delay: Math.random() * 3,
  duration: Math.random() * 3 + 2,
  color: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF', '#06D6A0'][Math.floor(Math.random() * 6)],
}));

export default function MainMenu({ onPlay, onLevels, onRecords, onSettings, onShop, totalCoins }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);
  const handle = (cb: () => void) => { resumeAudio(); playClick(); cb(); };

  return (
    <div className={`menu-screen ${visible ? 'menu-visible' : ''}`}>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, background: p.color,
          animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
        }} />
      ))}

      <div className="menu-content">
        <div className="logo-block">
          <div className="logo-glow" />
          <h1 className="game-title">NEON<span>RUN</span></h1>
        </div>

        {totalCoins > 0 && (
          <div className="menu-coins-bar">
            🪙 <span>{totalCoins.toLocaleString()} монет</span>
          </div>
        )}

        <div className="menu-buttons">
          <button className="btn-game btn-primary" onClick={() => handle(onPlay)}>
            <Icon name="Play" size={22} />
            ИГРАТЬ
          </button>
          <button className="btn-game btn-secondary" onClick={() => handle(onLevels)}>
            <Icon name="LayoutGrid" size={22} />
            УРОВНИ
          </button>
          <button className="btn-game btn-shop btn-outline" onClick={() => handle(onShop)}>
            <Icon name="ShoppingBag" size={22} />
            МАГАЗИН КУБИКОВ
          </button>
          <button className="btn-game btn-outline" onClick={() => handle(onRecords)}>
            <Icon name="Trophy" size={22} />
            РЕКОРДЫ
          </button>
          <button className="btn-game btn-outline" onClick={() => handle(onSettings)}>
            <Icon name="Settings" size={22} />
            НАСТРОЙКИ
          </button>
        </div>

        <div className="menu-footer">
          <span>🎮 Версия 1.0</span>
          <span>NEONRUN © 2026</span>
        </div>
      </div>
    </div>
  );
}
