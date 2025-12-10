'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
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
  const [tokenType, setTokenType] = useState<TokenType>(TokenType.ETH);
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
      const stakeAmount = tokenType === TokenType.USDC 
        ? parseUnits(stake, 6)
        : parseEther(stake);

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
      <div className="bg-white rounded-xl p-8 text-center border">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Connect your wallet to place a bet</p>
      </div>
    );
  }

  if (match.bettingClosed) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center border">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Betting is closed for this match</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border space-y-6">
      {/* Prediction Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">Your Prediction</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPrediction(Prediction.HOME)}
            className={`p-4 rounded-lg border-2 transition-all ${
              prediction === Prediction.HOME
                ? 'border-primary bg-primary/5 font-semibold'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">Home</div>
            <div className="font-bold truncate">{match.homeTeam}</div>
          </button>

          <button
            type="button"
            onClick={() => setPrediction(Prediction.DRAW)}
            className={`p-4 rounded-lg border-2 transition-all ${
              prediction === Prediction.DRAW
                ? 'border-primary bg-primary/5 font-semibold'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">Draw</div>
            <div className="font-bold">X</div>
          </button>

          <button
            type="button"
            onClick={() => setPrediction(Prediction.AWAY)}
            className={`p-4 rounded-lg border-2 transition-all ${
              prediction === Prediction.AWAY
                ? 'border-primary bg-primary/5 font-semibold'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">Away</div>
            <div className="font-bold truncate">{match.awayTeam}</div>
          </button>
        </div>
      </div>

      {/* Token Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">Bet With</label>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(TOKEN_INFO).map(([key, info]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTokenType(parseInt(key) as TokenType)}
              className={`p-3 rounded-lg border-2 transition-all ${
                tokenType === parseInt(key)
                  ? 'border-primary bg-primary/5 font-semibold'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {info.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Stake Amount */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Stake Amount ({TOKEN_INFO[tokenType].symbol})
        </label>
        <input
          type="number"
          step="any"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          placeholder={`Min: $10 USD, Max: $1M USD`}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-gray-500 mt-2">
          Approximately ${stake || '0'} USD (based on current price)
        </p>
      </div>

      {/* Allow Draw Option */}
      {prediction !== Prediction.DRAW && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="allowDraw"
            checked={allowDraw}
            onChange={(e) => setAllowDraw(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="allowDraw" className="text-sm">
            Allow draw (if match ends in draw, get refund)
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !stake}
        className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>Success fee: 2.5% </p>
        <p>Bets close 15 minutes before match starts</p>
      </div>
    </form>
  );
}