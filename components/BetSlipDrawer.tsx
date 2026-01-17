'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useAccount } from 'wagmi';

interface BetSlipItem {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  prediction: 'HOME' | 'AWAY' | 'DRAW';
  stake: string;
}

export function BetSlipDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [bets, setBets] = useState<BetSlipItem[]>([]);
  const { isConnected } = useAccount();

  // Listen for bet additions (you can implement this with context/state management)
  useEffect(() => {
    // This is a placeholder - implement with your actual state management
    // Example: Subscribe to a global state or context
  }, []);

  const removeBet = (matchId: number) => {
    setBets(prev => prev.filter(bet => bet.matchId !== matchId));
  };

  const clearAllBets = () => {
    setBets([]);
  };

  const totalStake = bets.reduce((sum, bet) => sum + parseFloat(bet.stake || '0'), 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`
          fixed bottom-16 left-0 right-0 z-50 lg:hidden
          bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-800
          rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-56px)]'}
        `}
      >
        {/* Handle Bar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-3 px-4 flex items-center justify-between bg-gradient-to-r from-green-600 to-green-700"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-sm">
                BET SLIP {bets.length > 0 && `(${bets.length})`}
              </div>
              {bets.length > 0 && (
                <div className="text-white/80 text-xs">
                  Total: {totalStake.toFixed(2)} ZKL
                </div>
              )}
            </div>
          </div>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-white" />
          ) : (
            <ChevronUp className="h-5 w-5 text-white" />
          )}
        </button>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {bets.length === 0 ? (
            <div className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Your bet slip is empty
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Tap matches to add bets
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Clear All Button */}
              <button
                onClick={clearAllBets}
                className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Bets
              </button>

              {/* Bet Items */}
              {bets.map((bet) => (
                <div
                  key={bet.matchId}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {bet.homeTeam} vs {bet.awayTeam}
                      </div>
                      <div className={`text-xs font-bold uppercase
                        ${bet.prediction === 'HOME' ? 'text-blue-600 dark:text-blue-400' : ''}
                        ${bet.prediction === 'DRAW' ? 'text-gray-600 dark:text-gray-400' : ''}
                        ${bet.prediction === 'AWAY' ? 'text-red-600 dark:text-red-400' : ''}
                      `}>
                        {bet.prediction} to win
                      </div>
                    </div>
                    <button
                      onClick={() => removeBet(bet.matchId)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Stake:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {bet.stake} ZKL
                    </span>
                  </div>
                </div>
              ))}

              {/* Total Section */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4">
                <div className="flex items-center justify-between text-white mb-2">
                  <span className="font-medium">Total Stake</span>
                  <span className="text-2xl font-bold">{totalStake.toFixed(2)} ZKL</span>
                </div>
                <div className="text-xs text-white/80">
                  + 0.0001 ETH platform fee per bet
                </div>
              </div>

              {/* Place Bets Button */}
              {isConnected ? (
                <button className="w-full bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 font-bold py-4 rounded-lg border-2 border-green-600 dark:border-green-500 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
                  PLACE {bets.length} BET{bets.length !== 1 ? 'S' : ''}
                </button>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    Connect wallet to place bets
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
