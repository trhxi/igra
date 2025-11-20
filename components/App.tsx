import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameState } from './types';
import { Github, Keyboard } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState['status']>('menu');

  const handleStart = () => setGameState('playing');
  const handleWin = () => setGameState('won');
  const handleRestart = () => setGameState('menu');

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      
      <header className="mb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-orange-400 mb-2 tracking-wider" style={{ textShadow: '4px 4px 0 #000' }}>
          KOTO QUEST
        </h1>
        <p className="text-slate-400 text-sm md:text-base">Marsik & Marusya's Adventure</p>
      </header>

      {gameState === 'menu' && (
        <div className="max-w-2xl w-full bg-slate-800 p-8 rounded-xl border-4 border-slate-700 shadow-2xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl text-yellow-400">MISSION: FIND POLINA</h2>
            <p className="text-slate-300 leading-relaxed">
              Marsik (Ginger) and Marusya (Tuxedo) are lost! Work together to navigate the obstacles and reach Polina. Both cats must touch Polina to win.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-900/50 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-500 mb-4 relative">
                 <div className="absolute -top-2 left-0 w-3 h-3 bg-orange-500 transform rotate-45"></div>
                 <div className="absolute -top-2 right-0 w-3 h-3 bg-orange-500 transform rotate-45"></div>
              </div>
              <h3 className="text-orange-500 font-bold mb-2">MARSIK</h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Keyboard size={16} />
                <span>WASD to Move</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-neutral-900 mb-4 relative">
                <div className="absolute bottom-3 left-3 right-3 h-4 bg-white"></div>
                 <div className="absolute -top-2 left-0 w-3 h-3 bg-neutral-900 transform rotate-45"></div>
                 <div className="absolute -top-2 right-0 w-3 h-3 bg-neutral-900 transform rotate-45"></div>
              </div>
              <h3 className="text-white font-bold mb-2">MARUSYA</h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Keyboard size={16} />
                <span>Arrows to Move</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1 transition-all text-xl animate-pulse"
          >
            START GAME
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="relative">
          <GameCanvas onWin={handleWin} />
          <div className="absolute top-4 left-4 text-xs text-slate-500 bg-black/50 p-2 rounded">
            <p>Controls:</p>
            <p>P1 (Marsik): WASD</p>
            <p>P2 (Marusya): Arrows</p>
          </div>
          <button 
            onClick={handleRestart}
            className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-500 text-white text-xs px-3 py-2 rounded border-2 border-red-800"
          >
            ABORT
          </button>
        </div>
      )}

      {gameState === 'won' && (
        <div className="text-center bg-slate-800 p-10 rounded-xl border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
          <h2 className="text-4xl text-yellow-400 mb-6 animate-bounce">MEOW! YOU WON!</h2>
          <p className="text-slate-300 mb-8">Marsik and Marusya found Polina!</p>
          <div className="flex justify-center gap-4 mb-8">
             {/* Victory Scene mockup */}
             <div className="flex items-end gap-2">
                 <div className="w-8 h-8 bg-orange-500 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                 <div className="w-10 h-16 bg-blue-500 relative">
                    <div className="absolute top-0 w-full h-4 bg-red-500"></div>
                 </div>
                 <div className="w-8 h-8 bg-neutral-900 animate-bounce" style={{animationDelay: '0.2s'}}>
                    <div className="absolute bottom-2 left-2 right-2 h-2 bg-white"></div>
                 </div>
             </div>
          </div>
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-[0_4px_0_rgb(37,99,235)] active:shadow-none active:translate-y-1 transition-all"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
      
      <footer className="mt-12 text-slate-600 text-xs flex items-center gap-2">
        <span>Made with React & Canvas</span>
      </footer>
    </div>
  );
};

export default App;
