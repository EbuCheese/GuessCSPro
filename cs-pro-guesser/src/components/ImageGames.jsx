import { useState, useEffect, useRef, useCallback } from 'react';
import ImageReveal from './ImageReveal';

export default function ImageGames({ onBackToHome, initialGameMode  }) {
  // Game Start-End
  const [gameMode, setGameMode] = useState(initialGameMode || null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Answer States
  const [answer, setAnswer] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Scoring
  const [currentRoundScore, setCurrentRoundScore] = useState(100);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // Chosen Player
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  // Img Loading
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Multi-Rounds
  const [currentRound, setCurrentRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [usedPlayerIds, setUsedPlayerIds] = useState([]);
  const [roundResults, setRoundResults] = useState([]);
  const [showRoundSummary, setShowRoundSummary] = useState(false);

  // Hide Cursor
  const [showCursor, setShowCursor] = useState(false);
  const cursorTimeoutRef = useRef(null);

  // Timer
  const timerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const inputRef = useRef(null);
  const nextRoundButtonRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(30); 

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

  // Change crosshair color based on gamemode
  const getCursorUrl = (modeId) => {
  switch (modeId) {
    case 'headshot':
      return '/crosshair-orange-hover.png';
    case 'free-for-all':
      return '/crosshair-purple-hover.png';
    case 'quotes':
      return '/crosshair-blue.png';
    case 'hardcore':
      return '/crosshair-red.png';
    
  }
};

// Preload the cursor images
const preloadCursorImages = () => {
  const cursorImages = [
    '/crosshair-orange.png',
    '/crosshair-orange-hover.png', 
    '/crosshair-purple.png',
    '/crosshair-purple-hover.png',
    '/crosshair-blue.png',
    '/crosshair-red.png',
    'cursor-text-blue.png',
    'cursor-text-orange.png',
    'cursor-text-purple.png',
    'cursor-text-red.png',
  ];

  cursorImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

useEffect(() => {
  preloadCursorImages();
}, []);


// logic for hiding / showing cursor
const handleMouseMove = useCallback(() => {
  if (gameStarted && !showRoundSummary && !gameComplete) {
    setShowCursor(true);

    // Clear any existing timeout
    if (cursorTimeoutRef.current) {
      clearTimeout(cursorTimeoutRef.current);
    }

    // Set a new timeout
    cursorTimeoutRef.current = setTimeout(() => {
      setShowCursor(false);
    }, 2000);
  }
}, [gameStarted, showRoundSummary, gameComplete]);

useEffect(() => {
  return () => {
    if (cursorTimeoutRef.current) {
      clearTimeout(cursorTimeoutRef.current);
    }
  };
}, []);


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
      setError(
        <div className="flex items-center gap-2">
          <svg 
            className="w-6 h-6 hover:text-white transition-colors duration-200" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            onClick={() => selectRandomPlayer()}
            title="Retry loading player"
            style={{ cursor: `url(${getCursorUrl(gameMode)}) 16 16, crosshair` }}
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          <span>Failed to load player. Please try again.</span>
        </div>
      );
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
  
  // go to next round
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

  // set gamemode
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
  // main container and crosshair color for gamemode
  <div 
  className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
  style={{
    cursor: gameStarted && !showRoundSummary && !gameComplete 
      ? (showCursor 
          ? `url(${gameMode === 'headshot' ? '/crosshair-orange.png' : '/crosshair-purple.png'}) 16 16, crosshair`
          : 'none')
      : `url(${gameMode === 'headshot' ? '/crosshair-orange.png' : '/crosshair-purple.png'}) 16 16, crosshair`
  }}
  onMouseMove={handleMouseMove}
>
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
        className={`absolute top-6 left-6 flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/80 backdrop-blur-sm transition-all duration-300 z-20 group ${
          gameMode === 'free-for-all' 
            ? 'hover:border-purple-500 hover:bg-gray-700/80' 
            : 'hover:border-orange-500 hover:bg-gray-700/80'
        }`}
        style={{
          cursor: `url(${getCursorUrl(gameMode)}) 16 16, crosshair`
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-colors ${
          gameMode === 'free-for-all' 
            ? 'group-hover:text-purple-400' 
            : 'group-hover:text-orange-400'
        }`} viewBox="0 0 20 20" fill="currentColor">
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="w-7 h-7"
                style={{
                  fill: gameMode === 'free-for-all' ? '#8E44AD' : '#FF6B35',
                }}
              >
                <rect width="256" height="256" fill="none" />
                <path
                  d={
                  "M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120ZM68.67,208A64.36,64.36,0,0,1,87.8,182.2a64,64,0,0,1,80.4,0A64.36,64.36,0,0,1,187.33,208ZM208,208h-3.67a79.9,79.9,0,0,0-46.68-50.29,48,48,0,1,0-59.3,0A79.9,79.9,0,0,0,51.67,208H48V48H208V208Z" 
                  }
                />
              </svg>


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
        <div className="w-full max-w-4xl">
          {/* Challenge Rules Header - Enhanced with animations */}
          <div 
            className="p-6 rounded-xl border-2 text-center mb-8 relative overflow-hidden group"
            style={{
              background: gameMode === 'free-for-all' 
                ? 'linear-gradient(135deg, rgba(142, 68, 173, 0.1) 0%, rgba(52, 152, 219, 0.08) 50%, rgba(26, 31, 46, 0.95) 100%)'
                : gameMode === 'headshot'
                  ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(243, 156, 18, 0.08) 50%, rgba(26, 31, 46, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(26, 31, 46, 0.9) 0%, rgba(45, 55, 72, 0.7) 100%)',
              borderColor: gameMode === 'free-for-all' 
                ? 'rgba(142, 68, 173, 0.3)' 
                : gameMode === 'headshot'
                  ? 'rgba(255, 107, 53, 0.3)'
                  : 'rgba(107, 114, 128, 0.5)',
              backdropFilter: 'blur(15px)',
              boxShadow: gameMode === 'free-for-all'
                ? '0 8px 32px rgba(142, 68, 173, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : gameMode === 'headshot'
                  ? '0 8px 32px rgba(255, 107, 53, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Animated background glow */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: gameMode === 'free-for-all'
                  ? 'radial-gradient(circle at 50% 50%, rgba(142, 68, 173, 0.1) 0%, transparent 70%)'
                  : gameMode === 'headshot'
                    ? 'radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 70%)'
                    : 'radial-gradient(circle at 50% 50%, rgba(107, 114, 128, 0.1) 0%, transparent 70%)'
              }}
            />
            
            <div className="relative z-10">
              <h3 
                className="text-lg md:text-xl font-black mb-4 tracking-wide group-hover:scale-105 transition-transform duration-300"
                style={{ 
                  fontFamily: '"Rajdhani", sans-serif',
                  background: gameMode === 'free-for-all'
                    ? 'linear-gradient(45deg, #8E44AD, #3498DB)'
                    : gameMode === 'headshot'
                      ? 'linear-gradient(45deg, #FF6B35, #F39C12)'
                      : 'linear-gradient(45deg, #6B7280, #9CA3AF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                ⚡ CHALLENGE RULES ⚡
              </h3>
              
              {/* Horizontal rules layout for better balance */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                <div className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                  <span 
                    className="text-xl"
                    style={{
                      color: gameMode === 'free-for-all' ? '#8E44AD' : gameMode === 'headshot' ? '#FF6B35' : '#6B7280'
                    }}
                  >
                    🔥
                  </span>
                  <span 
                    className="font-bold text-lg"
                    style={{ 
                      fontFamily: '"Rajdhani", sans-serif',
                      color: gameMode === 'free-for-all' ? '#A855F7' : gameMode === 'headshot' ? '#F97316' : '#9CA3AF'
                    }}
                  >
                    10 ROUNDS
                  </span>
                </div>
                
                <div className="text-gray-500">•</div>
                
                <div className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                  <span 
                    className="text-xl"
                    style={{
                      color: gameMode === 'free-for-all' ? '#3498DB' : gameMode === 'headshot' ? '#F39C12' : '#6B7280'
                    }}
                  >
                    ⏱️
                  </span>
                  <span 
                    className="font-bold text-lg"
                    style={{ 
                      fontFamily: '"Rajdhani", sans-serif',
                      color: gameMode === 'free-for-all' ? '#60A5FA' : gameMode === 'headshot' ? '#FBBF24' : '#9CA3AF'
                    }}
                  >
                    30s EACH
                  </span>
                </div>
                
                <div className="text-gray-500">•</div>
                
                <div className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                  <span className="text-xl text-green-400">💯</span>
                  <span 
                    className="font-bold text-lg text-green-400"
                    style={{ fontFamily: '"Rajdhani", sans-serif' }}
                  >
                    100 START PTS
                  </span>
                </div>
                
                <div className="text-gray-500">•</div>
                
                <div className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                  <span className="text-xl text-red-400">❌</span>
                  <span 
                    className="font-bold text-lg text-red-400"
                    style={{ fontFamily: '"Rajdhani", sans-serif' }}
                  >
                    -15 PENALTY
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Selection - Enhanced with better animations */}
          <div className={`grid gap-8 w-full ${!initialGameMode ? 'grid-cols-1 lg:grid-cols-2' : 'max-w-lg mx-auto'}`}>
            {/* Headshot Mode */}
            {(!initialGameMode || initialGameMode === 'headshot') && (
              <div 
                className="p-8 rounded-xl border-2 border-gray-700 hover:border-orange-500 transition-all duration-500 group relative overflow-hidden cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(243, 156, 18, 0.03) 30%, rgba(20, 25, 40, 0.95) 100%)',
                  backdropFilter: 'blur(15px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  minHeight: '480px',
                  transform: 'translateY(0)',
                  cursor: `url(${gameMode === 'headshot' ? '/crosshair-orange.png' : '/crosshair-purple.png'}) 16 16, crosshair`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 107, 53, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                }}
              >
                {/* Subtle background pattern */}
                <div 
                  className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at 30% 20%, rgba(255, 107, 53, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(243, 156, 18, 0.08) 0%, transparent 50%)'
                  }}
                />
                
                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon and Title */}
                  <div className="text-center mb-6">
                    <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-500">
                      <img 
                        src="/headshot-icon.png" 
                        alt="Headshot mode icon"
                        className="w-20 h-20 object-contain"
                        style={{
                          marginLeft: '25px',
                          filter: 'drop-shadow(0 4px 8px rgba(255, 107, 53, 0.3))'
                        }}
                      />
                    </div>
                    <h4 
                      className="text-3xl md:text-4xl font-black mb-3 text-orange-400 group-hover:text-orange-300 transition-colors duration-300"
                      style={{ fontFamily: '"Rajdhani", sans-serif', letterSpacing: '0.1em' }}
                    >
                      HEADSHOT MODE
                    </h4>
                    <div 
                      className="h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 group-hover:w-32 transition-all duration-500"
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="flex-1 flex flex-col justify-center">
                    <p 
                      className="text-gray-300 text-center leading-relaxed text-base md:text-lg mb-6 group-hover:text-gray-200 transition-colors duration-300"
                      style={{ fontFamily: '"Inter", sans-serif' }}
                    >
                      Identify players from their close-up headshot photos. Perfect for testing your knowledge of pro player faces and recognition skills.
                    </p>
                    
                    {/* Features list */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        <span className="text-orange-400 mr-2">✓</span>
                        <span style={{ fontFamily: '"Inter", sans-serif' }}>Clean headshot photos</span>
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        <span className="text-orange-400 mr-2">✓</span>
                        <span style={{ fontFamily: '"Inter", sans-serif' }}>Focus on facial recognition</span>
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        <span className="text-orange-400 mr-2">✓</span>
                        <span style={{ fontFamily: '"Inter", sans-serif' }}>Great for beginners</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Button */}
                  <button 
                    onClick={() => handleModeSelect('headshot')}
                    className="w-full px-6 py-4 font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg group-hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(45deg, #FF6B35, #F39C12)',
                      color: '#000',
                      fontFamily: '"Rajdhani", sans-serif',
                      letterSpacing: '0.1em',
                      boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                      cursor: `url(${getCursorUrl('headshot')}) 16 16, crosshair`
                    }}
                  >
                    START HEADSHOT MODE
                  </button>
                </div>
              </div>
            )}

            {/* Free-for-All Mode */}
            {(!initialGameMode || initialGameMode === 'free-for-all') && (
              <div 
                className="p-8 rounded-xl border-2 border-gray-700 hover:border-purple-500 transition-all duration-500 group relative overflow-hidden cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.05) 0%, rgba(52, 152, 219, 0.03) 30%, rgba(20, 25, 40, 0.95) 100%)',
                  backdropFilter: 'blur(15px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  minHeight: '480px',
                  transform: 'translateY(0)',
                  cursor: `url(${gameMode === 'headshot' ? '/crosshair-orange.png' : '/crosshair-purple.png'}) 16 16, crosshair`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(142, 68, 173, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                }}
              >
                {/* Subtle background pattern */}
                <div 
                  className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at 30% 20%, rgba(142, 68, 173, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(52, 152, 219, 0.08) 0%, transparent 50%)'
                  }}
                />
                
                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon and Title */}
                  <div className="text-center mb-6">
                    <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-500">
                      <img 
                        src="/flash-icon.png" 
                        alt="Free-for-all mode icon"
                        className="w-20 h-20 object-contain"
                        style={{
                          filter: 'drop-shadow(0 4px 8px rgba(142, 68, 173, 0.3))'
                        }}
                      />
                    </div>
                    <h4 
                      className="text-3xl md:text-4xl font-black mb-3 text-purple-400 group-hover:text-purple-300 transition-colors duration-300"
                      style={{ fontFamily: '"Rajdhani", sans-serif', letterSpacing: '0.1em' }}
                    >
                      FREE-FOR-ALL MODE
                    </h4>
                    <div 
                      className="h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-32 transition-all duration-500"
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="flex-1 flex flex-col justify-center">
                    <p 
                      className="text-gray-300 text-center leading-relaxed text-base md:text-lg mb-6 group-hover:text-gray-200 transition-colors duration-300"
                      style={{ fontFamily: '"Inter", sans-serif' }}
                    >
                      Random images from tournaments, streams, and events. More challenging with varied angles, contexts, and situations.
                    </p>
                    
                    {/* Features list */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span style={{ fontFamily: '"Inter", sans-serif' }}>Tournament & event photos</span>
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span style={{ fontFamily: '"Inter", sans-serif' }}>Various angles & contexts</span>
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        <span className="text-purple-400 mr-2">✓</span>
                        <span style={{ fontFamily: '"Inter", sans-serif' }}>Harder difficulty</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Button */}
                  <button 
                    onClick={() => handleModeSelect('free-for-all')}
                    className="w-full px-6 py-4 font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg group-hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(45deg, #8E44AD, #3498DB)',
                      color: '#fff',
                      fontFamily: '"Rajdhani", sans-serif',
                      letterSpacing: '0.1em',
                      boxShadow: '0 4px 15px rgba(142, 68, 173, 0.3)',
                      cursor: `url(${getCursorUrl('free-for-all')}) 16 16, crosshair`
                    }}
                  >
                    START FREE-FOR-ALL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        ) : gameComplete ? (
        /* Game Complete Screen - Fixed button interaction */
        <div className="flex flex-col items-center w-full max-w-4xl justify-center relative z-20">
          <div 
            className="p-8 rounded-xl border-2 w-full relative overflow-hidden group"
            style={{
              background: gameMode === 'free-for-all'
                ? 'linear-gradient(135deg, rgba(142, 68, 173, 0.1) 0%, rgba(52, 152, 219, 0.08) 50%, rgba(26, 31, 46, 0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(243, 156, 18, 0.08) 50%, rgba(26, 31, 46, 0.95) 100%)',
              borderColor: gameMode === 'free-for-all' ? 'rgba(142, 68, 173, 0.4)' : 'rgba(255, 107, 53, 0.4)',
              backdropFilter: 'blur(15px)',
              boxShadow: gameMode === 'free-for-all'
                ? '0 8px 32px rgba(142, 68, 173, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 8px 32px rgba(255, 107, 53, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Animated background */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: gameMode === 'free-for-all'
                  ? 'radial-gradient(circle at 50% 50%, rgba(142, 68, 173, 0.1) 0%, transparent 70%)'
                  : 'radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 70%)'
              }}
            />

            <div className="relative z-10">
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
              
              {/* Fixed button container */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-30">
                <button
                  onClick={handleRestartGame}
                  className="px-8 py-4 font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 cursor-pointer relative z-40"
                  style={{
                    background: 'linear-gradient(45deg, #10B981, #059669)',
                    color: '#fff',
                    fontFamily: '"Rajdhani", sans-serif',
                    letterSpacing: '0.1em',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                    pointerEvents: 'auto',
                    cursor: `url(${getCursorUrl(gameMode)}) 16 16, crosshair`
                  }}
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={onBackToHome}
                  className="px-8 py-4 bg-gray-600 hover:bg-gray-500 text-white font-bold text-lg rounded-lg transition-all cursor-pointer relative z-40"
                  style={{ 
                    fontFamily: '"Rajdhani", sans-serif', 
                    letterSpacing: '0.1em',
                    pointerEvents: 'auto',
                    cursor: `url(${getCursorUrl(gameMode)}) 16 16, crosshair`
                  }}
                >
                  BACK TO HOME
                </button>
              </div>
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
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  cursor: `url(${getCursorUrl(gameMode)}) 16 16, crosshair`
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
                <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mr-3 ${
                  gameMode === 'free-for-all' ? 'border-purple-500' : 'border-orange-500'
                }`}></div>
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
                  src={
                    gameMode === 'free-for-all' && currentImageUrl?.startsWith('http')
                      ? currentImageUrl
                      : gameMode === 'free-for-all'
                      ? `http://localhost:3000/api/player-images?path=${encodeURIComponent(currentImageUrl)}`
                      : `http://localhost:3000/api/player-headshot?id=${currentPlayer.headshotId}`
                  }
                  totalBlocks={25} 
                  interval={1200}
                  gameMode={gameMode}
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
                  className={`flex-1 px-6 py-4 rounded-lg border border-gray-700 text-white text-lg transition-all focus:outline-none ${
                    gameMode === 'free-for-all' ? 'focus:border-purple-500' : 'focus:border-orange-500'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.8) 0%, rgba(35, 40, 55, 0.6) 100%)',
                    backdropFilter: 'blur(5px)',
                    fontFamily: '"Inter", sans-serif',
                    cursor: `url(${gameMode === 'headshot' ? '/cursor-text-orange.png' : '/cursor-text-purple.png'}) 10 10, text`
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
                    cursor: `url(${getCursorUrl(gameMode)}) 16 16, crosshair`,
                    boxShadow: hasGuessed || !answer.trim() || !currentPlayer || !imageLoaded || loading 
                      ? 'none' 
                      : '0 4px 15px rgba(59, 130, 246, 0.3)'
                  }}
                  disabled={hasGuessed || !answer.trim() || !currentPlayer || !imageLoaded || loading}
                >
                  SUBMIT <span className="text-sm text-gray-300">(Enter)</span>
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