import { useState } from 'react';

// HomePage Component with CS2 styling
export default function HomePage({ onSelectMode }) {
  const [hoveredMode, setHoveredMode] = useState(null);
  
  const gameModes = [
    { 
      id: 'headshot', 
      name: 'HEADSHOT', 
      description: 'Standard mode, guess the pro based off their HLTV headshot profile image.',
      icon: '/headshot-icon.png', // Replace with your PNG path
      color: '#FF6B35',
      iconStyles: { marginLeft: '20px' }
    },
    { 
      id: 'free-for-all', 
      name: 'FREE FOR ALL', 
      description: 'Guess the pro based off a random image (from anywhere) of them!',
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
            <div className="mx-4 text-orange-500 text-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255, 107, 53)" viewBox="0 0 256 256"><path d="M232,128c0,12.51-17.82,21.95-22.68,33.69-4.68,11.32,1.42,30.64-7.78,39.85s-28.53,3.1-39.85,7.78C150,214.18,140.5,232,128,232s-22-17.82-33.69-22.68c-11.32-4.68-30.65,1.42-39.85-7.78s-3.1-28.53-7.78-39.85C41.82,150,24,140.5,24,128s17.82-22,22.68-33.69C51.36,83,45.26,63.66,54.46,54.46S83,51.36,94.31,46.68C106.05,41.82,115.5,24,128,24S150,41.82,161.69,46.68c11.32,4.68,30.65-1.42,39.85,7.78s3.1,28.53,7.78,39.85C214.18,106.05,232,115.5,232,128Z" opacity="0.2"></path><path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-11.55,39.29c-4.79,5-9.75,10.17-12.38,16.52-2.52,6.1-2.63,13.07-2.73,19.82-.1,7-.21,14.33-3.32,17.43s-10.39,3.22-17.43,3.32c-6.75.1-13.72.21-19.82,2.73-6.35,2.63-11.52,7.59-16.52,12.38S132,224,128,224s-9.15-4.92-14.11-9.69-10.17-9.75-16.52-12.38c-6.1-2.52-13.07-2.63-19.82-2.73-7-.1-14.33-.21-17.43-3.32s-3.22-10.39-3.32-17.43c-.1-6.75-.21-13.72-2.73-19.82-2.63-6.35-7.59-11.52-12.38-16.52S32,132,32,128s4.92-9.15,9.69-14.11,9.75-10.17,12.38-16.52c2.52-6.1,2.63-13.07,2.73-19.82.1-7,.21-14.33,3.32-17.43S70.51,56.9,77.55,56.8c6.75-.1,13.72-.21,19.82-2.73,6.35-2.63,11.52-7.59,16.52-12.38S124,32,128,32s9.15,4.92,14.11,9.69,10.17,9.75,16.52,12.38c6.1,2.52,13.07,2.63,19.82,2.73,7,.1,14.33.21,17.43,3.32s3.22,10.39,3.32,17.43c.1,6.75.21,13.72,2.73,19.82,2.63,6.35,7.59,11.52,12.38,16.52S224,124,224,128,219.08,137.15,214.31,142.11ZM140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180Zm28-72c0,17.38-13.76,31.93-32,35.28V144a8,8,0,0,1-16,0v-8a8,8,0,0,1,8-8c13.23,0,24-9,24-20s-10.77-20-24-20-24,9-24,20v4a8,8,0,0,1-16,0v-4c0-19.85,17.94-36,40-36S168,88.15,168,108Z"></path></svg>           
           </div>
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