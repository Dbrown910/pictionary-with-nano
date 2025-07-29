import React, { useState, useEffect, useRef } from 'react';
import { wordList } from '../wordlist';

const Game = ({ setGameOver }) => {
  const [timer, setTimer] = useState(120);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [isGuessing, setIsGuessing] = useState(false);
  const [aiGuess, setAiGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [isTimerPaused, setIsTimerPaused] = useState(true);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isCameraVisible] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const localResults = useRef([]);

  // Effect for timer logic
  useEffect(() => {
    if (!isGameStarted) return;

    const countdownInterval = setInterval(() => {
      if (!isTimerPaused) {
        setTimer(prev => {
          if (prev === 1) {
            clearInterval(countdownInterval);
            endGame();
            return 0;
          }
          return prev - 1;
        });
        document.title = `Pictionary - Time Left: ${timer}s`;
      }
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [isTimerPaused, isGameStarted, timer]);

  // Effect for pre-game countdown
  useEffect(() => {
    if (showCountdown) {
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(countdownTimer);
            setShowCountdown(false);
            setIsTimerPaused(false);
            selectNewWord();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(countdownTimer);
      };
    }
  }, [showCountdown]);

  useEffect(() => {
    if (isCameraVisible) {
      startCamera();
    }
    return () => {
      if (isCameraVisible) {
        stopCamera();
      }
    };
  }, [isCameraVisible]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      alert("Could not access the camera. Please ensure you have a camera connected and have granted permission.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const selectNewWord = () => {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    setCurrentWord(wordList[randomIndex]);
  };

  const handleStartGame = () => {
    setIsGameStarted(true);
    setShowCountdown(true);
  };

  const handleGuess = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsGuessing(true);
    setIsTimerPaused(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      if (window.LanguageModel) {
        const session = await window.LanguageModel.create({
          expectedInputs: [{ type: 'image' }],
        });

        const result = await session.prompt([
          {
            role: 'user',
            content: [
              { type: 'text', value: 'Describe the main object in this drawing using only a single word.' },
              { type: 'image', value: canvasRef.current },
            ],
          },
        ]);

        const guess = result.toLowerCase().trim();
        const isGuessCorrect = guess === currentWord.toLowerCase();
        
        setAiGuess(guess);
        setIsCorrect(isGuessCorrect);
        localResults.current.push({ prompt: currentWord, guess, isCorrect: isGuessCorrect });

        if (isGuessCorrect) {
          setScore(prev => prev + 1);
        }

        setTimeout(() => {
          setAiGuess('');
          setIsCorrect(null);
          selectNewWord();
          setIsGuessing(false);
          setIsTimerPaused(false);
        }, 3000);

      } else {
        throw new Error("Built-in AI not available in this browser.");
      }
    } catch (error) {
      console.error("AI guess failed:", error);
      const failMsg = "AI failed to guess.";
      setAiGuess(failMsg);
      setIsCorrect(false);
      localResults.current.push({ prompt: currentWord, guess: "AI failed", isCorrect: false });
      
      setTimeout(() => {
        setAiGuess('');
        setIsCorrect(null);
        selectNewWord();
        setIsGuessing(false);
        setIsTimerPaused(false);
      }, 3000);
    }
  };

  const endGame = () => {
    setGameOver(localResults.current);
  };

  const getGuessClass = () => {
    if (isCorrect === null) return 'default';
    return isCorrect ? 'correct' : 'incorrect';
  };

  return (
    <>
      {showCountdown && (
        <div className="countdown-overlay">
          <h1>{countdown}</h1>
        </div>
      )}
      <div className="game-container">
        <div className="top-bar">
          <div className="timer">Time: {timer}s</div>
          <div className="score">Score: {score}</div>
        </div>
        <div className="prompt">
          <h2>Draw this: <span>{currentWord}</span></h2>
        </div>
        <div className={`ai-guess ${getGuessClass()}`}>
          AI's Guess: {' '}<strong>{aiGuess}</strong>
        </div>
        <div className={`camera-container ${isCameraVisible ? 'visible' : ''}`}>
          <video ref={videoRef} autoPlay playsInline muted></video>
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
        <div className="button-container">
          <button onClick={handleGuess} disabled={!isGameStarted || isGuessing} className="guess-button">
            {isGuessing ? 'Guessing...' : 'Guess Drawing'}
          </button>

          {!isGameStarted ? (
            <button onClick={handleStartGame} className="start-game-button">
              Start Game
            </button>
          ) : (
            <button onClick={endGame} className="end-game-button">
              End Game
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Game;