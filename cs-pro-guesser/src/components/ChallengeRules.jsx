import React, { useState } from 'react';

const ChallengeRules = ({ gameMode = 'headshot', gameConfig = {} }) => {
  const [isMinimized, setIsMinimized] = useState(true);

  // Default game configurations
  const defaultConfigs = {
    headshot: {
      rounds: 10,
      timePerRound: 30,
      startPoints: 100,
      speedBonusMax: 100,
      wrongPenalty: -15,
      hintsAvailable: 3,
      hintCost: -10,
      timeDecay: -2
    },
    'free-for-all': {
      rounds: 10,
      timePerRound: 30,
      startPoints: 100,
      speedBonusMax: 150,
      wrongPenalty: -15,
      hintsAvailable: 3,
      hintCost: -10,
      timeDecay: -2
    },
  };

  // Merge default config with passed config
  const config = { ...defaultConfigs[gameMode], ...gameConfig };

  // Color themes matching your existing system
  const themes = {
    headshot: {
      primary: '#F97316',
      secondary: '#EAB308',
      border: 'rgba(249, 115, 22, 0.4)',
      glow: 'rgba(249, 115, 22, 0.15)',
      bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 179, 8, 0.06) 100%)'
    },
    'free-for-all': {
      primary: '#A855F7',
      secondary: '#FF7EBE',
      border: 'rgba(168, 85, 247, 0.4)',
      glow: 'rgba(168, 85, 247, 0.15)',
      bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(236, 72, 153, 0.06) 100%)'
    },
  };

  const theme = themes[gameMode] || themes['free-for-all'];

  // Dynamic game info based on config
  const gameInfo = [
    { 
      icon: '🔥', 
      label: `${config.rounds} Rounds`, 
      value: 'Total challenges', 
      color: '#EF4444' 
    },
    { 
      icon: '⏱️', 
      label: `${config.timePerRound} Seconds`, 
      value: 'Per round', 
      color: '#F59E0B' 
    }
  ];

  // Dynamic scoring rules based on config
  const scoringRules = [
    { 
      icon: '💯', 
      label: 'Start', 
      value: `+${config.startPoints} pts`, 
      color: '#10B981' 
    },
    { 
      icon: '⚡', 
      label: 'Speed Bonus', 
      value: `Up to +${config.speedBonusMax} pts`, 
      color: '#3B82F6' 
    },
    { 
      icon: '❌', 
      label: 'Wrong', 
      value: `${config.wrongPenalty} pts`, 
      color: '#EF4444' 
    },
    { 
      icon: '💡', 
      label: 'Hints', 
      value: `Up to ${config.hintsAvailable}`, 
      color: '#06B6D4' 
    },
    { 
      icon: '💰', 
      label: 'Hint Cost', 
      value: `${config.hintCost} pts`, 
      color: '#F59E0B' 
    },
    { 
      icon: '⏳', 
      label: 'Time Decay', 
      value: `${config.timeDecay}/sec`, 
      color: '#9333EA' 
    }
  ];

  return (
    <div className="w-full max-w-lg mx-auto mb-6">
      <div 
        className="relative rounded-xl backdrop-blur-xl border overflow-hidden transition-all duration-300"
        style={{
          background: gameMode === 'free-for-all' 
            ? 'linear-gradient(135deg, rgba(145, 145, 145, 0.08) 0%, rgba(225, 225, 225, 0.06) 100%), rgba(22, 19, 34, 0.9)'
            : `${theme.bg}, rgba(15, 23, 42, 0.9)`,
          borderColor: gameMode === 'free-for-all'
            ? 'rgba(151, 41, 255, 0.4)'
            : theme.border,
          boxShadow: gameMode === 'free-for-all'
            ? 'rgba(168, 85, 247, 0.15) 0px 8px 32px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset'
            : `0 8px 32px ${theme.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
        }}
      >
        {/* Header with Toggle Button */}
        <div className="relative p-6 pb-4">
          {/* Toggle Button - Positioned to avoid overlap */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="absolute top-[20px] sm:top-[22px] right-4 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/60 transition-all duration-200 group z-10"
            style={{
              boxShadow: `0 2px 8px rgba(0,0,0,0.1), 0 0 0 1px ${theme.primary}20`,
              cursor: gameMode === 'headshot' 
                ? 'url("/crosshair-orange-hover.png") 12 12, pointer' 
                : 'url("/crosshair-purple-hover.png") 12 12, pointer'
            }}
          >
            {isMinimized ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                fill={theme.primary} 
                viewBox="0 0 256 256"
                className="group-hover:scale-110 transition-transform duration-200"
              >
                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                fill={theme.primary} 
                viewBox="0 0 256 256"
                className="group-hover:scale-110 transition-transform duration-200"
              >
                <path d="M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z"></path>
              </svg>
            )}
          </button>

          <div className="text-center sm:pr-0">
            <h3 
              className="text-xl sm:text-2xl font-black tracking-wider mb-2"
              style={{
                background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '"Rajdhani", sans-serif'
              }}
            >
              <span className="hidden min-[450px]:inline">⚡ </span>CHALLENGE RULES<span className="hidden min-[450px]:inline"> ⚡</span>
            </h3>
          </div>
        </div>

        {/* Expandable Content - Fixed height constraints */}
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isMinimized ? 'max-h-0 opacity-0' : 'max-h-none opacity-100'
          }`}
        >
          <div className="px-4 sm:px-6 pb-6">
            {/* Game Duration */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 mt-2 max-w-lg mx-auto">
              {gameInfo.map((info, index) => (
                <div
                  key={index}
                  className="group relative bg-slate-800/40 rounded-lg p-3 sm:p-4 border border-slate-700/50 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                  style={{
                    boxShadow: `0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px ${info.color}20`
                  }}
                >
                  {/* Hover glow */}
                  <div 
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at center, ${info.color}15 0%, transparent 70%)`
                    }}
                  />
                  
                  <div className="relative z-10 text-center">
                    <div className="text-xl sm:text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {info.icon}
                    </div>
                    <div 
                      className="font-bold text-xs sm:text-sm mb-1 tracking-wide"
                      style={{ 
                        color: info.color,
                        fontFamily: '"Rajdhani", sans-serif'
                      }}
                    >
                      {info.label.toUpperCase()}
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      {info.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scoring Rules - Fixed grid layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 mb-6">
              {scoringRules.map((rule, index) => (
                <div
                  key={index}
                  className="group relative bg-slate-800/40 rounded-lg p-2 sm:p-3 border border-slate-700/50 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                  style={{
                    boxShadow: `0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px ${rule.color}20`
                  }}
                >
                  {/* Hover glow */}
                  <div 
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at center, ${rule.color}15 0%, transparent 70%)`
                    }}
                  />
                  
                  <div className="relative z-10 text-center">
                    <div className="text-lg sm:text-xl mb-1 group-hover:scale-110 transition-transform duration-300">
                      {rule.icon}
                    </div>
                    <div 
                      className="font-bold text-xs mb-1 tracking-wide"
                      style={{ 
                        color: rule.color,
                        fontFamily: '"Rajdhani", sans-serif'
                      }}
                    >
                      {rule.label.toUpperCase()}
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      {rule.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Tips */}
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs text-slate-400 px-2">
                <span className="flex items-center gap-1">
                  <span style={{ color: theme.primary }}>•</span>
                  Faster = additional points
                </span>
                <span className="flex items-center gap-1">
                  <span style={{ color: theme.primary }}>•</span>
                  Use hints wisely
                </span>
                <span className="flex items-center gap-1">
                  <span style={{ color: theme.primary }}>•</span>
                  Every second counts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeRules;