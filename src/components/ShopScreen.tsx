import { useEffect, useState } from 'react';
import { playClick, playSelect, playVictory, resumeAudio } from '@/lib/sounds';
import { CUBE_SKINS } from '@/lib/gameConfig';
import Icon from '@/components/ui/icon';

interface Props {
  totalCoins: number;
  ownedSkins: string[];
  activeSkin: string;
  onBuy: (skinId: string, price: number) => void;
  onSelect: (skinId: string) => void;
  onBack: () => void;
}

export default function ShopScreen({ totalCoins, ownedSkins, activeSkin, onBuy, onSelect, onBack }: Props) {
  const [visible, setVisible]   = useState(false);
  const [preview, setPreview]   = useState<string | null>(null);
  const [bought, setBought]     = useState<string | null>(null);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const handleBack = () => { resumeAudio(); playClick(); onBack(); };

  const handleBuy = (skinId: string, price: number) => {
    if (totalCoins < price) return;
    resumeAudio(); playVictory();
    onBuy(skinId, price);
    setBought(skinId);
    setTimeout(() => setBought(null), 1500);
  };

  const handleSelect = (skinId: string) => {
    resumeAudio(); playSelect();
    onSelect(skinId);
  };

  return (
    <div className={`menu-screen ${visible ? 'menu-visible' : ''}`}>
      <div className="levels-bg" />
      <div className="menu-content levels-content" style={{ maxWidth: 760 }}>
        <div className="levels-header">
          <button className="btn-back" onClick={handleBack}>
            <Icon name="ArrowLeft" size={20} />
            НАЗАД
          </button>
          <h2 className="levels-title">МАГАЗИН</h2>
          <div className="shop-coins">
            <span>🪙</span>
            <span className="shop-coins-val">{totalCoins.toLocaleString()}</span>
          </div>
        </div>

        <div className="shop-grid">
          {CUBE_SKINS.map((skin) => {
            const owned   = ownedSkins.includes(skin.id) || skin.price === 0;
            const active  = activeSkin === skin.id;
            const canBuy  = !owned && totalCoins >= skin.price;
            const justBought = bought === skin.id;

            return (
              <div
                key={skin.id}
                className={`shop-card ${active ? 'shop-card-active' : ''} ${preview === skin.id ? 'shop-card-hovered' : ''}`}
                onMouseEnter={() => setPreview(skin.id)}
                onMouseLeave={() => setPreview(null)}
                style={{ '--c1': skin.color1, '--c2': skin.color2 } as React.CSSProperties}
              >
                {/* Cube preview */}
                <div className="shop-cube-wrap">
                  <div
                    className="shop-cube"
                    style={{ background: `linear-gradient(135deg, ${skin.color1}, ${skin.color2})`,
                             boxShadow: `0 0 20px ${skin.color2}55` }}
                  >
                    <div className="shop-cube-eye" />
                    <div className="shop-cube-shine" />
                  </div>
                  {active && <div className="shop-active-badge">В ИГРЕ</div>}
                </div>

                <div className="shop-skin-name">{skin.name}</div>

                {justBought ? (
                  <div className="shop-btn-bought">✅ КУПЛЕНО!</div>
                ) : owned ? (
                  <button
                    className={`shop-btn ${active ? 'shop-btn-active' : 'shop-btn-select'}`}
                    onClick={() => handleSelect(skin.id)}
                  >
                    {active ? <><Icon name="Check" size={14} /> ВЫБРАН</> : 'ВЫБРАТЬ'}
                  </button>
                ) : (
                  <button
                    className={`shop-btn ${canBuy ? 'shop-btn-buy' : 'shop-btn-locked'}`}
                    onClick={() => canBuy && handleBuy(skin.id, skin.price)}
                  >
                    🪙 {skin.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="shop-hint">Монеты собирай в уровнях — 🪙 лежат по пути!</p>
      </div>
    </div>
  );
}
