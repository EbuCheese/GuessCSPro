import { useState } from 'react';

// HomePage Component with CS2 styling
export default function HomePage({ onSelectMode }) {
  const [hoveredMode, setHoveredMode] = useState(null);
  
  const gameModes = [
    { 
      id: 'headshot', 
      name: 'HEADSHOT', 
      description: 'Standard mode, guess the pro based off HLTV profile img.',
      icon: '/headshot-icon.png', // Replace with your PNG path
      color: '#FF6B35',
      iconStyles: { marginLeft: '20px' }
    },
    { 
      id: 'free-for-all', 
      name: 'FREE FOR ALL', 
      description: 'Guess the pro based off random img of them!',
      icon: '/flash-icon.png', // Replace with your PNG path
      color: '#c27aff',
      iconStyles: { marginRight: '10px' }
    },
    { 
      id: 'quotes', 
      name: 'QUOTES', 
      description: 'Guess the pro from their quotes.',
      icon: '/defuse-icon.png', // Replace with your PNG path
      color: '#45B7D1',
      iconStyles: { marginRight: '15px' }
    },
    { 
      id: 'hardcore', 
      name: 'HARDCORE', 
      description: 'Very minimal data provided, can you guess the pro?',
      icon: '/c4-icon.png', // Replace with your PNG path
      color: '#f52a2a',
      iconStyles: { marginRight: '5px' }
    },
  ];

  // change the crosshair color based on hovered game
  const getCursorUrl = (modeId) => {
  switch (modeId) {
    case 'headshot':
      return '/crosshair-orange-hover.png';
    case 'free-for-all':
      return '/crosshair-purple-hover.png';
    case 'quotes':
      return '/crosshair-blue-hover.png';
    case 'hardcore':
      return '/crosshair-red-hover.png';
    default:
      return '/crosshair-white.png'; // default crosshair
  }
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* CS2 Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(52, 152, 219, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 25%, #2d3748 50%, #1a1f2e 75%, #0a0e1a 100%)
          `
        }}
      />
      
      {/* Animated grid overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 107, 53, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 107, 53, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          {/* Main Logo */}
          <div className="relative mb-6">
            <h1 
              className="text-7xl font-black tracking-wider mb-2 relative"
              style={{
                fontFamily: '"Rajdhani", "Arial Black", sans-serif',
                background: 'linear-gradient(45deg, #FF6B35, #F39C12, #FF6B35)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
                filter: 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.3))'
              }}
            >
              CS:PRO
            </h1>
            <div 
              className="text-4xl font-bold tracking-widest"
              style={{
                fontFamily: '"Rajdhani", "Arial Black", sans-serif',
                color: '#E8E8E8',
                textShadow: '0 0 15px rgba(232, 232, 232, 0.3)',
                letterSpacing: '0.3em'
              }}
            >
              GUESSER
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent w-64"></div>
            <div className="mx-4 text-orange-500 text-2xl">⚡</div>
            <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent w-64"></div>
          </div>

          {/* Subtitle */}
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <p 
              className="text-lg text-gray-300 font-bold tracking-widest"
              style={{ fontFamily: '"Rajdhani", sans-serif' }}
            >
              SELECT GAME MODE
            </p>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Game Mode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {gameModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              onMouseEnter={() => setHoveredMode(mode.id)}
              onMouseLeave={() => setHoveredMode(null)}
              className={`
                relative p-8 rounded-lg transition-all duration-300 border-2 overflow-hidden group
                transform transition-transform duration-300
                ${hoveredMode === mode.id 
                  ? 'scale-105' 
                  : 'hover:border-gray-600'
                }
              `}
              style={{
                borderColor: hoveredMode === mode.id ? mode.color : '#374151',
                background: hoveredMode === mode.id 
                  ? `linear-gradient(135deg, rgba(26, 31, 46, 0.9) 0%, rgba(45, 55, 72, 0.9) 100%)`
                  : `linear-gradient(135deg, rgba(20, 25, 40, 0.8) 0%, rgba(35, 40, 55, 0.8) 100%)`,
                boxShadow: hoveredMode === mode.id 
                  ? `0 0 30px ${mode.color}40, inset 0 0 20px rgba(0, 0, 0, 0.3)`
                  : '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                cursor: `url(${getCursorUrl(mode.id)}) 16 16, crosshair`
              }}
            >

              {/* Animated background effect */}
              <div 
                className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                style={{
                  background: `radial-gradient(circle at center, ${mode.color} 0%, transparent 70%)`
                }}
              />

              {/* Status indicator */}
              <div className="absolute top-4 right-4">
                {(mode.id === 'headshot' || mode.id === 'free-for-all') ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-bold">ACTIVE</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-yellow-400 font-bold">SOON</span>
                  </div>
                )}
              </div>

              {/* Mode Icon - Updated to use PNG */}
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={mode.icon} 
                  alt={`${mode.name} icon`}
                  className="w-16 h-16 object-contain"
                  style={{
                    ...mode.iconStyles,
                    filter: hoveredMode === mode.id 
                      ? `drop-shadow(0 0 10px ${mode.color}80)` 
                      : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
                  }}
                />
              </div>

              {/* Mode Name */}
              <div 
                className={`text-2xl font-black mb-4 transition-all duration-300 ${
                  hoveredMode === mode.id ? '' : 'text-white'
                }`}
                style={{
                  fontFamily: '"Rajdhani", sans-serif',
                  color: hoveredMode === mode.id ? mode.color : undefined,
                  textShadow: hoveredMode === mode.id 
                    ? `0 0 10px ${mode.color}80` 
                    : '0 2px 4px rgba(0, 0, 0, 0.5)',
                  letterSpacing: '0.1em'
                }}
              >
                {mode.name}
              </div>

              {/* Mode Description */}
              <div 
                className="text-sm text-gray-300 leading-relaxed h-12 flex items-center justify-center"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                {mode.description}
              </div>

              {/* Bottom accent */}
              <div 
                className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 ${
                  hoveredMode === mode.id ? 'opacity-100' : 'opacity-50'
                }`}
                style={{ backgroundColor: mode.color }}
              />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="text-orange-500 text-xl">★</div>
            <span 
              className="text-lg font-bold text-gray-300 tracking-wider"
              style={{ fontFamily: '"Rajdhani", sans-serif' }}
            >
              BUILT FOR COUNTER-STRIKE LEGENDS
            </span>
            <div className="text-orange-500 text-xl">★</div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="text-gray-600 font-medium">crafted by</span>
            <a
              href="https://twitter.com/ebucheese"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 font-bold tracking-wide hover:text-orange-400 transition-colors duration-300"
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                cursor: 'url(/crosshair-orange-hover.png) 16 16, crosshair',
              }}
            >
              @ebucheese
            </a>
          </div>

        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}