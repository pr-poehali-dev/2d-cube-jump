import { useEffect, useRef, useState, useCallback } from 'react';
import { playJump, playDeath, playVictory, playClick, resumeAudio } from '@/lib/sounds';
import PauseScreen from './PauseScreen';
import Icon from '@/components/ui/icon';

interface Props {
  level: number;
  onDeath: (score: number) => void;
  onVictory: (score: number) => void;
  onMenu: () => void;
}

const CANVAS_W = 900;
const CANVAS_H = 400;
const GROUND_Y = 320;
const PLAYER_SIZE = 32;
const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const MOVE_SPEED = 4;
const SPIKE_W = 28;
const SPIKE_H = 28;

interface Spike {
  x: number;
  y: number;
}

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

function buildLevel(level: number): { spikes: Spike[]; platforms: Platform[]; goalX: number; levelW: number } {
  const levelW = 2400 + level * 400;
  const goalX = levelW - 120;

  const platforms: Platform[] = [
    { x: 300, y: GROUND_Y - 80, w: 120, h: 16 },
    { x: 500, y: GROUND_Y - 140, w: 100, h: 16 },
    { x: 700, y: GROUND_Y - 80, w: 120, h: 16 },
    { x: 950, y: GROUND_Y - 160, w: 140, h: 16 },
    { x: 1200, y: GROUND_Y - 100, w: 100, h: 16 },
    { x: 1400, y: GROUND_Y - 60, w: 120, h: 16 },
    { x: 1650, y: GROUND_Y - 140, w: 100, h: 16 },
    { x: 1900, y: GROUND_Y - 100, w: 140, h: 16 },
    { x: 2100, y: GROUND_Y - 160, w: 120, h: 16 },
    { x: 2300, y: GROUND_Y - 80, w: 100, h: 16 },
  ];

  const spikePositions = [220, 420, 620, 840, 1100, 1330, 1570, 1780, 2000, 2200];
  const spikes: Spike[] = spikePositions
    .filter((x) => x < goalX - 60)
    .map((x) => ({ x, y: GROUND_Y - SPIKE_H }));

  return { spikes, platforms, goalX, levelW };
}

