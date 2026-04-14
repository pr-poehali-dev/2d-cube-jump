import { useEffect, useState } from 'react';
import { playClick, resumeAudio } from '@/lib/sounds';
import Icon from '@/components/ui/icon';

interface Props {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: Props) {
  const [visible, setVisible] = useState(false);
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [particles, setParticles] = useState(true);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleBack = () => {
    resumeAudio();
    playClick();
    onBack();
  };

  const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean) => {
    resumeAudio();
    if (val) playClick();
    setter(!val);
  };

  return (
    <div className={`menu-screen ${visible ? 'menu-visible' : ''}`}>
      <div className="levels-bg" />
      <div className="menu-content levels-content" style={{ maxWidth: 520 }}>
        <div className="levels-header">
          <button className="btn-back" onClick={handleBack}>
            <Icon name="ArrowLeft" size={20} />
            НАЗАД
          </button>
          <h2 className="levels-title">НАСТРОЙКИ</h2>
          <div />
        </div>

        <div className="settings-list">
          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">ЗВУКОВЫЕ ЭФФЕКТЫ</span>
              <span className="settings-desc">Звуки прыжка, смерти, победы</span>
            </div>
            <button
              className={`settings-toggle ${sound ? 'toggle-on' : 'toggle-off'}`}
              onClick={() => toggle(setSound, sound)}
            >
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">МУЗЫКА</span>
              <span className="settings-desc">Фоновая музыка в игре</span>
            </div>
            <button
              className={`settings-toggle ${music ? 'toggle-on' : 'toggle-off'}`}
              onClick={() => toggle(setMusic, music)}
            >
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">ЧАСТИЦЫ</span>
              <span className="settings-desc">Анимированные частицы в меню</span>
            </div>
            <button
              className={`settings-toggle ${particles ? 'toggle-on' : 'toggle-off'}`}
              onClick={() => toggle(setParticles, particles)}
            >
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="settings-divider" />

          <div className="settings-row settings-row-info">
            <div className="settings-info">
              <span className="settings-label">УПРАВЛЕНИЕ</span>
              <span className="settings-desc">← A / → D — движение &nbsp;|&nbsp; ПРОБЕЛ / W / ↑ — прыжок &nbsp;|&nbsp; ESC — пауза</span>
            </div>
            <Icon name="Keyboard" size={22} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          </div>

          <div className="settings-row settings-row-info">
            <div className="settings-info">
              <span className="settings-label">ВЕРСИЯ</span>
              <span className="settings-desc">NEONRUN v1.0 © 2026</span>
            </div>
            <Icon name="Info" size={22} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
