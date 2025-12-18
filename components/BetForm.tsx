'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { useCreateBet } from '@/hooks/useCreateBet';
import { Prediction, TOKEN_INFO } from '@/lib/contracts';
import { TrendingUp, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
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
  const [stake, setStake] = useState('');
  const [allowDraw, setAllowDraw] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [targetAddress, setTargetAddress] = useState('');
  const [showExplainer, setShowExplainer] = useState(false);

  const { createBet, isLoading, isApproving, error } = useCreateBet();

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
      const stakeAmount = parseUnits(stake, 18);

      await createBet({
        matchId,
        prediction,
        stake: stakeAmount,
        allowDraw,
        targetBettor: isPrivate ? targetAddress as `0x${string}` : '0x0000000000000000000000000000000000000000',
      });

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
      
      {/* Approval Status Banner */}
      {(isApproving || (isLoading && !isApproving)) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <div className="flex-1">
              {isApproving ? (
                <>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Approving ZKL Tokens</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Step 1 of 2: Please confirm the approval in your wallet...</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Creating Your Bet</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Step 2 of 2: Please confirm the transaction in your wallet...</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prediction Selection */}
      <div>
        <label className="block text-sm font-medium mb-3 text-gray-900 dark:text-white">Your Prediction</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handlePredictionChange(Prediction.HOME)}
            disabled={isLoading}
            className={`p-4 rounded-lg border-2 transition-all ${
              prediction === Prediction.HOME
                ? 'border-primary bg-primary/5 dark:bg-primary/10 font-semibold'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Home</div>
            {/* ✅ FIXED: Added text-gray-900 for light mode */}
            <div className="font-bold truncate text-gray-900 dark:text-white">{match.homeTeam}</div>
          </button>

          <button
            type="button"
            onClick={() => handlePredictionChange(Prediction.DRAW)}
            disabled={isLoading}
            className={`p-4 rounded-lg border-2 transition-all ${
              prediction === Prediction.DRAW
                ? 'border-primary bg-primary/5 dark:bg-primary/10 font-semibold'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Draw</div>
            {/* ✅ FIXED: Added text-gray-900 for light mode */}
            <div className="font-bold text-gray-900 dark:text-white">X</div>
          </button>

          <button
            type="button"
            onClick={() => handlePredictionChange(Prediction.AWAY)}
            disabled={isLoading}
            className={`p-4 rounded-lg border-2 transition-all ${
              prediction === Prediction.AWAY
                ? 'border-primary bg-primary/5 dark:bg-primary/10 font-semibold'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Away</div>
            {/* ✅ FIXED: Added text-gray-900 for light mode */}
            <div className="font-bold truncate text-gray-900 dark:text-white">{match.awayTeam}</div>
          </button>
        </div>
      </div>

      {/* Token Display */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">💎</div>
          <div>
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Betting Token</div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{TOKEN_INFO.symbol} - {TOKEN_INFO.name}</div>
          </div>
        </div>
      </div>

      {/* Stake Amount */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
          Stake Amount ({TOKEN_INFO.symbol})
        </label>
        <input
          type="number"
          step="any"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          disabled={isLoading}
          placeholder={`Enter amount in ${TOKEN_INFO.symbol}`}
          className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Minimum: 10 {TOKEN_INFO.symbol} | Maximum: 1,000,000 {TOKEN_INFO.symbol}
        </p>
      </div>

      {/* Draw Checkbox */}
      <div className="border-t dark:border-gray-700 pt-4">
        <DrawCheckbox
          checked={allowDraw}
          onChange={setAllowDraw}
          disabled={prediction === Prediction.DRAW || isLoading}
          isCreator={true}
        />
        
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
        disabled={isLoading}
        className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {showExplainer ? '∧ Hide' : '+ Learn More About Draw Strategy'}
      </button>

      {/* Draw Explainer */}
      {showExplainer && (
        <div className="border-t dark:border-gray-700 pt-4">
          <DrawStrategyExplainer isCreator={true} showDetailed={true} />
        </div>
      )}

      {/* Private Bet Toggle */}
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
        {isApproving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <div className="flex flex-col items-center">
              <span>Approving ZKL...</span>
              <span className="text-xs opacity-75">Step 1 of 2</span>
            </div>
          </>
        ) : isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <div className="flex flex-col items-center">
              <span>Creating Bet...</span>
              <span className="text-xs opacity-75">Step 2 of 2</span>
            </div>
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
        <p className="text-blue-600 dark:text-blue-400">All bets use {TOKEN_INFO.symbol} tokens</p>
        {isPrivate && <p className="text-purple-600 dark:text-purple-400 font-medium">🔒 This will be a private bet</p>}
        {isApproving && (
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            💡 First time? You need to approve ZKL spending once
          </p>
        )}
      </div>
    </form>
  );
}