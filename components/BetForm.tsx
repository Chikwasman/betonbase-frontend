'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { useCreateBet } from '@/hooks/useCreateBet';
import { Prediction, TokenType, TOKEN_INFO } from '@/lib/contracts';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface BetFormProps {
  matchId: number;
  match: {
    homeTeam: string;
    awayTeam: string;
    bettingClosed: boolean;
  };
}

export function BetForm({ matchId, match }: BetFormProps) {
  const { address, isConnected } = useAccount();
  const [prediction, setPrediction] = useState<Prediction>(Prediction.HOME);
  const tokenType = TokenType.USDC; // Fixed to USDC only
  const [stake, setStake] = useState('');
  const [allowDraw, setAllowDraw] = useState(false);

  const { createBet, isLoading, error } = useCreateBet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stake || parseFloat(stake) <= 0) {
      alert('Please enter a valid stake amount');
      return;
    }

    try {
      // USDC has 6 decimals
      const stakeAmount = parseUnits(stake, 6);

      await createBet({
        matchId,
        prediction,
        tokenType,
        stake: stakeAmount,
        allowDraw,
      });

      // Reset form
      setStake('');
      alert('Bet created successfully!');
    } catch (err) {
      console.error('Error creating bet:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border dark:border-gray-800">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">Connect your wallet to place a bet</p>
      </div>
    );
  }

  if (match.bettingClosed) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center border dark:border-gray-700">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Betting is closed for this match</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-800 space-y-6">
      {/* Prediction Selection */}
      <div>
        <label className="block text-sm font-medium mb-3 dark:text-white">Your Prediction</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPrediction(Prediction.HOME)}
            className={`p-4 rounded-lg border-2 transition-all ${
              prediction === Prediction.HOME
                ? 'border-primary bg-primary/5 font-semibold'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Home</div>
            <div className="font-bold truncate dark:text-white">{match.homeTeam}</div>
          </button>

          <button
            type="button"
            onClick={() => setPrediction(Prediction.DRAW)}
            className={`p-4 rounded-lg border-2 transition-all ${
              prediction === Prediction.DRAW
                ? 'border-primary bg-primary/5 font-semibold'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Draw</div>
            <div className="font-bold dark:text-white">X</div>
          </button>

          <button
            type="button"
            onClick={() => setPrediction(Prediction.AWAY)}
            className={`p-4 rounded-lg border-2 transition-all ${
              prediction === Prediction.AWAY
                ? 'border-primary bg-primary/5 font-semibold'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Away</div>
            <div className="font-bold truncate dark:text-white">{match.awayTeam}</div>
          </button>
        </div>
      </div>

      {/* Token Display (USDC Only) */}
      <div>
        <label className="block text-sm font-medium mb-3 dark:text-white">Bet Currency</label>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">You're betting with</div>
              <div className="text-xl font-bold text-blue-900 dark:text-blue-300">
                {TOKEN_INFO[TokenType.USDC].symbol}
              </div>
            </div>
            <div className="text-3xl">💵</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {TOKEN_INFO[TokenType.USDC].name}
          </p>
        </div>
      </div>

      {/* Stake Amount */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-white">
          Stake Amount (USDC)
        </label>
        <input
          type="number"
          step="any"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          placeholder="Min: 10 USDC, Max: 1,000,000 USDC"
          className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Approximately ${stake || '0'} USD
        </p>
      </div>

      {/* Allow Draw Option */}
      {prediction !== Prediction.DRAW && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <input
            type="checkbox"
            id="allowDraw"
            checked={allowDraw}
            onChange={(e) => setAllowDraw(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="allowDraw" className="text-sm dark:text-gray-300">
            Allow draw (if match ends in draw, get refund)
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !stake}
        className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Creating Bet...</span>
          </>
        ) : (
          <>
            <TrendingUp className="h-5 w-5" />
            <span>Place Bet</span>
          </>
        )}
      </button>

      {/* Fee Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
        <p>Success fee: 2.5% on winnings</p>
        <p>Hidden fee: 0.001 ETH per transaction</p>
        <p>Bets close 15 minutes before match starts</p>
      </div>
    </form>
  );
}
