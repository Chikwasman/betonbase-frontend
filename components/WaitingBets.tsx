'use client';

import { useWaitingBets } from '@/hooks/useWaitingBets';
import { useMatchBet } from '@/hooks/useMatchBet';
import { formatStake, getPredictionLabel } from '@/lib/utils';
import { TOKEN_INFO, Prediction } from '@/lib/contracts';
import { TrendingUp, Loader2, Lock, Users } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useState } from 'react';

export function WaitingBets({ matchId }: { matchId: number }) {
  const { address } = useAccount();
  const { bets, isLoading } = useWaitingBets(matchId);
  const { matchBet, isLoading: isMatching, isApproving } = useMatchBet();
  const [matchingBetId, setMatchingBetId] = useState<bigint | null>(null);
  const [allowDrawMap, setAllowDrawMap] = useState<{ [key: string]: boolean }>({});
  const [predictionMap, setPredictionMap] = useState<{ [key: string]: Prediction }>({});

  const handleMatch = async (bet: any, allowDraw: boolean, prediction: Prediction) => {
    try {
      setMatchingBetId(bet.betId);
      
      // ✅ Pass the waiting bet's stake (contract enforces matching)
      await matchBet({ 
        betId: bet.betId, 
        targetBetStake: bet.stake, // ✅ CRITICAL: Must match waiting bet's stake
        allowDraw, 
        prediction 
      });
      
      alert('Bet matched successfully!');
    } catch (error) {
      console.error('Error matching bet:', error);
      alert('Failed to match bet');
    } finally {
      setMatchingBetId(null);
    }
  };

  const toggleAllowDraw = (betId: bigint) => {
    setAllowDrawMap(prev => ({
      ...prev,
      [betId.toString()]: !prev[betId.toString()]
    }));
  };

  const getOppositePrediction = (prediction: Prediction): Prediction => {
    if (prediction === Prediction.HOME) return Prediction.AWAY;
    if (prediction === Prediction.AWAY) return Prediction.HOME;
    return Prediction.HOME;
  };

  const getMatchingPrediction = (bet: any): Prediction => {
    const betIdStr = bet.betId.toString();
    
    if (predictionMap[betIdStr] !== undefined) {
      return predictionMap[betIdStr];
    }
    
    if (bet.prediction === Prediction.DRAW) {
      return Prediction.HOME;
    }
    
    return getOppositePrediction(bet.prediction);
  };

  const setPredictionForBet = (betId: bigint, prediction: Prediction) => {
    setPredictionMap(prev => ({
      ...prev,
      [betId.toString()]: prediction
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border dark:border-gray-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!bets || bets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border dark:border-gray-800 text-center">
        <p className="text-gray-500 dark:text-gray-400">No bets available to match</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Be the first to create a bet!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ✅ APPROVAL STATUS BANNER */}
      {isApproving && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Approving ZKL Tokens</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Step 1 of 2: Please confirm in your wallet...</p>
            </div>
          </div>
        </div>
      )}

      {bets.map((bet) => {
        const tokenInfo = TOKEN_INFO;
        const isPrivate = bet.targetBettor && bet.targetBettor !== '0x0000000000000000000000000000000000000000';
        const canMatch = !isPrivate || (isPrivate && address?.toLowerCase() === bet.targetBettor?.toLowerCase());
        const isMatchingThis = matchingBetId === bet.betId;
        const allowDraw = allowDrawMap[bet.betId.toString()] || false;
        const matchingPrediction = getMatchingPrediction(bet);
        const isDrawBet = bet.prediction === Prediction.DRAW;
        
        return (
          <div
            key={bet.betId.toString()}
            className={`bg-white dark:bg-gray-900 rounded-lg p-4 border dark:border-gray-800 transition-all ${
              canMatch ? 'hover:shadow-md hover:border-primary dark:hover:border-primary' : 'opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-semibold text-lg text-gray-900 dark:text-white">
                    {getPredictionLabel(bet.prediction)}
                  </div>
                  {isPrivate && (
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-full flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Private
                    </span>
                  )}
                  {!isPrivate && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Public
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Bet ID: #{bet.betId.toString()}
                </div>
                {isPrivate && !canMatch && (
                  <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                    🔒 This bet is only for a specific bettor
                  </div>
                )}
                {bet.allowDraw && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    ⚖️ Original bettor allowed draw
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg text-gray-900 dark:text-white">
                  {formatStake(bet.stake, tokenInfo.decimals)} {tokenInfo.symbol}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You pay this amount
                </div>
              </div>
            </div>

            {/* ✅ DRAW BET: Choose HOME or AWAY */}
            {canMatch && isDrawBet && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Choose your prediction to match this DRAW bet:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPredictionForBet(bet.betId, Prediction.HOME)}
                    className={`px-3 py-2 rounded border-2 text-sm font-medium transition-all ${
                      matchingPrediction === Prediction.HOME
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-900 dark:text-white'
                    }`}
                  >
                    Match with HOME
                  </button>
                  <button
                    type="button"
                    onClick={() => setPredictionForBet(bet.betId, Prediction.AWAY)}
                    className={`px-3 py-2 rounded border-2 text-sm font-medium transition-all ${
                      matchingPrediction === Prediction.AWAY
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-900 dark:text-white'
                    }`}
                  >
                    Match with AWAY
                  </button>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  💡 You win if your choice wins, lose if DRAW
                </p>
              </div>
            )}

            {/* Show auto-selected prediction for non-DRAW bets */}
            {canMatch && !isDrawBet && (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Your prediction: <span className="text-primary">{getPredictionLabel(matchingPrediction)}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically set to opposite of waiting bet
                </p>
              </div>
            )}

            {/* ✅ FIXED: Hide draw checkbox if matching DRAW bet */}
            {canMatch && !isDrawBet && (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDraw}
                    onChange={() => toggleAllowDraw(bet.betId)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Allow draw outcome
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  {allowDraw 
                    ? '✅ Both bettors get refunded if match ends in draw' 
                    : '❌ You lose if match ends in draw (unless you predicted draw)'}
                </p>
              </div>
            )}

            {/* ✅ CRITICAL: Explain DRAW bet logic */}
            {canMatch && isDrawBet && (
              <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                  ⚠️ DRAW Bet Rules:
                </p>
                <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1 ml-4 list-disc">
                  <li>They predicted DRAW, you predict HOME or AWAY</li>
                  <li>If match ends DRAW → They win, you lose</li>
                  <li>If your prediction wins → You win, they lose</li>
                  <li>Draw option is disabled (they already bet on draw)</li>
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {bet.createdAt && Number(bet.createdAt) > 0 ? (
                  <>Created {new Date(Number(bet.createdAt) * 1000).toLocaleDateString()}</>
                ) : (
                  <>Bet ID: #{bet.betId.toString()}</>
                )}
              </div>

              <button
                onClick={() => handleMatch(bet, allowDraw, matchingPrediction)}
                disabled={!canMatch || isMatching}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isMatchingThis ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isApproving ? 'Approving...' : 'Matching...'}</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    <span>{canMatch ? 'Match Bet' : 'Cannot Match'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
