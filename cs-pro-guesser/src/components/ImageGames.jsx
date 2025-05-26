import { useState, useEffect, useRef } from 'react';
import ImageReveal from './ImageReveal';

export default function ImageGames({ onBackToHome, initialGameMode  }) {
  const [gameMode, setGameMode] = useState(initialGameMode || null);
  const [gameStarted, setGameStarted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentRoundScore, setCurrentRoundScore] = useState(100);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Multi-rounds
  const [currentRound, setCurrentRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [usedPlayerIds, setUsedPlayerIds] = useState([]);
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
    if (gameStarted && !hasGuessed && !showRoundSummary && !gameComplete && imageLoaded && inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [currentRound, wrongAttempts, imageLoaded, loading]);
  
  // Select a random unused player when a new round starts
  useEffect(() => {
    if (gameStarted && !currentPlayer && currentRound <= maxRounds) {
      selectRandomPlayer();
    }
  }, [gameStarted, currentPlayer, currentRound, gameMode]);
  
  // Handle image loading state changes
  useEffect(() => {
    if (currentPlayer) {
      setImageLoaded(false); // Reset image loaded state when new player is selected
    }
  }, [currentPlayer]);

  const selectRandomPlayer = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Send used player IDs to backend to get a unique player
      const response = await fetch('http://localhost:3000/api/ImageGameRounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usedPlayerIds, gameMode })
      });
      
      if (!response.ok) throw new Error('Failed to fetch player');
      
      const playerData = await response.json();
      
      // Add this player ID to the used list
      setUsedPlayerIds(prev => [...prev, playerData.id]);
      setCurrentPlayer(playerData);
      
      // For free-for-all mode, set the selected random image URL
      if (gameMode === 'free-for-all' && playerData.selectedImageUrl) {
        setCurrentImageUrl(playerData.selectedImageUrl);
      } else {
        setCurrentImageUrl(null); // Use headshot for headshot mode
      }

      console.log(`Round ${currentRound} - Selected player ID:`, playerData.id);
      if (gameMode === 'free-for-all') {
        console.log('Selected image URL:', playerData.selectedImageUrl);
      }
    } catch (err) {
      console.error('Error selecting player:', err);
      setError('Failed to load player. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Timer effect for round countdown and scoring
  useEffect(() => {
    if (gameStarted && currentPlayer && !hasGuessed && !gameComplete && imageLoaded && !loading) {
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
  }, [gameStarted, currentPlayer, hasGuessed, currentRound, imageLoaded, loading]);

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
    
    if (!currentPlayer || hasGuessed || loading) return;
    
    // Use enhanced answer checking with the player name from API
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
      setCurrentImageUrl(null);
      setAnswer('');
      setHasGuessed(false);
      setIsCorrect(false);
      setShowRoundSummary(false);
      setImageLoaded(false); 
    }
  };

  const handleModeSelect = (mode) => {
    setGameMode(mode);
    setGameStarted(true);
  };
  
  const handleRestartGame = () => {
    // Clear timers first
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    
    // Reset all game state
    setGameMode(null);
    setGameStarted(false);
    setAnswer('');
    setHasGuessed(false);
    setIsCorrect(false);
    setCurrentRoundScore(baseScore);
    setWrongAttempts(0);
    setCurrentPlayer(null);
    setCurrentImageUrl(null);
    setGameComplete(false);
    setShowRoundSummary(false);
    setCurrentRound(1);
    setTotalScore(0);
    setUsedPlayerIds([]);
    setRoundResults([]);
    setTimeLeft(30);
    setImageLoaded(false);
    setLoading(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* CS2 Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 30% 70%, rgba(255, 107, 53, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(52, 152, 219, 0.05) 0%, transparent 50%),
            linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0a0e1a 100%)
          `
        }}
      />

      {/* Back Button */}
      <button 
        onClick={onBackToHome}
        className="absolute top-6 left-6 flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/80 backdrop-blur-sm hover:border-orange-500 hover:bg-gray-700/80 transition-all duration-300 z-20 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-orange-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <span 
          className="text-gray-300 group-hover:text-white font-semibold transition-colors"
          style={{ fontFamily: '"Rajdhani", sans-serif' }}
        >
          HOME
        </span>
      </button>

      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center justify-center min-h-screen">
        {/* Header - Only show when NOT in game complete state */}
        {!gameComplete && (
          <div className="text-center mb-12">
            <h2 
              className="text-5xl font-black mb-4 tracking-wider"
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                background: gameMode === 'free-for-all' 
                  ? 'linear-gradient(45deg, #8E44AD, #3498DB)' 
                  : gameMode === 'headshot' 
                    ? 'linear-gradient(45deg, #FF6B35, #F39C12)'
                    : 'linear-gradient(45deg, #FF6B35, #F39C12)', // default to orange for mode selection
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: gameMode === 'free-for-all' 
                  ? '0 0 20px rgba(142, 68, 173, 0.3)' 
                  : '0 0 20px rgba(255, 107, 53, 0.3)',
                filter: gameMode === 'free-for-all' 
                  ? 'drop-shadow(0 0 8px rgba(142, 68, 173, 0.2))' 
                  : 'drop-shadow(0 0 8px rgba(255, 107, 53, 0.2))'
              }}
            >
              {gameMode === 'headshot' ? 'HEADSHOT MODE' : 
               gameMode === 'free-for-all' ? 'FREE-FOR-ALL MODE' : 
               'PLAYER IDENTIFICATION'}
            </h2>
            
            <div className="flex items-center justify-center space-x-4">
              <div 
                className="h-px bg-gradient-to-r from-transparent to-transparent w-32"
                style={{
                  background: gameMode === 'free-for-all' 
                    ? 'linear-gradient(to right, transparent, #8E44AD, transparent)' 
                    : 'linear-gradient(to right, transparent, #FF6B35, transparent)'
                }}
              ></div>
              <div 
                className="text-xl"
                style={{
                  color: gameMode === 'free-for-all' ? '#8E44AD' : '#FF6B35'
                }}
              >
                ⚡
              </div>
              <div 
                className="h-px bg-gradient-to-r from-transparent to-transparent w-32"
                style={{
                  background: gameMode === 'free-for-all' 
                    ? 'linear-gradient(to right, transparent, #8E44AD, transparent)' 
                    : 'linear-gradient(to right, transparent, #FF6B35, transparent)'
                }}
              ></div>
            </div>
          </div>
        )}

        {!gameStarted ? (
  <div className="flex flex-col items-center space-y-8 w-full">
    {/* Challenge Rules */}
    <div 
      className="p-8 rounded-lg border border-gray-700 max-w-2xl w-full mx-auto flex flex-col justify-center items-center"
      style={{
        background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.9) 0%, rgba(45, 55, 72, 0.7) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.2)'
      }}
    >
      <h3 
        className="text-3xl font-bold mb-6 text-center"
        style={{ 
          fontFamily: '"Rajdhani", sans-serif',
          color: gameMode === 'free-for-all' ? '#8E44AD' : '#FF6B35'
        }}
      >
        🎯 CHALLENGE RULES
      </h3>
      
      <div className="flex flex-col items-center space-y-5 text-gray-300">
        {[
          { color: 'orange', value: '10', label: 'Rounds of pro identification' },
          { color: 'blue', value: '30', label: 'Seconds per round' },
          { color: 'green', value: '100', label: 'Starting points each round' },
          { color: 'red', value: '-15', label: 'Points deducted for wrong guesses' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center w-[280px] space-x-4 ml-3 " // adjust for centering the challenge rules
          >
            {/* Icon Box */}
            <div
              className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center border bg-${item.color}-500/20 border-${item.color}-500/30`}
            >
              <span className={`text-${item.color}-400 font-bold`}>{item.value}</span>
            </div>

            {/* Text */}
            <div
              className="text-base leading-snug text-left"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
            {/* Mode Selection */}
            <div className={`grid gap-8 w-full ${!initialGameMode ? 'grid-cols-1 lg:grid-cols-2 max-w-5xl' : 'max-w-lg'} justify-center`}>
              {/* Headshot Mode */}
              {(!initialGameMode || initialGameMode === 'headshot') && (
                <div 
                  className="flex flex-col items-center p-8 rounded-lg border-2 border-gray-700 hover:border-orange-500 transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.9) 0%, rgba(35, 40, 55, 0.8) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">🎯</div>
                  <h4 
                    className="text-3xl font-black mb-4 text-orange-400 group-hover:text-orange-300 transition-colors"
                    style={{ fontFamily: '"Rajdhani", sans-serif', letterSpacing: '0.1em' }}
                  >
                    HEADSHOT MODE
                  </h4>
                  <p 
                    className="text-gray-300 text-center mb-8 leading-relaxed max-w-sm"
                    style={{ fontFamily: '"Inter", sans-serif' }}
                  >
                    Identify players from their close-up headshot photos. Perfect for testing your knowledge of pro player faces.
                  </p>
                  <button 
                    onClick={() => handleModeSelect('headshot')}
                    className="px-8 py-4 font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(45deg, #FF6B35, #F39C12)',
                      color: '#000',
                      fontFamily: '"Rajdhani", sans-serif',
                      letterSpacing: '0.1em',
                      boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
                    }}
                  >
                    START HEADSHOT MODE
                  </button>
                </div>
              )}

              {/* Free-for-All Mode */}
              {(!initialGameMode || initialGameMode === 'free-for-all') && (
                <div 
                  className="flex flex-col items-center p-8 rounded-lg border-2 border-gray-700 hover:border-purple-500 transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.9) 0%, rgba(35, 40, 55, 0.8) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">🎲</div>
                  <h4 
                    className="text-3xl font-black mb-4 text-purple-400 group-hover:text-purple-300 transition-colors"
                    style={{ fontFamily: '"Rajdhani", sans-serif', letterSpacing: '0.1em' }}
                  >
                    FREE-FOR-ALL MODE
                  </h4>
                  <p 
                    className="text-gray-300 text-center mb-8 leading-relaxed max-w-sm"
                    style={{ fontFamily: '"Inter", sans-serif' }}
                  >
                    Random images from tournaments, streams, and events. More challenging with varied angles and contexts.
                  </p>
                  <button 
                    onClick={() => handleModeSelect('free-for-all')}
                    className="px-8 py-4 font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(45deg, #8E44AD, #3498DB)',
                      color: '#fff',
                      fontFamily: '"Rajdhani", sans-serif',
                      letterSpacing: '0.1em',
                      boxShadow: '0 4px 15px rgba(142, 68, 173, 0.3)'
                    }}
                  >
                    START FREE-FOR-ALL
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : gameComplete ? (
          /* Game Complete Screen - Centered with top margin to align with back button */
          <div className="flex flex-col items-center w-full max-w-4xl justify-center mt-20">
            <div 
              className="p-8 rounded-lg border border-gray-700 w-full"
              style={{
                background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.9) 0%, rgba(45, 55, 72, 0.7) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* Game Mode Title */}
              <h2 
                className="text-5xl font-black mb-4 text-center"
                style={{
                  fontFamily: '"Rajdhani", sans-serif',
                  background: gameMode === 'free-for-all' 
                    ? 'linear-gradient(45deg, #8E44AD, #3498DB)' 
                    : 'linear-gradient(45deg, #FF6B35, #F39C12)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {gameMode === 'headshot' ? 'HEADSHOT MODE' : 'FREE-FOR-ALL MODE'}
              </h2>
              
              <h3 
                className="text-3xl font-black mb-6 text-center"
                style={{
                  fontFamily: '"Rajdhani", sans-serif',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                🏆 CHALLENGE COMPLETE! 🏆
              </h3>
              
              <div className="text-center mb-8">
                <div 
                  className="text-6xl font-black mb-2"
                  style={{
                    fontFamily: '"Rajdhani", sans-serif',
                    background: gameMode === 'free-for-all' 
                      ? 'linear-gradient(45deg, #8E44AD, #3498DB)' 
                      : 'linear-gradient(45deg, #FF6B35, #F39C12)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {totalScore}
                </div>
                <div className="text-xl text-gray-300 mb-2" style={{ fontFamily: '"Inter", sans-serif' }}>Total Score</div>
                <div className="text-lg text-gray-400" style={{ fontFamily: '"Inter", sans-serif' }}>
                  Average: {Math.round(totalScore / maxRounds)} points per round
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {roundResults.map((result, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded border"
                    style={{
                      background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.8) 0%, rgba(35, 40, 55, 0.6) 100%)',
                      borderColor: result.isCorrect ? '#10B981' : '#EF4444'
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span 
                        className="font-bold"
                        style={{ 
                          fontFamily: '"Rajdhani", sans-serif',
                          color: gameMode === 'free-for-all' ? '#8E44AD' : '#FF6B35'
                        }}
                      >
                        Round {result.round}
                      </span>
                      <span 
                        className={`font-bold ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}
                        style={{ fontFamily: '"Rajdhani", sans-serif' }}
                      >
                        {result.score} pts
                      </span>
                    </div>
                    <div className="text-sm text-gray-300" style={{ fontFamily: '"Inter", sans-serif' }}>
                      {result.playerName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: '"Inter", sans-serif' }}>
                      {result.isCorrect ? `✓ ${result.timeUsed}s` : '✗ Time up'} 
                      {result.wrongAttempts > 0 && ` • ${result.wrongAttempts} wrong`}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center space-x-4">
                <button
                  onClick={handleRestartGame}
                  className="px-8 py-4 font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(45deg, #10B981, #059669)',
                    color: '#fff',
                    fontFamily: '"Rajdhani", sans-serif',
                    letterSpacing: '0.1em',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={onBackToHome}
                  className="px-8 py-4 bg-gray-600 hover:bg-gray-500 text-white font-bold text-lg rounded-lg transition-all"
                  style={{ fontFamily: '"Rajdhani", sans-serif', letterSpacing: '0.1em' }}
                >
                  BACK TO HOME
                </button>
              </div>
            </div>
          </div>
        ) : showRoundSummary ? (
          /* Round Summary Screen */
          <div className="flex flex-col items-center w-full max-w-lg mx-auto justify-center">
            <div 
              className={`p-8 w-full rounded-lg border-2`}
              style={{
                background: isCorrect 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
                borderColor: isCorrect ? '#10B981' : '#EF4444',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <h3 
                className="text-3xl font-black text-center mb-6"
                style={{ 
                  fontFamily: '"Rajdhani", sans-serif',
                  color: isCorrect ? '#10B981' : '#EF4444'
                }}
              >
                Round {currentRound} {isCorrect ? 'Complete!' : 'Failed'}
              </h3>
              
              <div className="text-center mb-6">
                <div 
                  className="text-5xl font-black mb-2"
                  style={{
                    fontFamily: '"Rajdhani", sans-serif',
                    color: isCorrect ? '#10B981' : '#EF4444'
                  }}
                >
                  {isCorrect ? `+${currentRoundScore}` : '0'} pts
                </div>
                <div className="text-lg text-gray-300 mb-2" style={{ fontFamily: '"Inter", sans-serif' }}>
                  Player: <strong className="text-white">{currentPlayer.name}</strong>
                </div>
                {isCorrect && (
                  <div className="text-sm text-gray-400" style={{ fontFamily: '"Inter", sans-serif' }}>
                    Solved in {30 - timeLeft} seconds
                    {wrongAttempts > 0 && ` • ${wrongAttempts} wrong attempts`}
                  </div>
                )}
              </div>
              
              <div className="text-center text-gray-400 mb-6" style={{ fontFamily: '"Inter", sans-serif' }}>
                <div>Total Score: <strong className="text-white">{totalScore}</strong></div>
                <div>Round {currentRound} of {maxRounds}</div>
              </div>
              
              <button
                ref={nextRoundButtonRef}
                onClick={handleNextRound}
                className="w-full px-6 py-4 font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(45deg, #3B82F6, #1D4ED8)',
                  color: '#fff',
                  fontFamily: '"Rajdhani", sans-serif',
                  letterSpacing: '0.1em',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}
              >
                {currentRound >= maxRounds ? 'VIEW FINAL RESULTS' : 'NEXT ROUND'}
                <span className="text-sm text-gray-300 ml-2">(Press Enter)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Game Screen */
          <div className="flex flex-col items-center w-full max-w-lg mx-auto justify-center">
            {/* Game Status Header */}
            <div 
              className="mb-8 flex items-center justify-between w-full p-6 rounded-lg border border-gray-700"
              style={{
                background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.9) 0%, rgba(45, 55, 72, 0.7) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="text-center">
                <div className="text-sm text-gray-400" style={{ fontFamily: '"Inter", sans-serif' }}>Round</div>
                <div 
                  className="text-2xl font-black"
                  style={{ 
                    fontFamily: '"Rajdhani", sans-serif',
                    color: gameMode === 'free-for-all' ? '#8E44AD' : '#FF6B35'
                  }}
                >
                  {currentRound}/{maxRounds}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400" style={{ fontFamily: '"Inter", sans-serif' }}>Time</div>
                <div 
                  className={`text-3xl font-black ${timeLeft <= 10 ? 'text-red-400' : (imageLoaded && !loading) ? 'text-white' : 'text-gray-500'}`}
                  style={{ fontFamily: '"Rajdhani", sans-serif' }}
                >
                  {(imageLoaded && !loading) ? `${timeLeft}s` : 'Loading...'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400" style={{ fontFamily: '"Inter", sans-serif' }}>Score</div>
                <div 
                  className={`text-2xl font-black ${currentRoundScore > 75 ? 'text-green-400' : currentRoundScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}
                  style={{ fontFamily: '"Rajdhani", sans-serif' }}
                >
                  {Math.round(currentRoundScore)}
                </div>
              </div>
            </div>
            
            {/* Total Score Display */}
            <div 
              className="mb-6 px-6 py-3 rounded-lg border border-gray-700"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.8) 0%, rgba(35, 40, 55, 0.6) 100%)',
                backdropFilter: 'blur(5px)'
              }}
            >
              <span className="text-gray-400 mr-2" style={{ fontFamily: '"Inter", sans-serif' }}>Total Score:</span>
              <span 
                className="font-black text-white text-xl"
                style={{ fontFamily: '"Rajdhani", sans-serif' }}
              >
                {totalScore}
              </span>
            </div>
            
            {/* Wrong Attempts Counter */}
            {wrongAttempts > 0 && (
              <div 
                className="mb-6 px-6 py-3 rounded-lg border-2 border-red-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <span className="text-red-200 mr-2" style={{ fontFamily: '"Inter", sans-serif' }}>Wrong attempts:</span>
                <span 
                  className="font-black text-red-400"
                  style={{ fontFamily: '"Rajdhani", sans-serif' }}
                >
                  {wrongAttempts}
                </span>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div 
                className="mb-6 px-6 py-3 rounded-lg border border-gray-700 flex items-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.8) 0%, rgba(35, 40, 55, 0.6) 100%)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-gray-300" style={{ fontFamily: '"Inter", sans-serif' }}>Loading player...</span>
              </div>
            )}

            {/* Error State */}
            {error && gameStarted && (
              <div 
                className="mb-6 px-6 py-3 rounded-lg border-2 border-red-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <span className="text-red-200" style={{ fontFamily: '"Inter", sans-serif' }}>{error}</span>
              </div>
            )}
            
            {/* Image Reveal Component */}
            {currentPlayer && (
              <div className="mb-8">
                <ImageReveal 
                  src={gameMode === 'free-for-all' && currentImageUrl 
                    ? `http://localhost:3000/api/freeforall?path=${encodeURIComponent(currentImageUrl)}` 
                    : `http://localhost:3000/api/headshot?id=${currentPlayer.headshotId}`
                  }
                  totalBlocks={25} 
                  interval={1200}
                  key={`${currentPlayer.id}-${gameMode}-${currentImageUrl || 'headshot'}`}
                  onImageLoaded={setImageLoaded}
                />
              </div>
            )}
            
            {/* Guess Input */}
            <div className="w-full">
              <form onSubmit={handleSubmitGuess} className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={(imageLoaded && !loading) ? "Enter player name..." : "Loading..."}
                  className="flex-1 px-6 py-4 rounded-lg border border-gray-700 text-white text-lg focus:border-orange-500 focus:outline-none transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.8) 0%, rgba(35, 40, 55, 0.6) 100%)',
                    backdropFilter: 'blur(5px)',
                    fontFamily: '"Inter", sans-serif'
                  }}
                  disabled={hasGuessed || !currentPlayer || !imageLoaded || loading}
                  autoComplete="off"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-8 py-4 font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{
                    background: hasGuessed || !answer.trim() || !currentPlayer || !imageLoaded || loading 
                      ? 'rgba(75, 85, 99, 0.5)' 
                      : 'linear-gradient(45deg, #3B82F6, #1D4ED8)',
                    color: '#fff',
                    fontFamily: '"Rajdhani", sans-serif',
                    letterSpacing: '0.1em',
                    boxShadow: hasGuessed || !answer.trim() || !currentPlayer || !imageLoaded || loading 
                      ? 'none' 
                      : '0 4px 15px rgba(59, 130, 246, 0.3)'
                  }}
                  disabled={hasGuessed || !answer.trim() || !currentPlayer || !imageLoaded || loading}
                >
                  SUBMIT
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
}