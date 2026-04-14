import { useState } from 'react';
import MainMenu from '@/components/MainMenu';
import LevelSelect from '@/components/LevelSelect';
import GameScreen from '@/components/GameScreen';
import DeathScreen from '@/components/DeathScreen';
import VictoryScreen from '@/components/VictoryScreen';
import LeaderboardScreen from '@/components/LeaderboardScreen';
import SettingsScreen, { type ControlMode } from '@/components/SettingsScreen';
import ShopScreen from '@/components/ShopScreen';

type Screen = 'menu' | 'levels' | 'game' | 'death' | 'victory' | 'records' | 'settings' | 'shop';

const MAX_LEVEL = 10;

export default function Index() {
  const [screen, setScreen]         = useState<Screen>('menu');
  const [currentLevel, setLevel]    = useState(1);
  const [lastScore, setLastScore]   = useState(0);
  const [bestScores, setBestScores] = useState<Record<number, number>>({});

  // Coins & skins
  const [totalCoins, setTotalCoins] = useState(0);
  const [ownedSkins, setOwnedSkins] = useState<string[]>(['default']);
  const [activeSkin, setActiveSkin] = useState('default');

  // Settings
  const [controlMode, setControlMode] = useState<ControlMode>('keyboard');

  const bestScore = bestScores[currentLevel] ?? 0;

  const startLevel = (level: number) => { setLevel(level); setScreen('game'); };

  const handleDeath = (score: number, coins: number) => {
    setLastScore(score);
    setTotalCoins(c => c + coins);
    setBestScores(p => ({ ...p, [currentLevel]: Math.max(p[currentLevel] ?? 0, score) }));
    setScreen('death');
  };

  const handleVictory = (score: number, coins: number) => {
    setLastScore(score);
    setTotalCoins(c => c + coins);
    setBestScores(p => ({ ...p, [currentLevel]: Math.max(p[currentLevel] ?? 0, score) }));
    setScreen('victory');
  };

  const handleBuySkin = (skinId: string, price: number) => {
    setTotalCoins(c => c - price);
    setOwnedSkins(s => [...s, skinId]);
    setActiveSkin(skinId);
  };

  return (
    <div className="game-root">
      {screen === 'menu' && (
        <MainMenu
          onPlay={() => startLevel(currentLevel)}
          onLevels={() => setScreen('levels')}
          onRecords={() => setScreen('records')}
          onSettings={() => setScreen('settings')}
          onShop={() => setScreen('shop')}
          totalCoins={totalCoins}
        />
      )}
      {screen === 'levels' && (
        <LevelSelect
          onBack={() => setScreen('menu')}
          onSelectLevel={startLevel}
          bestScores={bestScores}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          key={`level-${currentLevel}-${screen}`}
          level={currentLevel}
          onDeath={handleDeath}
          onVictory={handleVictory}
          onMenu={() => setScreen('menu')}
          skinId={activeSkin}
          controlMode={controlMode}
        />
      )}
      {screen === 'death' && (
        <DeathScreen
          level={currentLevel}
          score={lastScore}
          bestScore={bestScore}
          onRestart={() => startLevel(currentLevel)}
          onMenu={() => setScreen('menu')}
          onLevels={() => setScreen('levels')}
        />
      )}
      {screen === 'victory' && (
        <VictoryScreen
          level={currentLevel}
          score={lastScore}
          bestScore={bestScore}
          hasNextLevel={currentLevel < MAX_LEVEL}
          onNextLevel={() => startLevel(currentLevel + 1)}
          onRestart={() => startLevel(currentLevel)}
          onMenu={() => setScreen('menu')}
          onLevels={() => setScreen('levels')}
        />
      )}
      {screen === 'records' && (
        <LeaderboardScreen bestScores={bestScores} onBack={() => setScreen('menu')} />
      )}
      {screen === 'settings' && (
        <SettingsScreen
          onBack={() => setScreen('menu')}
          controlMode={controlMode}
          onControlModeChange={setControlMode}
        />
      )}
      {screen === 'shop' && (
        <ShopScreen
          totalCoins={totalCoins}
          ownedSkins={ownedSkins}
          activeSkin={activeSkin}
          onBuy={handleBuySkin}
          onSelect={setActiveSkin}
          onBack={() => setScreen('menu')}
        />
      )}
    </div>
  );
}