export default function GameScreen({ level, onDeath, onVictory, onMenu }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    px: 80,
    py: GROUND_Y - PLAYER_SIZE,
    vx: 0,
    vy: 0,
    onGround: false,
    cameraX: 0,
    score: 0,
    alive: true,
    won: false,
    keys: { left: false, right: false, jump: false },
    jumpConsumed: false,
  });
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);

  const [paused, setPausedState] = useState(false);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);

  const levelData = useRef(buildLevel(level));

  const setPaused = useCallback((val: boolean) => {
    pausedRef.current = val;
    setPausedState(val);
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const { spikes, platforms, goalX, levelW } = levelData.current;

    if (!pausedRef.current && s.alive && !s.won) {
      // Movement
      s.vx = 0;
      if (s.keys.left) s.vx = -MOVE_SPEED;
      if (s.keys.right) s.vx = MOVE_SPEED;

      // Jump
      if (s.keys.jump && !s.jumpConsumed && s.onGround) {
        s.vy = JUMP_FORCE;
        s.onGround = false;
        s.jumpConsumed = true;
        resumeAudio();
        playJump();
      }
      if (!s.keys.jump) s.jumpConsumed = false;

      // Gravity
      s.vy += GRAVITY;
      s.py += s.vy;
      s.px += s.vx;

      // Clamp X
      s.px = Math.max(0, Math.min(s.px, levelW - PLAYER_SIZE));

      // Ground collision
      s.onGround = false;
      if (s.py >= GROUND_Y - PLAYER_SIZE) {
        s.py = GROUND_Y - PLAYER_SIZE;
        s.vy = 0;
        s.onGround = true;
      }

      // Platform collision
      for (const p of platforms) {
        const feet = s.py + PLAYER_SIZE;
        const prevFeet = feet - s.vy;
        const inX = s.px + PLAYER_SIZE > p.x && s.px < p.x + p.w;
        if (inX && prevFeet <= p.y + 2 && feet >= p.y && s.vy >= 0) {
          s.py = p.y - PLAYER_SIZE;
          s.vy = 0;
          s.onGround = true;
        }
      }

      // Camera
      const targetCam = s.px - CANVAS_W / 3;
      s.cameraX += (targetCam - s.cameraX) * 0.1;
      s.cameraX = Math.max(0, Math.min(s.cameraX, levelW - CANVAS_W));

      // Score
      s.score += 0.1;
      setScore(Math.floor(s.score));

      // Spike collision
      for (const spike of spikes) {
        const sx = spike.x - s.cameraX;
        if (
          s.px < spike.x + SPIKE_W &&
          s.px + PLAYER_SIZE > spike.x &&
          s.py + PLAYER_SIZE > spike.y &&
          s.py < spike.y + SPIKE_H
        ) {
          s.alive = false;
          setDead(true);
          playDeath();
          break;
        }
      }

      // Victory
      if (s.px + PLAYER_SIZE >= goalX) {
        s.won = true;
        setWon(true);
        playVictory();
      }
    }

    // === DRAW ===
    const cam = s.cameraX;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bgGrad.addColorStop(0, '#050010');
    bgGrad.addColorStop(0.6, '#0d0030');
    bgGrad.addColorStop(1, '#000820');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid lines
    ctx.strokeStyle = 'rgba(58,134,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = (-cam % 60); x < CANVAS_W; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_H; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }

    // Ground
    const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_H);
    groundGrad.addColorStop(0, '#1a003a');
    groundGrad.addColorStop(1, '#0a0020');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

    // Ground neon line
    const t = Date.now() / 1000;
    const hue = (t * 60) % 360;
    ctx.strokeStyle = `hsl(${hue},100%,60%)`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `hsl(${hue},100%,60%)`;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_W, GROUND_Y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Platforms
    for (const p of platforms) {
      const px = p.x - cam;
      if (px > CANVAS_W + 10 || px + p.w < -10) continue;
      const platGrad = ctx.createLinearGradient(px, p.y, px, p.y + p.h);
      platGrad.addColorStop(0, '#3A86FF');
      platGrad.addColorStop(1, '#8338EC');
      ctx.fillStyle = platGrad;
      ctx.shadowColor = '#3A86FF';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(px, p.y, p.w, p.h, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Spikes
    for (const spike of spikes) {
      const sx = spike.x - cam;
      if (sx > CANVAS_W + 10 || sx + SPIKE_W < -10) continue;
      ctx.shadowColor = '#FF006E';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#FF006E';
      ctx.beginPath();
      ctx.moveTo(sx + SPIKE_W / 2, spike.y);
      ctx.lineTo(sx + SPIKE_W, spike.y + SPIKE_H);
      ctx.lineTo(sx, spike.y + SPIKE_H);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FFBE0B';
      ctx.beginPath();
      ctx.moveTo(sx + SPIKE_W / 2, spike.y + 4);
      ctx.lineTo(sx + SPIKE_W - 6, spike.y + SPIKE_H);
      ctx.lineTo(sx + 6, spike.y + SPIKE_H);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Goal
    const gx = goalX - cam;
    if (gx > -60 && gx < CANVAS_W + 60) {
      ctx.fillStyle = 'rgba(6,214,160,0.15)';
      ctx.fillRect(gx, 0, 60, CANVAS_H);
      ctx.strokeStyle = '#06D6A0';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06D6A0';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, CANVAS_H);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#06D6A0';
      ctx.font = 'bold 14px Russo One, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ФИНИШ', gx + 30, 40);
    }

    // Player
    if (s.alive) {
      const drawX = s.px - cam;
      const drawY = s.py;
      const pulse = Math.sin(Date.now() / 150) * 2;

      ctx.shadowColor = '#8338EC';
      ctx.shadowBlur = 16 + pulse;
      const playerGrad = ctx.createLinearGradient(drawX, drawY, drawX + PLAYER_SIZE, drawY + PLAYER_SIZE);
      playerGrad.addColorStop(0, '#FF006E');
      playerGrad.addColorStop(1, '#8338EC');
      ctx.fillStyle = playerGrad;
      ctx.beginPath();
      ctx.roundRect(drawX, drawY, PLAYER_SIZE, PLAYER_SIZE, 6);
      ctx.fill();

      // Eyes
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      const eyeDir = s.vx >= 0 ? 1 : -1;
      const eyeX = drawX + (eyeDir > 0 ? 18 : 8);
      ctx.fillRect(eyeX, drawY + 8, 6, 6);
      ctx.fillStyle = '#0a0010';
      ctx.fillRect(eyeX + (eyeDir > 0 ? 2 : 0), drawY + 10, 3, 3);

      // Shadow on ground
      const shadowY = GROUND_Y + 2;
      const shadowAlpha = Math.max(0, 1 - (shadowY - drawY - PLAYER_SIZE) / 200);
      ctx.fillStyle = `rgba(131,56,236,${shadowAlpha * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(drawX + PLAYER_SIZE / 2, shadowY, PLAYER_SIZE / 2, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Progress bar
    const progress = Math.min(s.px / goalX, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(20, 10, CANVAS_W - 40, 4);
    const barGrad = ctx.createLinearGradient(20, 0, 20 + (CANVAS_W - 40) * progress, 0);
    barGrad.addColorStop(0, '#FF006E');
    barGrad.addColorStop(1, '#06D6A0');
    ctx.fillStyle = barGrad;
    ctx.shadowColor = '#06D6A0';
    ctx.shadowBlur = 6;
    ctx.fillRect(20, 10, (CANVAS_W - 40) * progress, 4);
    ctx.shadowBlur = 0;

    rafRef.current = requestAnimationFrame(drawFrame);
  }, [level]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawFrame]);

  // Keys
  useEffect(() => {
    const s = stateRef.current;
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        s.keys.jump = true;
      }
      if (e.code === 'Escape') {
        pausedRef.current = !pausedRef.current;
        setPausedState(pausedRef.current);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') s.keys.jump = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // React to dead/won
  useEffect(() => {
    if (dead) {
      const s = stateRef.current;
      setTimeout(() => onDeath(Math.floor(s.score)), 600);
    }
  }, [dead, onDeath]);

  useEffect(() => {
    if (won) {
      const s = stateRef.current;
      setTimeout(() => onVictory(Math.floor(s.score)), 1000);
    }
  }, [won, onVictory]);

  const handlePauseBtn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPausedState(next);
    playClick();
  };

  const handleRestart = () => {
    const s = stateRef.current;
    s.px = 80; s.py = GROUND_Y - PLAYER_SIZE;
    s.vx = 0; s.vy = 0;
    s.onGround = false; s.cameraX = 0;
    s.score = 0; s.alive = true; s.won = false;
    s.keys = { left: false, right: false, jump: false };
    s.jumpConsumed = false;
    levelData.current = buildLevel(level);
    setScore(0); setDead(false); setWon(false);
    setPaused(false);
  };

  return (
    <div className="game-screen" style={{ cursor: 'default' }}>
      <div className="game-hud">
        <div className="hud-left">
          <div className="hud-score">
            <span className="hud-label">ОЧКИ</span>
            <span className="hud-value">{score.toLocaleString()}</span>
          </div>
        </div>
        <div className="hud-center">
          <span className="hud-level">УРОВЕНЬ {level}</span>
        </div>
        <div className="hud-right">
          <button className="btn-pause" onClick={handlePauseBtn}>
            <Icon name={paused ? 'Play' : 'Pause'} size={20} />
          </button>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="game-canvas"
        />
        <div className="canvas-controls">
          <span>← A / → D — ходить</span>
          <span>ПРОБЕЛ / W / ↑ — прыжок</span>
          <span>ESC — пауза</span>
        </div>
      </div>

      {paused && (
        <PauseScreen
          level={level}
          score={score}
          onResume={() => setPaused(false)}
          onRestart={handleRestart}
          onMenu={() => { setPaused(false); onMenu(); }}
        />
      )}
    </div>
  );
}
