import { useState, useEffect } from 'react';

export default function ImageReveal({
  src = "/api/placeholder/400/400",
  revealSteps = 25,
  interval = 1200,
  onImageLoaded,
  gameMode = 'headshot'
}) {
  // State to track which blocks have been revealed
  const [revealedBlocks, setRevealedBlocks] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
 
  // Grid dimensions (5x5 grid = 25 blocks)
  const gridSize = 5;
  const totalCells = gridSize * gridSize;

  // Color themes based on game mode
  const themes = {
    headshot: {
      border: 'border-orange-500',
      shadow: 'rgba(255, 165, 0, 0.3)',
      accent: 'bg-orange-500',
      accentHover: 'rgba(255, 165, 0, 0.1)',
      progressGradient: 'from-orange-500 via-yellow-500 to-orange-600',
      progressShadow: 'rgba(255, 165, 0, 0.8)',
      textPrimary: 'text-orange-400',
      textSecondary: 'text-gray-400',
      spinnerBorder: 'border-orange-500'
    },
    'free-for-all': {
      border: 'border-purple-500',
      shadow: 'rgba(142, 68, 173, 0.3)',
      accent: 'bg-purple-500',
      accentHover: 'rgba(142, 68, 173, 0.1)',
      progressGradient: 'from-purple-500 via-blue-500 to-purple-600',
      progressShadow: 'rgba(142, 68, 173, 0.8)',
      textPrimary: 'text-purple-400',
      textSecondary: 'text-gray-400',
      spinnerBorder: 'border-purple-500'
    }
  };

  const currentTheme = themes[gameMode] || themes.headshot;

  // Preload image to prevent loading delays
  useEffect(() => {
    setImageLoaded(false);
    setRevealedBlocks([]);
    
    // img is loading
    if (onImageLoaded) {
      onImageLoaded(false);
    }

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      // Notify parent that image has loaded
      if (onImageLoaded) {
        onImageLoaded(true);
      }
    };
    img.onerror = () => {
      // Even if image fails to load, continue with reveal
      setImageLoaded(true);
      if (onImageLoaded) {
        onImageLoaded(true);
      }
    };
    img.src = src;
  }, [src, onImageLoaded]);

  useEffect(() => {
    // Don't start revealing until image is loaded
    if (!imageLoaded) return;
    
    console.log("Starting reveal sequence");
    
    // Reset revealed blocks when component mounts or props change
    setRevealedBlocks([]);
   
    const timer = setInterval(() => {
      setRevealedBlocks(prevBlocks => {
        // If we've revealed all blocks or reached revealSteps, stop
        if (prevBlocks.length >= Math.min(revealSteps, totalCells)) {
          clearInterval(timer);
          return prevBlocks;
        }
       
        // Find all blocks that haven't been revealed yet
        const remainingBlocks = [];
        for (let i = 0; i < totalCells; i++) {
          if (!prevBlocks.includes(i)) {
            remainingBlocks.push(i);
          }
        }
       
        // If no blocks left, return current state
        if (remainingBlocks.length === 0) {
          clearInterval(timer);
          return prevBlocks;
        }
       
        // Pick a random block from remaining blocks
        const randomIndex = Math.floor(Math.random() * remainingBlocks.length);
        const newBlock = remainingBlocks[randomIndex];
       
        console.log(`Revealing block ${newBlock} (${prevBlocks.length + 1}/${Math.min(revealSteps, totalCells)})`);
       
        // Return updated list with new block revealed
        return [...prevBlocks, newBlock];
      });
    }, interval);
   
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [imageLoaded, interval, revealSteps, totalCells]);

  // Calculate progress percentage
  const progressPercent = Math.min(100, (revealedBlocks.length / Math.min(revealSteps, totalCells)) * 100);

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Image Grid */}
      <div className="w-80 h-80 relative">
        {/* Grid Container with CS2 styling */}
        <div
          className={`w-full h-full border-4 ${currentTheme.border} overflow-hidden rounded-lg shadow-2xl`}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            gap: '0',
            backgroundColor: '#1a1a1a',
            boxShadow: '0 0 30px ${currentTheme.shadow}, inset 0 0 20px rgba(0, 0, 0, 0.8)'
          }}
        >
          {/* Dynamically create grid cells */}
          {Array.from({ length: totalCells }, (_, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            const isRevealed = revealedBlocks.includes(index);
           
            return (
              <div
                key={index}
                className={`relative transition-all duration-300 ${
                  isRevealed 
                    ? 'bg-gray-800 shadow-inner' 
                    : 'bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700'
                }`}
                style={{
                  boxShadow: isRevealed 
                    ? 'inset 0 2px 4px rgba(0, 0, 0, 0.8)' 
                    : '0 2px 4px ${currentTheme.accentHover}'
                }}
              >
                {isRevealed && imageLoaded && (
                  <div
                    className="w-full h-full overflow-hidden"
                    style={{
                      backgroundImage: `url(${src})`,
                      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                      backgroundPosition: `${col * 100 / (gridSize - 1)}% ${row * 100 / (gridSize - 1)}%`,
                      filter: 'contrast(1.1) saturate(1.2)'
                    }}
                  />
                )}
                {!isRevealed && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-2 h-2 ${currentTheme.accent} rounded-full opacity-20 animate-pulse`}></div>
                  </div>
                )}
                {isRevealed && !imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className={`w-4 h-4 border-2 ${currentTheme.spinnerBorder} border-t-transparent rounded-full animate-spin`}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Loading indicator overlay */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-white text-center">
              <div className={`w-8 h-8 border-4 ${currentTheme.spinnerBorder} border-t-transparent rounded-full animate-spin mx-auto mb-2`}></div>
              <div className="text-sm">Loading image...</div>
            </div>
          </div>
        )}
      </div>
     
      {/* CS2 HUD-style Progress Bar */}
      <div className="w-80 relative">
        <div className="h-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-inner">
          <div
            className={`h-full bg-gradient-to-r ${currentTheme.progressGradient} transition-all duration-500 shadow-lg`}
            style={{ 
              width: `${progressPercent}%`,
              boxShadow: `0 0 10px ${currentTheme.progressShadow}`
            }}
          ></div>
        </div>
        
        {/* HUD-style labels */}
        <div className="flex justify-between mt-2 text-xs">
          <span className={`${currentTheme.textPrimary} font-mono font-bold`}>REVEAL</span>
          <span className={`${currentTheme.textSecondary} font-mono`}>{Math.round(progressPercent)}%</span>
          <span className={`${currentTheme.textPrimary} font-mono font-bold`}>COMPLETE</span>
        </div>
      </div>
     
      {/* CS2 HUD-style Stats */}
      <div className={`bg-gradient-to-r from-gray-900 to-gray-800 border-2 ${currentTheme.border} rounded-lg px-4 py-2 shadow-lg`}>
        <div className="text-center">
          <div className={`${currentTheme.textPrimary} font-mono text-lg font-bold`}>
            {revealedBlocks.length} / {Math.min(revealSteps, totalCells)}
          </div>
          <div className={`${currentTheme.textSecondary} font-mono text-xs uppercase tracking-wide`}>
            Blocks Revealed
          </div>
        </div>
      </div>
    </div>
  );
}