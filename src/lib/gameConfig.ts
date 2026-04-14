export const CANVAS_W = 900;
export const CANVAS_H = 400;
export const GROUND_Y = 320;
export const PLAYER_SIZE = 32;
export const GRAVITY = 0.55;
export const JUMP_FORCE = -13;
export const SPIKE_W = 26;
export const SPIKE_H = 26;
export const COIN_R = 10;
export const COIN_VALUE = 50;

export interface Platform { x: number; y: number; w: number; h: number }
export interface Spike    { x: number; y: number }
export interface Coin     { x: number; y: number; collected: boolean }

export interface LevelData {
  platforms: Platform[];
  spikes: Spike[];
  coins: Coin[];
  goalX: number;
  levelW: number;
  bgHue: number;
}

// Генератор секций: каждые ~300px одна секция с платформой и шипами
function section(
  baseX: number,
  gapBetweenSpikes: number,
  spikeCount: number,
  platY: number,
  platW: number,
  hasCoin: boolean
): { platforms: Platform[]; spikes: Spike[]; coins: Coin[] } {
  const platforms: Platform[] = [];
  const spikes: Spike[] = [];
  const coins: Coin[] = [];

  // Платформа
  platforms.push({ x: baseX + 60, y: platY, w: platW, h: 14 });

  // Шипы на земле
  for (let i = 0; i < spikeCount; i++) {
    spikes.push({ x: baseX + i * gapBetweenSpikes, y: GROUND_Y - SPIKE_H });
  }

  // Монета над платформой или на земле
  if (hasCoin) {
    coins.push({
      x: baseX + 60 + platW / 2 - COIN_R,
      y: platY - 36,
      collected: false,
    });
  }

  return { platforms, spikes, coins };
}

export function buildLevel(level: number): LevelData {
  // Длина уровня: 3600 + 600 за каждый уровень
  const levelW = 3600 + level * 600;
  const goalX = levelW - 160;

  const difficulty = Math.min(level, 10);
  const speed = 1 + difficulty * 0.05; // не используем, но для справки

  const platforms: Platform[] = [];
  const spikes: Spike[]       = [];
  const coins: Coin[]          = [];

  // Первые 200px — безопасная зона
  const sectionSize = 280;
  const totalSections = Math.floor((goalX - 200) / sectionSize);

  for (let i = 0; i < totalSections; i++) {
    const baseX = 200 + i * sectionSize;

    // Сложность нарастает
    const d = Math.min(10, difficulty + Math.floor(i / 4));
    const spikeCount = 1 + Math.min(3, Math.floor(d / 3));
    const gapBetweenSpikes = Math.max(36, 60 - d * 3);
    const platY = GROUND_Y - 70 - Math.floor(Math.random() * 80 + d * 5);
    const platW = Math.max(80, 140 - d * 5);
    const hasCoin = i % 2 === 0; // монета в каждой 2-й секции

    const sec = section(baseX, gapBetweenSpikes, spikeCount, platY, platW, hasCoin);
    platforms.push(...sec.platforms);

    // Фильтруем шипы которые слишком близко к финишу
    sec.spikes.filter(s => s.x < goalX - 80).forEach(s => spikes.push(s));
    sec.coins.forEach(c => coins.push(c));
  }

  // Несколько монет на земле в разных местах
  for (let i = 0; i < Math.ceil(totalSections / 3); i++) {
    const gx = 300 + i * 600 + 120;
    if (gx < goalX - 100) {
      coins.push({ x: gx, y: GROUND_Y - COIN_R * 2 - 8, collected: false });
    }
  }

  const bgHue = ((level - 1) * 36) % 360;

  return { platforms, spikes, coins, goalX, levelW, bgHue };
}

export const LEVEL_META = [
  { id: 1,  name: 'НЕОН-СТАРТ',       difficulty: 'ЛЕГКО',    color: '#06D6A0', emoji: '🌿' },
  { id: 2,  name: 'ЭЛЕКТРО-БЕЗДНА',   difficulty: 'ЛЕГКО',    color: '#3A86FF', emoji: '⚡' },
  { id: 3,  name: 'ОГНЕННЫЙ ПУТЬ',    difficulty: 'СРЕДНЕ',   color: '#FFBE0B', emoji: '🔥' },
  { id: 4,  name: 'ПЛАЗМА-ШТОРМ',     difficulty: 'СРЕДНЕ',   color: '#FF006E', emoji: '🌀' },
  { id: 5,  name: 'КИСЛОТНЫЙ РАЙ',    difficulty: 'СЛОЖНО',   color: '#8338EC', emoji: '☢️' },
  { id: 6,  name: 'АПОКАЛИПСИС',      difficulty: 'СЛОЖНО',   color: '#FB5607', emoji: '💀' },
  { id: 7,  name: 'ТЁМНАЯ ЗОНА',      difficulty: 'ЭКСПЕРТ',  color: '#E040FB', emoji: '🌑' },
  { id: 8,  name: 'ГРАВИТАЦИОННЫЙ АД', difficulty: 'ЭКСПЕРТ', color: '#FF4081', emoji: '🌪️' },
  { id: 9,  name: 'КВАНТОВЫЙ РАЗЛОМ',  difficulty: 'МАСТЕР',  color: '#00E5FF', emoji: '💠' },
  { id: 10, name: 'КОНЕЦ СВЕТА',       difficulty: 'БЕЗУМИЕ', color: '#FF1744', emoji: '🔴' },
];

export const CUBE_SKINS = [
  { id: 'default',  name: 'НЕОНОВЫЙ',   price: 0,    color1: '#FF006E', color2: '#8338EC', owned: true },
  { id: 'ocean',    name: 'ОКЕАН',      price: 100,  color1: '#3A86FF', color2: '#06D6A0', owned: false },
  { id: 'fire',     name: 'ОГОНЬ',      price: 200,  color1: '#FB5607', color2: '#FFBE0B', owned: false },
  { id: 'galaxy',   name: 'ГАЛАКТИКА',  price: 350,  color1: '#8338EC', color2: '#3A86FF', owned: false },
  { id: 'toxic',    name: 'ТОКСИЧНЫЙ',  price: 500,  color1: '#06D6A0', color2: '#FFBE0B', owned: false },
  { id: 'blood',    name: 'КРОВАВЫЙ',   price: 750,  color1: '#FF1744', color2: '#FF006E', owned: false },
];
