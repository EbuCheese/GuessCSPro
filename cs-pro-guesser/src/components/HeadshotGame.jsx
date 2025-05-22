import { useState, useEffect, useRef } from 'react';
import ImageReveal from './ImageReveal';
import playerData from '../utils/players.json'; // Import the player data

export default function HeadshotGame({ onBackToHome }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentRoundScore, setCurrentRoundScore] = useState(100);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Mult-rounds
  const [currentRound, setCurrentRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [usedPlayerIds, setUsedPlayerIds] = useState(new Set());
  const [roundResults, setRoundResults] = useState([]);

  const timerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const inputRef = useRef(null);
  const nextRoundButtonRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per round

  // Constants for scoring
  const maxRounds = 10;
  const timePerRound = 30000; // 30 seconds in milliseconds
  const baseScore = 100;
  const timeDecayRate = 2; // Points lost per second
  const wrongAnswerPenalty = 15; // Increased penalty for wrong answers
  const minScore = 10; // Minimum score per round
  
  // Helper function to normalize names for comparison
  const normalizeNameForComparison = (name) => {
    return name.toLowerCase()
      .replace(/0/g, 'o')  // Replace 0 with o
      .replace(/1/g, 'i')  // Replace 1 with i
      .replace(/3/g, 'e')  // Replace 3 with e
      .replace(/4/g, 'a')  // Replace 4 with a
      .replace(/5/g, 's')  // Replace 5 with s
      .replace(/7/g, 't')  // Replace 7 with t
      .trim();
  };


  // Enhanced answer checking function
  const checkAnswer = (userAnswer, correctName) => {
    const normalizedUser = normalizeNameForComparison(userAnswer);
    const normalizedCorrect = normalizeNameForComparison(correctName);
    
    // Direct match
    if (normalizedUser === normalizedCorrect) return true;
    
    // Check if user input is contained in correct name (for partial matches)
    if (normalizedCorrect.includes(normalizedUser) && normalizedUser.length > 2) return true;
    
    // Check if correct name is contained in user input (for cases where user types too much)
    if (normalizedUser.includes(normalizedCorrect) && normalizedCorrect.length > 2) return true;
    
    // Check without any special characters or spaces
    const cleanUser = normalizedUser.replace(/[^a-z]/g, '');
    const cleanCorrect = normalizedCorrect.replace(/[^a-z]/g, '');
    
    if (cleanUser === cleanCorrect) return true;
    if (cleanCorrect.includes(cleanUser) && cleanUser.length > 2) return true;
    if (cleanUser.includes(cleanCorrect) && cleanCorrect.length > 2) return true;
    
    return false;
  };


  // Handle Enter key for next round button
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && showRoundSummary && nextRoundButtonRef.current) {
        handleNextRound();
      }
    };

    if (showRoundSummary) {
      document.addEventListener('keydown', handleKeyPress);
      // Focus the next round button for better UX
      if (nextRoundButtonRef.current) {
        nextRoundButtonRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [showRoundSummary]);


  // Focus input whenever it should be active - simplified dependencies
  useEffect(() => {
    const shouldFocus = gameStarted && !hasGuessed && !showRoundSummary && !gameComplete;
    if (shouldFocus && inputRef.current) {
      // Use setTimeout to ensure focus happens after any re-renders
      const focusTimeout = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(focusTimeout);
    }
  });

  // Additional focus trigger for wrong answers and round starts
  useEffect(() => {
    if (gameStarted && !hasGuessed && !showRoundSummary && !gameComplete && imageLoaded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentRound, wrongAttempts, imageLoaded]);
  
  // Select a random unused player when a new round starts
  useEffect(() => {
    if (gameStarted && !currentPlayer && currentRound <= maxRounds) {
      selectRandomPlayer();
    }
  }, [gameStarted, currentPlayer, currentRound]);
  
  // Handle image loading state changes
  useEffect(() => {
    if (currentPlayer) {
      setImageLoaded(false); // Reset image loaded state when new player is selected
    }
  }, [currentPlayer]);

  const selectRandomPlayer = () => {
    const availablePlayers = playerData.filter((_, index) => !usedPlayerIds.has(index));
    
    if (availablePlayers.length === 0) {
      // If we've used all players, reset the used set (shouldn't happen with 10 rounds)
      setUsedPlayerIds(new Set());
      const randomIndex = Math.floor(Math.random() * playerData.length);
      const player = playerData[randomIndex];
      setCurrentPlayer(player);
      setUsedPlayerIds(new Set([randomIndex]));
    } else {
      const randomIndex = Math.floor(Math.random() * availablePlayers.length);
      const selectedPlayer = availablePlayers[randomIndex];
      const originalIndex = playerData.findIndex(p => p === selectedPlayer);
      
      setCurrentPlayer(selectedPlayer);
      setUsedPlayerIds(prev => new Set([...prev, originalIndex]));
    }
    
    console.log(`Round ${currentRound} - Selected player:`, currentPlayer?.name);
  };

  // Timer effect for round countdown and scoring
  useEffect(() => {
    if (gameStarted && currentPlayer && !hasGuessed && !gameComplete && imageLoaded) {
      // Reset round state
      setCurrentRoundScore(baseScore);
      setTimeLeft(30);
      setWrongAttempts(0);
      
      // Clear any existing timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      
      // Main game timer (1 second intervals) - only starts when image is loaded
      gameTimerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            handleTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
        
        setCurrentRoundScore(prevScore => {
          const newScore = Math.max(minScore, prevScore - timeDecayRate);
          return newScore;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [gameStarted, currentPlayer, hasGuessed, currentRound, imageLoaded]); 
  

  const handleTimeUp = () => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    setHasGuessed(true);
    setIsCorrect(false);
    
    // Add result to round results
    const roundResult = {
      round: currentRound,
      playerName: currentPlayer.name,
      score: 0, // No points for time up
      isCorrect: false,
      wrongAttempts: wrongAttempts,
      timeUsed: 30
    };
    
    setRoundResults(prev => [...prev, roundResult]);
    setShowRoundSummary(true);
  };

   const handleSubmitGuess = (e) => {
    if (e) e.preventDefault();
    
    if (!currentPlayer || hasGuessed) return;
    
    // Use enhanced answer checking
    if (checkAnswer(answer, currentPlayer.name)) {
      // Correct answer
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      setHasGuessed(true);
      setIsCorrect(true);
      
      const timeBonus = Math.floor(timeLeft * 2);
      const finalScore = Math.max(minScore, Math.floor(currentRoundScore + timeBonus));
      setCurrentRoundScore(finalScore);
      
      const roundResult = {
        round: currentRound,
        playerName: currentPlayer.name,
        score: finalScore,
        isCorrect: true,
        wrongAttempts: wrongAttempts,
        timeUsed: 30 - timeLeft
      };
      
      setRoundResults(prev => [...prev, roundResult]);
      setTotalScore(prev => prev + finalScore);
      setShowRoundSummary(true);
    } else {
      // Wrong answer
      setWrongAttempts(prev => prev + 1);
      setCurrentRoundScore(prevScore => Math.max(minScore, prevScore - wrongAnswerPenalty));
      setAnswer('');
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };
  
  const handleNextRound = () => {
    if (currentRound >= maxRounds) {
      setGameComplete(true);
      setShowRoundSummary(false);
    } else {
      setCurrentRound(prev => prev + 1);
      setCurrentPlayer(null);
      setAnswer('');
      setHasGuessed(false);
      setIsCorrect(false);
      setShowRoundSummary(false);
      setImageLoaded(false); // Reset image loaded state for next round
    }
  };

  const handleStartClick = () => {
    setGameStarted(true);
  };
  
  const handleRestartGame = () => {
    // Clear timers first
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    
    // Reset all game state
    setGameStarted(false);
    setAnswer('');
    setHasGuessed(false);
    setIsCorrect(false);
    setCurrentRoundScore(baseScore);
    setWrongAttempts(0);
    setCurrentPlayer(null);
    setGameComplete(false);
    setShowRoundSummary(false);
    setCurrentRound(1);
    setTotalScore(0);
    setUsedPlayerIds(new Set());
    setRoundResults([]);
    setTimeLeft(30);
    setImageLoaded(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full relative min-h-screen">
      {/* Home button */}
      <button 
        onClick={onBackToHome}
        className="absolute top-4 left-4 text-gray-400 hover:text-white flex items-center z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Home
      </button>
      
      <h2 className="text-3xl text-yellow-400 mb-6 font-bold">HEADSHOT MODE</h2>
      
      {!gameStarted ? (
        <div className="flex flex-col items-center p-8 border border-gray-700 rounded-lg bg-gray-800 max-w-lg">
          <h3 className="text-2xl mb-4 text-white">Ready for the Challenge?</h3>
          <div className="text-gray-300 mb-6 text-center space-y-2">
            <p>🎯 <strong>10 rounds</strong> of CS pro identification</p>
            <p>⏱️ <strong>30 seconds</strong> per round</p>
            <p>💯 Start with <strong>100 points</strong> each round</p>
            <p>⚡ <strong>Time bonus</strong> for quick answers</p>
            <p>❌ <strong>-15 points</strong> for wrong guesses</p>
          </div>
          <button 
            onClick={handleStartClick}
            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-lg rounded-lg transition-all transform hover:scale-105"
          >
            START 10-ROUND CHALLENGE
          </button>
        </div>
      ) : gameComplete ? (
        <div className="flex flex-col items-center w-full max-w-4xl">
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-8 rounded-lg border border-gray-600 w-full">
            <h3 className="text-3xl font-bold mb-6 text-center text-yellow-400">
              🏆 CHALLENGE COMPLETE! 🏆
            </h3>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-white mb-2">{totalScore}</div>
              <div className="text-xl text-gray-300">Total Score</div>
              <div className="text-lg text-gray-400">
                Average: {Math.round(totalScore / maxRounds)} points per round
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {roundResults.map((result, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-yellow-400">Round {result.round}</span>
                    <span className={`font-bold ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {result.score} pts
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">{result.playerName}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {result.isCorrect ? `✓ ${result.timeUsed}s` : '✗ Time up'} 
                    {result.wrongAttempts > 0 && ` • ${result.wrongAttempts} wrong`}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <button
                onClick={handleRestartGame}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-lg transition-all mr-4"
              >
                Play Again
              </button>
              <button
                onClick={onBackToHome}
                className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold text-lg rounded-lg transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      ) : showRoundSummary ? (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className={`p-6 w-full rounded-lg ${isCorrect ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'} border`}>
            <h3 className="text-2xl font-bold text-center mb-4">
              Round {currentRound} {isCorrect ? 'Complete!' : 'Failed'}
            </h3>
            
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-2">
                {isCorrect ? `+${currentRoundScore}` : '0'} pts
              </div>
              <div className="text-lg text-gray-300">
                Player: <strong>{currentPlayer?.name}</strong>
              </div>
              {isCorrect && (
                <div className="text-sm text-gray-400 mt-2">
                  Solved in {30 - timeLeft} seconds
                  {wrongAttempts > 0 && ` • ${wrongAttempts} wrong attempts`}
                </div>
              )}
            </div>
            
            <div className="text-center text-gray-400 mb-4">
              <div>Total Score: <strong className="text-white">{totalScore}</strong></div>
              <div>Round {currentRound} of {maxRounds}</div>
            </div>
            
            <button
              ref={nextRoundButtonRef}
              onClick={handleNextRound}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currentRound >= maxRounds ? 'View Final Results' : 'Next Round'} 
              <span className="text-sm text-gray-300 ml-2">(Press Enter)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Game status header */}
          <div className="mb-6 flex items-center justify-between w-full bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-center">
              <div className="text-sm text-gray-400">Round</div>
              <div className="text-xl font-bold text-yellow-400">{currentRound}/{maxRounds}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Time</div>
              <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : imageLoaded ? 'text-white' : 'text-gray-500'}`}>
                {imageLoaded ? `${timeLeft}s` : 'Loading...'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Score</div>
              <div className={`text-xl font-bold ${currentRoundScore > 75 ? 'text-green-400' : currentRoundScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {Math.round(currentRoundScore)}
              </div>
            </div>
          </div>
          
          {/* Total score display */}
          <div className="mb-4 bg-gray-800 border border-gray-700 rounded px-4 py-2">
            <span className="text-gray-400 mr-2">Total Score:</span>
            <span className="font-bold text-white text-lg">{totalScore}</span>
          </div>
          
          {/* Wrong attempts counter */}
          {wrongAttempts > 0 && (
            <div className="mb-4 bg-red-900 border border-red-600 rounded px-4 py-2">
              <span className="text-red-200 mr-2">Wrong attempts:</span>
              <span className="font-bold text-red-400">{wrongAttempts}</span>
            </div>
          )}
          
          {currentPlayer && (
            <ImageReveal 
              src={currentPlayer.headshot}
              totalBlocks={25} 
              interval={1200}
              key={currentPlayer.name}
              onImageLoaded={setImageLoaded} // Pass callback to handle image loading
            />
          )}
          
          {/* Guess input */}
          <div className="w-full mt-6">
            <form onSubmit={handleSubmitGuess} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={imageLoaded ? "Enter player name..." : "Loading image..."}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-blue-500 focus:outline-none"
                disabled={hasGuessed || !currentPlayer || !imageLoaded}
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={hasGuessed || !answer.trim() || !currentPlayer || !imageLoaded}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}