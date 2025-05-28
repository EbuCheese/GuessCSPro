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
    <div className="min-h-screen" style={{ fontFamily: '"Inter", sans-serif' }}>
      {(mode === 'headshot' || mode === 'free-for-all') && (
        <ImageGames
          onBackToHome={handleBackToHome}
          initialGameMode={mode}
        />
      )}
     
      {mode !== 'headshot' && mode !== 'free-for-all' && (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Background */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0a0e1a 100%)',
              cursor: 'url(/crosshair.png) 16 16 crosshair' 
            }}
          />
          
          <div className="relative z-10 text-center p-8">
            <div 
              className="p-8 rounded-lg border border-gray-700 max-w-md"
              style={{
                background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.9) 0%, rgba(45, 55, 72, 0.7) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="text-6xl mb-6">🚧</div>
              <h3 
                className="text-2xl font-bold mb-4 text-orange-400"
                style={{ fontFamily: '"Rajdhani", sans-serif' }}
              >
                COMING SOON
              </h3>
              <p 
                className="text-gray-300 mb-6"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                Game mode "<strong className="text-white">{mode.toUpperCase()}</strong>" is currently in development.
              </p>
              <button
                onClick={handleBackToHome}
                className="px-8 py-4 font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(45deg, #FF6B35, #F39C12)',
                  color: '#000',
                  fontFamily: '"Rajdhani", sans-serif',
                  letterSpacing: '0.1em',
                  boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
                }}
              >
                BACK TO HOME
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          background: #0a0e1a;
          color: white;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}

export default App;