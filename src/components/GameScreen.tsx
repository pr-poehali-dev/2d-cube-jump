import { useEffect, useRef, useState, useCallback } from 'react';
import { playJump, playDeath, playVictory, playClick, playSelect, resumeAudio } from '@/lib/sounds';
import {
  CANVAS_W, CANVAS_H, GROUND_Y, PLAYER_SIZE, GRAVITY, JUMP_FORCE,
  SPIKE_W, SPIKE_H, COIN_R, COIN_VALUE,
  buildLevel, CUBE_SKINS,
} from '@/lib/gameConfig';
import PauseScreen from './PauseScreen';
import Icon from '@/components/ui/icon';

interface Props {
  level: number;
  onDeath: (score: number, coins: number) => void;
  onVictory: (score: number, coins: number) => void;
  onMenu: () => void;
  skinId?: string;
  controlMode?: 'keyboard' | 'dpad' | 'tilt';
}

const MOVE_SPEED = 4.5;

export default function GameScreen({ level, onDeath, onVictory, onMenu, skinId = 'default', controlMode = 'keyboard' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const skin = CUBE_SKINS.find(s => s.id === skinId) ?? CUBE_SKINS[0];

  const stateRef = useRef({
    px: 80, py: GROUND_Y - PLAYER_SIZE,
    vx: 0, vy: 0,
    onGround: false,
    cameraX: 0,
    score: 0,
    coinsCollected: 0,
    alive: true, won: false,
    keys: { left: false, right: false, jump: false },
    jumpConsumed: false,
    facing: 1 as 1 | -1,
  });

  const pausedRef = useRef(false);
  const rafRef    = useRef<number>(0);

  const [paused, setPausedState]   = useState(false);
  const [score, setScore]          = useState(0);
  const [coins, setCoins]          = useState(0);
  const [dead, setDead]            = useState(false);
  const [won, setWon]              = useState(false);

  const levelData = useRef(buildLevel(level));

  const setPaused = useCallback((val: boolean) => {
    pausedRef.current = val;
    setPausedState(val);
  }, []);

  // ── GAME LOOP ──────────────────────────────────────────────────────────────
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const { platforms, spikes, coins: levelCoins, goalX, levelW, bgHue } = levelData.current;

    if (!pausedRef.current && s.alive && !s.won) {
      // Movement
      s.vx = 0;
      if (s.keys.left)  { s.vx = -MOVE_SPEED; s.facing = -1; }
      if (s.keys.right) { s.vx =  MOVE_SPEED; s.facing =  1; }

      // Jump (only on ground, only on fresh press)
      if (s.keys.jump && !s.jumpConsumed && s.onGround) {
        s.vy = JUMP_FORCE;
        s.onGround = false;
        s.jumpConsumed = true;
        resumeAudio(); playJump();
      }
      if (!s.keys.jump) s.jumpConsumed = false;

      s.vy += GRAVITY;
      s.py += s.vy;
      s.px += s.vx;
      s.px  = Math.max(0, Math.min(s.px, levelW - PLAYER_SIZE));

      // Ground
      s.onGround = false;
      if (s.py >= GROUND_Y - PLAYER_SIZE) {
        s.py = GROUND_Y - PLAYER_SIZE; s.vy = 0; s.onGround = true;
      }

      // Platforms
      for (const p of platforms) {
        const feet = s.py + PLAYER_SIZE;
        const prev = feet - s.vy;
        if (s.px + PLAYER_SIZE > p.x && s.px < p.x + p.w && prev <= p.y + 2 && feet >= p.y && s.vy >= 0) {
          s.py = p.y - PLAYER_SIZE; s.vy = 0; s.onGround = true;
        }
      }

      // Camera
      const target = s.px - CANVAS_W / 3;
      s.cameraX += (target - s.cameraX) * 0.12;
      s.cameraX  = Math.max(0, Math.min(s.cameraX, levelW - CANVAS_W));

      // Score: очки начисляются за движение вперёд (расстояние до финиша уменьшается)
      const progress = Math.max(0, s.px / goalX);
      s.score = Math.floor(progress * 1000 * level) + s.coinsCollected * COIN_VALUE;
      setScore(s.score);

      // Coins
      for (const c of levelCoins) {
        if (c.collected) continue;
        const cx = c.x + COIN_R;
        const cy = c.y + COIN_R;
        if (Math.abs(s.px + PLAYER_SIZE / 2 - cx) < PLAYER_SIZE / 2 + COIN_R &&
            Math.abs(s.py + PLAYER_SIZE / 2 - cy) < PLAYER_SIZE / 2 + COIN_R) {
          c.collected = true;
          s.coinsCollected++;
          s.score = Math.floor(progress * 1000 * level) + s.coinsCollected * COIN_VALUE;
          setCoins(s.coinsCollected);
          resumeAudio(); playSelect();
        }
      }

      // Spikes
      for (const spike of spikes) {
        if (
          s.px + 4         < spike.x + SPIKE_W - 4 &&
          s.px + PLAYER_SIZE - 4 > spike.x + 4 &&
          s.py + PLAYER_SIZE     > spike.y + 4 &&
          s.py             < spike.y + SPIKE_H
        ) {
          s.alive = false; setDead(true); playDeath(); break;
        }
      }

      // Victory
      if (s.px + PLAYER_SIZE >= goalX) {
        s.won = true; setWon(true); playVictory();
      }
    }

    // ── DRAW ──────────────────────────────────────────────────────────────────
    const cam = s.cameraX;
    const t   = Date.now() / 1000;

    // BG gradient based on level hue
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bgGrad.addColorStop(0,   `hsl(${bgHue},60%,4%)`);
    bgGrad.addColorStop(0.6, `hsl(${(bgHue+30)%360},50%,6%)`);
    bgGrad.addColorStop(1,   `hsl(${(bgHue+60)%360},40%,3%)`);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid
    ctx.strokeStyle = `hsla(${bgHue},80%,60%,0.04)`;
    ctx.lineWidth = 1;
    for (let x = (-(cam % 60) + CANVAS_W) % 60; x < CANVAS_W; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_H; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }

    // Ground fill
    const gGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_H);
    gGrad.addColorStop(0, `hsl(${bgHue},40%,8%)`);
    gGrad.addColorStop(1, `hsl(${bgHue},30%,3%)`);
    ctx.fillStyle = gGrad;
    ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

    // Neon ground line (rainbow)
    const hue = (t * 60) % 360;
    ctx.strokeStyle = `hsl(${hue},100%,60%)`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `hsl(${hue},100%,60%)`;
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(CANVAS_W, GROUND_Y); ctx.stroke();
    ctx.shadowBlur = 0;

    // Platforms
    for (const p of platforms) {
      const px = p.x - cam;
      if (px > CANVAS_W + 20 || px + p.w < -20) continue;
      const pg = ctx.createLinearGradient(px, p.y, px, p.y + p.h);
      pg.addColorStop(0, `hsl(${bgHue+120},90%,60%)`);
      pg.addColorStop(1, `hsl(${bgHue+180},80%,40%)`);
      ctx.fillStyle = pg;
      ctx.shadowColor = `hsl(${bgHue+120},90%,60%)`;
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.roundRect(px, p.y, p.w, p.h, 4); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Spikes
    for (const spike of spikes) {
      const sx = spike.x - cam;
      if (sx > CANVAS_W + 20 || sx + SPIKE_W < -20) continue;
      ctx.shadowColor = '#FF006E'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#FF006E';
      ctx.beginPath();
      ctx.moveTo(sx + SPIKE_W / 2, spike.y);
      ctx.lineTo(sx + SPIKE_W, spike.y + SPIKE_H);
      ctx.lineTo(sx, spike.y + SPIKE_H);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FFBE0B';
      ctx.beginPath();
      ctx.moveTo(sx + SPIKE_W / 2, spike.y + 5);
      ctx.lineTo(sx + SPIKE_W - 5, spike.y + SPIKE_H);
      ctx.lineTo(sx + 5, spike.y + SPIKE_H);
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Coins
    for (const c of levelCoins) {
      if (c.collected) continue;
      const cx = c.x + COIN_R - cam;
      const cy = c.y + COIN_R;
      if (cx > CANVAS_W + 30 || cx < -30) continue;
      const spin = Math.sin(t * 3 + c.x * 0.01);
      const scaleX = Math.abs(spin);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scaleX, 1);
      ctx.shadowColor = '#FFBE0B'; ctx.shadowBlur = 12;
      const cg = ctx.createRadialGradient(0, -2, 1, 0, 0, COIN_R);
      cg.addColorStop(0, '#FFF176');
      cg.addColorStop(0.5, '#FFBE0B');
      cg.addColorStop(1, '#FB8C00');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(0, 0, COIN_R, 0, Math.PI * 2); ctx.fill();
      if (scaleX > 0.3) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `bold ${Math.round(COIN_R * 1.2)}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('₽', 0, 1);
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Goal
    const gx = goalX - cam;
    if (gx > -80 && gx < CANVAS_W + 80) {
      ctx.fillStyle = 'rgba(6,214,160,0.12)';
      ctx.fillRect(gx, 0, 70, CANVAS_H);
      const goalPulse = 0.7 + Math.sin(t * 3) * 0.3;
      ctx.strokeStyle = `rgba(6,214,160,${goalPulse})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06D6A0'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, CANVAS_H); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#06D6A0';
      ctx.font = 'bold 13px Russo One, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ФИНИШ', gx + 35, 30);
    }

    // Player
    if (s.alive) {
      const dx = s.px - cam;
      const dy = s.py;
      const pulse = Math.sin(t * 5) * 1.5;

      ctx.shadowColor = skin.color2; ctx.shadowBlur = 14 + pulse;
      const pg2 = ctx.createLinearGradient(dx, dy, dx + PLAYER_SIZE, dy + PLAYER_SIZE);
      pg2.addColorStop(0, skin.color1);
      pg2.addColorStop(1, skin.color2);
      ctx.fillStyle = pg2;
      ctx.beginPath(); ctx.roundRect(dx, dy, PLAYER_SIZE, PLAYER_SIZE, 6); ctx.fill();

      // Eye
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      const ex = dx + (s.facing > 0 ? 18 : 6);
      ctx.fillRect(ex, dy + 8, 7, 7);
      ctx.fillStyle = '#0a0010';
      ctx.fillRect(ex + (s.facing > 0 ? 2 : 1), dy + 10, 3, 3);

      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath(); ctx.roundRect(dx + 4, dy + 4, 10, 5, 2); ctx.fill();

      // Shadow
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(0,0,0,${Math.max(0, 0.3 - (GROUND_Y - dy - PLAYER_SIZE) / 300)})`;
      ctx.beginPath(); ctx.ellipse(dx + PLAYER_SIZE / 2, GROUND_Y + 3, PLAYER_SIZE / 2, 5, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Progress bar
    const prog = Math.min(1, s.px / goalX);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(20, 10, CANVAS_W - 40, 5);
    const barG = ctx.createLinearGradient(20, 0, 20 + (CANVAS_W - 40) * prog, 0);
    barG.addColorStop(0, '#FF006E'); barG.addColorStop(1, '#06D6A0');
    ctx.fillStyle = barG;
    ctx.shadowColor = '#06D6A0'; ctx.shadowBlur = 5;
    ctx.fillRect(20, 10, (CANVAS_W - 40) * prog, 5);
    ctx.shadowBlur = 0;

    rafRef.current = requestAnimationFrame(drawFrame);
  }, [level, skin]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawFrame]);

  // ── KEYBOARD ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    const dn = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft'  || e.code === 'KeyA') s.keys.left  = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault(); s.keys.jump = true;
      }
      if (e.code === 'Escape') { pausedRef.current = !pausedRef.current; setPausedState(pausedRef.current); }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft'  || e.code === 'KeyA') s.keys.left  = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') s.keys.jump = false;
    };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup',   up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  // Gyroscope (tilt mode)
  useEffect(() => {
    if (controlMode !== 'tilt') return;
    const s = stateRef.current;
    const handler = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0;
      s.keys.left  = gamma < -10;
      s.keys.right = gamma > 10;
    };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [controlMode]);

  useEffect(() => {
    if (dead) { const s = stateRef.current; setTimeout(() => onDeath(s.score, s.coinsCollected), 600); }
  }, [dead, onDeath]);

  useEffect(() => {
    if (won) { const s = stateRef.current; setTimeout(() => onVictory(s.score, s.coinsCollected), 900); }
  }, [won, onVictory]);

  const handleRestart = () => {
    const s = stateRef.current;
    Object.assign(s, {
      px: 80, py: GROUND_Y - PLAYER_SIZE, vx: 0, vy: 0,
      onGround: false, cameraX: 0, score: 0, coinsCollected: 0,
      alive: true, won: false,
      keys: { left: false, right: false, jump: false },
      jumpConsumed: false, facing: 1,
    });
    levelData.current = buildLevel(level);
    setScore(0); setCoins(0); setDead(false); setWon(false); setPaused(false);
  };

  // D-pad touch helpers
  const dpad = (key: 'left' | 'right' | 'jump', active: boolean) => {
    stateRef.current.keys[key] = active;
  };

  const showDpad = controlMode === 'dpad' || controlMode === 'tilt';

  return (
    <div className="game-screen" style={{ cursor: 'default' }}>
      <div className="game-hud">
        <div className="hud-left">
          <div className="hud-score">
            <span className="hud-label">ОЧКИ</span>
            <span className="hud-value">{score.toLocaleString()}</span>
          </div>
          <div className="hud-coins">
            <span className="coin-icon">🪙</span>
            <span className="hud-coins-val">{coins}</span>
          </div>
        </div>
        <div className="hud-center">
          <span className="hud-level">УРОВЕНЬ {level}</span>
        </div>
        <div className="hud-right">
          <button className="btn-pause" onClick={() => { playClick(); setPaused(!pausedRef.current); }}>
            <Icon name={paused ? 'Play' : 'Pause'} size={20} />
          </button>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="game-canvas" />
        {!showDpad && (
          <div className="canvas-controls">
            <span>← A / → D — ходить</span>
            <span>ПРОБЕЛ / W — прыжок</span>
            <span>ESC — пауза</span>
          </div>
        )}
      </div>

      {/* Mobile D-pad */}
      {showDpad && (
        <div className="dpad-container">
          <div className="dpad-left">
            <button
              className="dpad-btn dpad-arrow"
              onTouchStart={() => dpad('left', true)}
              onTouchEnd={() => dpad('left', false)}
              onMouseDown={() => dpad('left', true)}
              onMouseUp={() => dpad('left', false)}
              onMouseLeave={() => dpad('left', false)}
            >
              <Icon name="ChevronLeft" size={28} />
            </button>
            <button
              className="dpad-btn dpad-arrow"
              onTouchStart={() => dpad('right', true)}
              onTouchEnd={() => dpad('right', false)}
              onMouseDown={() => dpad('right', true)}
              onMouseUp={() => dpad('right', false)}
              onMouseLeave={() => dpad('right', false)}
            >
              <Icon name="ChevronRight" size={28} />
            </button>
          </div>
          <button
            className="dpad-btn dpad-jump"
            onTouchStart={() => { resumeAudio(); dpad('jump', true); }}
            onTouchEnd={() => dpad('jump', false)}
            onMouseDown={() => { resumeAudio(); dpad('jump', true); }}
            onMouseUp={() => dpad('jump', false)}
            onMouseLeave={() => dpad('jump', false)}
          >
            <Icon name="ArrowUp" size={28} />
            <span>ПРЫЖОК</span>
          </button>
        </div>
      )}

      {paused && (
        <PauseScreen
          level={level} score={score}
          onResume={() => setPaused(false)}
          onRestart={handleRestart}
          onMenu={() => { setPaused(false); onMenu(); }}
        />
      )}
    </div>
  );
}
