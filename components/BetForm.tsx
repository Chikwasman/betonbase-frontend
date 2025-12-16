'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { useCreateBet } from '@/hooks/useCreateBet';
import { Prediction, TokenType, TOKEN_INFO } from '@/lib/contracts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { DrawCheckbox } from '@/components/DrawCheckbox';
import { PrivateBetToggle } from '@/components/PrivateBetToggle';
import { DrawStrategyExplainer } from '@/components/DrawStrategyExplainer';

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
  const [tokenType, setTokenType] = useState<TokenType>(TokenType.ZKLEGEND); // Default to ZKL for testnet
  const [stake, setStake] = useState('');
  const [allowDraw, setAllowDraw] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [targetAddress, setTargetAddress] = useState('');
  const [showExplainer, setShowExplainer] = useState(false);

  const { createBet, isLoading, error } = useCreateBet();

  // Validation
  const isValidTargetAddress = targetAddress === '' || /^0x[a-fA-F0-9]{40}$/.test(targetAddress);
  const canSubmit = stake && parseFloat(stake) > 0 && (!isPrivate || (isPrivate && isValidTargetAddress && targetAddress !== ''));
  
  // CRITICAL: If predicting DRAW, must allow draw
  const drawPredictionError = prediction === Prediction.DRAW && !allowDraw;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stake || parseFloat(stake) <= 0) {
      alert('Please enter a valid stake amount');
      return;
    }

    // Validation: DRAW prediction requires allowDraw
    if (prediction === Prediction.DRAW && !allowDraw) {
      alert('You must check "Allow Draw" to predict DRAW');
      return;
    }

    if (isPrivate && !isValidTargetAddress) {
      alert('Please enter a valid wallet address');
      return;
    }

    if (isPrivate && targetAddress === '') {
      alert('Please enter your friend\'s wallet address');
      return;
    }

    try {
      const stakeAmount = tokenType === TokenType.USDC 
        ? parseUnits(stake, 6)
        : tokenType === TokenType.ZKLEGEND
        ? parseUnits(stake, 18) // ZKL has 18 decimals
        : parseEther(stake);

      await createBet({
        matchId,
        prediction,
        tokenType,
        stake: stakeAmount,
        allowDraw,
        targetBettor: isPrivate ? targetAddress as `0x${string}` : '0x0000000000000000000000000000000000000000', // NEW parameter
      });

      // Reset form
      setStake('');
      setAllowDraw(false);
      setIsPrivate(false);
      setTargetAddress('');
      alert('Bet created successfully!');
    } catch (err) {
      console.error('Error creating bet:', err);
    }
  };

  const handlePredictionChange = (newPrediction: Prediction) => {
    setPrediction(newPrediction);
    
    // Auto-check allowDraw if selecting DRAW
    if (newPrediction === Prediction.DRAW) {
      setAllowDraw(true);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border dark:border-gray-800">
        <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">Connect your wallet to place a bet</p>
      </div>
    );
  }

  if (match.bettingClosed) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center border dark:border-gray-700">
        <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
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
            onClick={() => handlePredictionChange(Prediction.HOME)}
            className={`p-4 rounded-lg border-2 transition-all ${
              prediction === Prediction.HOME
                ? 'border-primary bg-primary/5 dark:bg-primary/10 font-semibold'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Home</div>
            <div className="font-bold truncate dark:text-white">{match.homeTeam}</div>
          </button>

          <button
            type="button"
            onClick={() => handlePredictionChange(Prediction.DRAW)}
            className={`p-4 rounded-lg border-2 transition-all ${
              prediction === Prediction.DRAW
                ? 'border-primary bg-primary/5 dark:bg-primary/10 font-semibold'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Draw</div>
            <div className="font-bold dark:text-white">X</div>
          </button>

          <button
            type="button"
            onClick={() => handlePredictionChange(Prediction.AWAY)}
            className={`p-4 rounded-lg border-2 transition-all ${
              prediction === Prediction.AWAY
                ? 'border-primary bg-primary/5 dark:bg-primary/10 font-semibold'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Away</div>
            <div className="font-bold truncate dark:text-white">{match.awayTeam}</div>
          </button>
        </div>
      </div>

      {/* Token Selection */}
      <div>
        <label className="block text-sm font-medium mb-3 dark:text-white">Bet With</label>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(TOKEN_INFO).map(([key, info]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTokenType(parseInt(key) as TokenType)}
              className={`p-3 rounded-lg border-2 transition-all ${
                tokenType === parseInt(key)
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 font-semibold'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="dark:text-white">{info.symbol}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stake Amount */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-white">
          Stake Amount ({TOKEN_INFO[tokenType].symbol})
        </label>
        <input
          type="number"
          step="any"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          placeholder={`Min: $10 USD, Max: $1M USD`}
          className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Minimum: $10 USD | Maximum: $1,000,000 USD
        </p>
      </div>

      {/* Draw Checkbox - NEW COMPONENT */}
      <div className="border-t dark:border-gray-700 pt-4">
        <DrawCheckbox
          checked={allowDraw}
          onChange={setAllowDraw}
          disabled={prediction === Prediction.DRAW} // Can't uncheck if predicting DRAW
          isCreator={true}
        />
        
        {/* Error if DRAW prediction without allowDraw */}
        {drawPredictionError && (
          <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              ⚠️ You must check "Allow Draw" to predict DRAW
            </p>
          </div>
        )}
      </div>

      {/* Learn More Button */}
      <button
        type="button"
        onClick={() => setShowExplainer(!showExplainer)}
        className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
      >
        {showExplainer ? '− Hide' : '+ Learn More About Draw Strategy'}
      </button>

      {/* Draw Explainer */}
      {showExplainer && (
        <div className="border-t dark:border-gray-700 pt-4">
          <DrawStrategyExplainer isCreator={true} showDetailed={true} />
        </div>
      )}

      {/* Private Bet Toggle - NEW COMPONENT */}
      <div className="border-t dark:border-gray-700 pt-4">
        <PrivateBetToggle
          isPrivate={isPrivate}
          onToggle={setIsPrivate}
          targetAddress={targetAddress}
          onAddressChange={setTargetAddress}
          disabled={isLoading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !canSubmit || drawPredictionError}
        className="w-full bg-green-600 dark:bg-green-700 text-white py-4 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Creating Bet...</span>
          </>
        ) : (
          <>
            <TrendingUp className="h-5 w-5" />
            <span>{isPrivate ? 'Create Private Bet' : 'Place Bet'}</span>
          </>
        )}
      </button>

      {/* Fee Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
        <p>Winner pays 2.5% fee on winnings</p>
        <p>Betting closes 15 minutes before match starts</p>
        {isPrivate && <p className="text-purple-600 dark:text-purple-400 font-medium">🔒 This will be a private bet</p>}
      </div>
    </form>
  );
}
