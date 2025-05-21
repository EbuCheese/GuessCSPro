import { useState } from 'react';

const gameModes = [
  { id: 'headshot', name: 'HEADSHOT', description: 'Standard mode, guess the pro based off HLTV profile img.' },
  { id: 'free-for-all', name: 'FREE FOR ALL', description: 'Guess the pro based off random img of them!' },
  { id: 'quotes', name: 'QUOTES', description: 'Guess the pro from their quotes.' },
  { id: 'hardcore', name: 'HARDCORE', description: 'Very minimal data provided, can you guess the pro?' },
];

export default function HomePage({ onSelectMode }) {
  const [hoveredMode, setHoveredMode] = useState(null);
  
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'linear-gradient(to bottom, #1a2027 0%, #0d1218 100%)',
        fontFamily: '"Stratum2", "Helvetica Neue", Arial, sans-serif'
      }}
    >
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2" style={{ 
          color: '#f1c40f',
          textShadow: '0 0 10px rgba(241, 196, 15, 0.7), 0 0 20px rgba(241, 196, 15, 0.4)',
          letterSpacing: '1px'
        }}>
          CS:PRO GUESSER
        </h1>
        <div className="w-64 h-1 mx-auto" style={{ background: 'linear-gradient(to right, transparent, #f1c40f, transparent)' }}></div>
        <p className="text-sm text-gray-400 mt-4" style={{ letterSpacing: '2px' }}>SELECT GAME MODE</p>
      </div>

      {/* Game Mode Selection */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        {gameModes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            onMouseEnter={() => setHoveredMode(mode.id)}
            onMouseLeave={() => setHoveredMode(null)}
            className={`p-6 rounded bg-gray-800 transition-all duration-200 border border-gray-700 relative overflow-hidden ${
              hoveredMode === mode.id ? 'border-yellow-500 scale-105' : ''
            }`}
            style={{
              boxShadow: hoveredMode === mode.id ? '0 0 15px rgba(241, 196, 15, 0.5)' : 'none'
            }}
          >
            {/* Mode icon placeholder */}
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                {mode.id === 'headshot' && '✓'}
                {mode.id === 'free-for-all' && '⏱'}
                {mode.id === 'quotes' && '" "'}
                {mode.id === 'hardcore' && '!'}
              </div>
            </div>

            {/* Mode name */}
            <div className="text-xl font-bold" style={{ 
              color: hoveredMode === mode.id ? '#f1c40f' : 'white',
              textShadow: hoveredMode === mode.id ? '0 0 5px rgba(241, 196, 15, 0.5)' : 'none',
            }}>
              {mode.name}
            </div>
            
            {/* Mode description */}
            <div className="text-xs text-gray-400 mt-3 h-12">
              {mode.description}
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-sm text-gray-500 flex flex-col items-center">
        <div className="mb-2 flex items-center">
          <span className="mr-1" style={{ color: '#f1c40f' }}>★</span>
          <span>BUILT FOR COUNTER-STRIKE FANS</span>
          <span className="ml-1" style={{ color: '#f1c40f' }}>★</span>
        </div>
        <div className="text-xs flex items-center">
          <span className="mx-2">HEADSHOTS</span>
          <span style={{ color: '#f1c40f' }}>•</span>
          <span className="mx-2">CLUTCHES</span>
          <span style={{ color: '#f1c40f' }}>•</span>
          <span className="mx-2">LEGENDS</span>
        </div>
      </div>
    </div>
  );
}