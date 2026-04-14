import { useState } from 'react';
import MainMenu from '@/components/MainMenu';
import LevelSelect from '@/components/LevelSelect';
import GameScreen from '@/components/GameScreen';
import DeathScreen from '@/components/DeathScreen';
import VictoryScreen from '@/components/VictoryScreen';

type Screen = 'menu' | 'levels' | 'game' | 'death' | 'victory';

const MAX_LEVEL = 6;

export default function Index() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [lastScore, setLastScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const startLevel = (level: number) => {
    setCurrentLevel(level);
    setScreen('game');
  };

  const handleDeath = (score: number) => {
    setLastScore(score);
    if (score > bestScore) setBestScore(score);
    setScreen('death');
  };

  const handleVictory = (score: number) => {
    setLastScore(score);
    if (score > bestScore) setBestScore(score);
    setScreen('victory');
  };

  return (
    <div className="game-root">
      {screen === 'menu' && (
        <MainMenu
          onPlay={() => startLevel(currentLevel)}
          onLevels={() => setScreen('levels')}
        />
      )}
      {screen === 'levels' && (
        <LevelSelect
          onBack={() => setScreen('menu')}
          onSelectLevel={startLevel}
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
    </div>
  );
}
