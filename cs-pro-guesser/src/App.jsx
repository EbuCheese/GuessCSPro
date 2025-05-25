import { useState } from 'react';
import './main.css';
import HomePage from './components/HomePage';
import ImageGames from './components/ImageGames';

function App() {
  const [mode, setMode] = useState(null);
  
  const handleBackToHome = () => {
    setMode(null);
  };

  if (!mode) {
    return <HomePage onSelectMode={setMode} />;
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl mb-5">Guess the Counter-Strike Pro</h1>
      
      {mode === 'headshot' && (
        <ImageGames 
          onBackToHome={handleBackToHome}
        />
      )}

      {mode === 'free-for-all' && (
        <ImageGames 
          onBackToHome={handleBackToHome}
        />
      )}
      
      {/* other game mode components here */}
      {mode !== 'headshot' && (
        <div className="text-gray-400 mt-4">
          <button 
            onClick={handleBackToHome} 
            className="text-blue-400 hover:underline mr-2"
          >
            Go back
          </button>
          Game mode "{mode}" is coming soon.
        </div>
      )}
    </div>
  );
}

export default App;