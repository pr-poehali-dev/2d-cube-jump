import { useEffect, useState } from 'react';
import { playClick, resumeAudio } from '@/lib/sounds';
import Icon from '@/components/ui/icon';

export type ControlMode = 'keyboard' | 'dpad' | 'tilt';

interface Props {
  onBack: () => void;
  controlMode: ControlMode;
  onControlModeChange: (m: ControlMode) => void;
}

export default function SettingsScreen({ onBack, controlMode, onControlModeChange }: Props) {
  const [visible, setVisible] = useState(false);
  const [sound, setSound]     = useState(true);
  const [particles, setParticles] = useState(true);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const handleBack = () => { resumeAudio(); playClick(); onBack(); };
  const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean) => {
    resumeAudio(); if (val) playClick(); setter(!val);
  };

  const modes: { id: ControlMode; label: string; desc: string; icon: string }[] = [
    { id: 'keyboard', label: 'КЛАВИАТУРА',  desc: 'A/D или ← → + ПРОБЕЛ',  icon: 'Keyboard' },
    { id: 'dpad',     label: 'D-PAD',       desc: 'Кнопки на экране',        icon: 'Gamepad2' },
    { id: 'tilt',     label: 'ГИРОСКОП',    desc: 'Наклон телефона',          icon: 'Smartphone' },
  ];

  return (
    <div className={`menu-screen ${visible ? 'menu-visible' : ''}`}>
      <div className="levels-bg" />
      <div className="menu-content levels-content" style={{ maxWidth: 540 }}>
        <div className="levels-header">
          <button className="btn-back" onClick={handleBack}>
            <Icon name="ArrowLeft" size={20} />
            НАЗАД
          </button>
          <h2 className="levels-title">НАСТРОЙКИ</h2>
          <div />
        </div>

        <div className="settings-list">
          {/* Control mode */}
          <div className="settings-section-title">РЕЖИМ УПРАВЛЕНИЯ</div>
          <div className="control-mode-grid">
            {modes.map((m) => (
              <button
                key={m.id}
                className={`control-mode-btn ${controlMode === m.id ? 'control-mode-active' : ''}`}
                onClick={() => { resumeAudio(); playClick(); onControlModeChange(m.id); }}
              >
                <Icon name={m.icon} size={24} />
                <span className="control-mode-label">{m.label}</span>
                <span className="control-mode-desc">{m.desc}</span>
                {controlMode === m.id && <div className="control-mode-check"><Icon name="Check" size={14} /></div>}
              </button>
            ))}
          </div>

          <div className="settings-divider" />

          {/* Sound */}
          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">ЗВУКОВЫЕ ЭФФЕКТЫ</span>
              <span className="settings-desc">Звуки прыжка, монет, смерти, победы</span>
            </div>
            <button className={`settings-toggle ${sound ? 'toggle-on' : 'toggle-off'}`}
              onClick={() => toggle(setSound, sound)}>
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">ЧАСТИЦЫ В МЕНЮ</span>
              <span className="settings-desc">Анимированные частицы на фоне</span>
            </div>
            <button className={`settings-toggle ${particles ? 'toggle-on' : 'toggle-off'}`}
              onClick={() => toggle(setParticles, particles)}>
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="settings-divider" />

          <div className="settings-row settings-row-info">
            <div className="settings-info">
              <span className="settings-label">ВЕРСИЯ</span>
              <span className="settings-desc">NEONRUN v1.0 © 2026</span>
            </div>
            <Icon name="Info" size={20} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
