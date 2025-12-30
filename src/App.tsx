import { useState, useEffect } from 'react'
import Calculator from './components/Calculator'
import AveragePrice from './components/AveragePrice'

function App() {
  const [currentView, setCurrentView] = useState<'leverage' | 'average'>(() => {
    return (localStorage.getItem('currentView') as 'leverage' | 'average') || 'leverage';
  });

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col items-center mb-10">
          <div className="relative animate-float-group">
            {/* BTC Icon - Top Right */}
            <div className="absolute -top-12 -right-16 w-16 h-16 z-10 rounded-full shadow-[0_0_15px_rgba(247,147,26,0.5)]">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg"
                alt="BTC"
                className="w-full h-full rounded-full"
              />
            </div>

            {/* ETH Icon - Bottom Left */}
            <div className="absolute -bottom-8 -left-16 w-14 h-14 z-10 bg-white rounded-full p-1 shadow-[0_0_15px_rgba(98,126,234,0.5)]">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Ethereum-icon-purple.svg"
                alt="ETH"
                className="w-full h-full rounded-full"
              />
            </div>

            <h1 className="text-7xl md:text-9xl text-[#eef2f6] drop-shadow-[6px_6px_0_#00f0ff] inline-block relative font-['Press_Start_2P'] tracking-tighter select-none" style={{ fontFamily: '"Press Start 2P", cursive' }}>
              H-IT
            </h1>
          </div>
          <div className="mt-6 relative inline-block">
            {/* Ghost element for fixed width */}
            <p className="text-[#8b9bb4] tracking-[0.2em] text-sm md:text-base uppercase font-bold opacity-0 pr-1">
              CRYPTO TRADING TOOLS
            </p>
            {/* Animated element */}
            <p className="absolute top-0 left-0 text-[#8b9bb4] tracking-[0.2em] text-sm md:text-base uppercase font-bold typing-effect pr-1">
              CRYPTO TRADING TOOLS
            </p>
          </div>
        </div>

        {/* Global Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-[#161b33] border border-[#232d4b] rounded-lg relative">
            <button
              onClick={() => setCurrentView('leverage')}
              className={`px-6 py-3 text-xs md:text-sm font-['Press_Start_2P'] uppercase transition-all duration-300 relative z-10 ${currentView === 'leverage' ? 'text-[#0b1026]' : 'text-[#8b9bb4] hover:text-[#eef2f6]'
                }`}
            >
              Leverage Calc
            </button>
            <button
              onClick={() => setCurrentView('average')}
              className={`px-6 py-3 text-xs md:text-sm font-['Press_Start_2P'] uppercase transition-all duration-300 relative z-10 ${currentView === 'average' ? 'text-[#0b1026]' : 'text-[#8b9bb4] hover:text-[#eef2f6]'
                }`}
            >
              Avg Price (DCA)
            </button>

            {/* Sliding Background */}
            <div
              className={`absolute top-1 bottom-1 rounded bg-[#00f0ff] transition-all duration-300 ease-out shadow-[0_0_15px_rgba(0,240,255,0.5)]`}
              style={{
                left: currentView === 'leverage' ? '0.25rem' : 'calc(50% + 0.125rem)',
                width: 'calc(50% - 0.375rem)'
              }}
            />
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentView === 'leverage' ? <Calculator /> : <AveragePrice />}
        </div>
      </div>
    </div>

  )
}

export default App


