import { useState } from 'react';
import MainMenu from '@/components/MainMenu';
import LevelSelect from '@/components/LevelSelect';
import GameScreen from '@/components/GameScreen';
import DeathScreen from '@/components/DeathScreen';
import VictoryScreen from '@/components/VictoryScreen';
import LeaderboardScreen from '@/components/LeaderboardScreen';
import SettingsScreen from '@/components/SettingsScreen';

type Screen = 'menu' | 'levels' | 'game' | 'death' | 'victory' | 'records' | 'settings';

const MAX_LEVEL = 6;

export default function Index() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [lastScore, setLastScore] = useState(0);
  const [bestScores, setBestScores] = useState<Record<number, number>>({});

  const bestScore = bestScores[currentLevel] ?? 0;

  const startLevel = (level: number) => {
    setCurrentLevel(level);
    setScreen('game');
  };

  const handleDeath = (score: number) => {
    setLastScore(score);
    setBestScores((prev) => ({
      ...prev,
      [currentLevel]: Math.max(prev[currentLevel] ?? 0, score),
    }));
    setScreen('death');
  };

  const handleVictory = (score: number) => {
    setLastScore(score);
    setBestScores((prev) => ({
      ...prev,
      [currentLevel]: Math.max(prev[currentLevel] ?? 0, score),
    }));
    setScreen('victory');
  };

  return (
    <div className="game-root">
      {screen === 'menu' && (
        <MainMenu
          onPlay={() => startLevel(currentLevel)}
          onLevels={() => setScreen('levels')}
          onRecords={() => setScreen('records')}
          onSettings={() => setScreen('settings')}
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
        <LeaderboardScreen
          bestScores={bestScores}
          onBack={() => setScreen('menu')}
        />
      )}
      {screen === 'settings' && (
        <SettingsScreen
          onBack={() => setScreen('menu')}
        />
      )}
    </div>
  );
}
