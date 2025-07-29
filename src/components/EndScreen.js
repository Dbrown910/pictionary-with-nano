import React from 'react';

const EndScreen = ({ results, score, onPlayAgain }) => {
  return (
    <div className="end-screen">
      <h1>Time's Up!</h1>
      <h2>Your Final Score: {score}</h2>
      <h3>Round Summary:</h3>
      <div className="results-summary">
        {results.map((result, index) => (
          <div key={index} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
            <p><strong>Prompt:</strong> {result.prompt}</p>
            <p><strong>AI's Guess:</strong> {result.guess}</p>
          </div>
        ))}
      </div>
      <button onClick={onPlayAgain} className="play-again-button">
        Play Again!
      </button>
    </div>
  );
};

export default EndScreen;
