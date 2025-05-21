import { useState, useEffect, useRef } from 'react';
import ImageReveal from './ImageReveal';
import playerData from '../utils/players.json'; // Import the player data

export default function HeadshotGame({ onBackToHome }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(100);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const timerRef = useRef(null);
  
  
  // Constants for scoring
  const totalGameTime = 37500; // 37.5 seconds in milliseconds
  const totalPointsToLose = 75; // Points to lose over the course of the game
  const pointsDeduction = totalPointsToLose / (totalGameTime / 1500); // Points to deduct per reveal
  const wrongAnswerPenalty = 10; // Points to deduct per wrong answer
  
  // Select a random player when the game starts
  useEffect(() => {
    if (gameStarted && !currentPlayer) {
      const randomIndex = Math.floor(Math.random() * playerData.length);
      const player = playerData[randomIndex];
      console.log("Selected player:", player.name);
      console.log("Headshot image path:", player.headshot);
      setCurrentPlayer(player);
    }
  }, [gameStarted, currentPlayer]);
  
  // Timer effect to reduce score as time passes
  useEffect(() => {
    if (gameStarted && currentPlayer && !hasGuessed) {
      // Clear any existing timer
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Set initial score
      setScore(100);
      
      // Start a timer that reduces score based on time
      timerRef.current = setInterval(() => {
        setScore(prevScore => {
          const newScore = Math.max(25, prevScore - pointsDeduction);
          return newScore;
        });
      }, 1500); // Same interval as image reveal
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, currentPlayer, hasGuessed]);
  
  const handleSubmitGuess = (e) => {
    if (e) e.preventDefault();
    
    if (!currentPlayer) return;
    
    // Simple case-insensitive comparison
    if (answer.toLowerCase() === currentPlayer.name.toLowerCase()) {
      // Stop the timer and end the game on correct answer
      clearInterval(timerRef.current);
      setHasGuessed(true);
      setIsCorrect(true);
    } else {
      // Wrong answer: apply penalty and increment wrong attempts
      setWrongAttempts(prev => prev + 1);
      setScore(prevScore => Math.max(25, prevScore - wrongAnswerPenalty));
      setAnswer('');
    }
  };
  
  const handleStartClick = () => {
    setGameStarted(true);
  };
  
  const handleRestartGame = () => {
    // Reset all game state
    setGameStarted(false);
    setAnswer('');
    setHasGuessed(false);
    setIsCorrect(false);
    setScore(100);
    setWrongAttempts(0);
    setCurrentPlayer(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      {/* Home button */}
      <button 
        onClick={onBackToHome}
        className="absolute top-4 left-4 text-gray-400 hover:text-white flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Home
      </button>
      
      <h2 className="text-2xl text-yellow-400 mb-4">HEADSHOT MODE</h2>
      
      {!gameStarted ? (
        <div className="flex flex-col items-center p-6 border border-gray-700 rounded bg-gray-800 max-w-md">
          <h3 className="text-xl mb-4">Ready to test your CS knowledge?</h3>
          <p className="text-gray-400 mb-6 text-center">
            Try to identify the pro player as their image is gradually revealed.
            Start with 100 points. Points decrease as time passes and for each wrong guess.
          </p>
          <button 
            onClick={handleStartClick}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded transition-colors"
          >
            START GAME
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Score display */}
          <div className="mb-4 flex items-center justify-center gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded px-4 py-2">
              <span className="text-gray-400 mr-2">Score:</span>
              <span className={`font-bold ${score > 75 ? 'text-green-400' : score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {Math.round(score)}
              </span>
            </div>
            {wrongAttempts > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded px-4 py-2">
                <span className="text-gray-400 mr-2">Wrong attempts:</span>
                <span className="font-bold text-red-400">{wrongAttempts}</span>
              </div>
            )}
          </div>
          
          {currentPlayer && (
            <ImageReveal 
              src={currentPlayer.headshot}
              totalBlocks={25} 
              interval={1500} 
            />
          )}
          
          {/* Guess input */}
          <div className="w-full mt-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter player name..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                disabled={hasGuessed || !currentPlayer}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitGuess();
                  }
                }}
              />
              <button
                onClick={handleSubmitGuess}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold"
                disabled={hasGuessed || !answer.trim() || !currentPlayer}
              >
                Submit
              </button>
            </div>
          </div>
          
          {/* Results section */}
          {hasGuessed && currentPlayer && (
            <div className={`mt-4 p-4 w-full rounded ${isCorrect ? 'bg-green-900' : 'bg-red-900'}`}>
              <h3 className="text-xl font-bold">
                {isCorrect ? 'Correct!' : 'Time\'s up!'}
              </h3>
              <p className="mt-2">
                {isCorrect 
                  ? `Great job! You correctly identified ${currentPlayer.name} with a score of ${Math.round(score)}.` 
                  : `The correct answer was ${currentPlayer.name}. Your final score: ${Math.round(score)}.`}
              </p>
              {currentPlayer.quote && (
                <p className="mt-2 italic text-sm">"{currentPlayer.quote}"</p>
              )}
              <button
                onClick={handleRestartGame}
                className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}