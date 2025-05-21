import { useState, useEffect } from 'react';

export default function ImageReveal({
  src = "/api/placeholder/400/400",
  revealSteps = 25,
  interval = 1500
}) {
  // State to track which blocks have been revealed
  const [revealedBlocks, setRevealedBlocks] = useState([]);
  
  // Grid dimensions (5x5 grid = 25 blocks)
  const gridSize = 5;
  const totalCells = gridSize * gridSize;

  useEffect(() => {
    console.log("Starting reveal sequence");
    
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
          return prevBlocks;
        }
       
        // Pick a random block from remaining blocks
        const randomIndex = Math.floor(Math.random() * remainingBlocks.length);
        const newBlock = remainingBlocks[randomIndex];
        
        // Return updated list with new block revealed
        return [...prevBlocks, newBlock];
      });
    }, interval);
   
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [interval, revealSteps, totalCells]);

  // Calculate progress percentage
  const progressPercent = Math.min(100, (revealedBlocks.length / Math.min(revealSteps, totalCells)) * 100);

  return (
    <div className="flex flex-col gap-6 items-center">
      {/* Image Grid */}
      <div className="w-100 h-100 relative">
        {/* Grid Container */}
        <div
          className="w-full h-full border-2 border-gray-300 overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            gap: '0', // Removed the gap between cells
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
                className="relative bg-gray-900"
              >
                {isRevealed && (
                  <div 
                    className="w-full h-full overflow-hidden" 
                    style={{
                      backgroundImage: `url(${src})`,
                      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                      backgroundPosition: `${col * 100 / (gridSize - 1)}% ${row * 100 / (gridSize - 1)}%`
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-100 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      
      {/* Stats */}
      <div className="text-md text-gray-600">
        {revealedBlocks.length} of {Math.min(revealSteps, totalCells)} blocks revealed ({Math.round(progressPercent)}%)
      </div>
    </div>
  );
}