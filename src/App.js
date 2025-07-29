import React, { useState } from 'react';
import Game from './components/Game';
import EndScreen from './components/EndScreen';
import './App.css';

function App() {
  const [isGameOver, setIsGameOver] = useState(false);
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);

  const handlePlayAgain = () => {
    setIsGameOver(false);
    setResults([]);
    setScore(0);
  };

  const handleGameOver = (finalResults) => {
    setResults(finalResults);
    const finalScore = finalResults.reduce((acc, result) => {
        return result.guess.includes(result.prompt.toLowerCase()) ? acc + 1 : acc;
    }, 0);
    setScore(finalScore);
    setIsGameOver(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Pictionary</h1>
      </header>
      <main>
        {!isGameOver ? (
          <Game setGameOver={handleGameOver} setResults={setResults} />
        ) : (
          <EndScreen results={results} score={score} onPlayAgain={handlePlayAgain} />
        )}
      </main>
    </div>
  );
}

export default App;