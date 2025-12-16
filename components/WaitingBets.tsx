'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useWaitingBets } from '@/hooks/useWaitingBets';
import { useMatchBet } from '@/hooks/useMatchBet';
import { formatStake, getPredictionLabel, formatUSD } from '@/lib/utils';
import { TOKEN_INFO, TokenType } from '@/lib/contracts';
import { TrendingUp, Loader2, Lock, AlertTriangle, Info } from 'lucide-react';
import { DrawCheckbox } from '@/components/DrawCheckbox';
import { DrawStrategyExplainer } from '@/components/DrawStrategyExplainer';

export function WaitingBets({ matchId }: { matchId: number }) {
  const { address } = useAccount();
  const { bets, isLoading } = useWaitingBets(matchId);
  const { matchBet, isLoading: isMatching } = useMatchBet();
  const [matchingBetId, setMatchingBetId] = useState<bigint | null>(null);
  const [allowDrawMap, setAllowDrawMap] = useState<Record<string, boolean>>({});
  const [showExplainerFor, setShowExplainerFor] = useState<string | null>(null);

  const handleMatch = async (betId: bigint) => {
    try {
      setMatchingBetId(betId);
      const allowDraw = allowDrawMap[betId.toString()] || false;
      await matchBet(betId, allowDraw); // Pass allowDraw parameter
      alert('Bet matched successfully!');
    } catch (error) {
      console.error('Error matching bet:', error);
    } finally {
      setMatchingBetId(null);
    }
  };

  const setAllowDrawForBet = (betId: bigint, value: boolean) => {
    setAllowDrawMap(prev => ({
      ...prev,
      [betId.toString()]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border dark:border-gray-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-600" />
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
      <h3 className="text-lg font-semibold dark:text-white mb-3">Available Bets</h3>
      
      {bets.map((bet) => {
        const tokenInfo = TOKEN_INFO[bet.tokenType as TokenType];
        const isPrivate = bet.targetBettor && bet.targetBettor !== '0x0000000000000000000000000000000000000000';
        const canMatch = !isPrivate || (isPrivate && address?.toLowerCase() === bet.targetBettor?.toLowerCase());
        const isMatchingThis = matchingBetId === bet.betId;
        const allowDraw = allowDrawMap[bet.betId.toString()] || false;
        
        return (
          <div
            key={bet.betId.toString()}
            className={`bg-white dark:bg-gray-900 rounded-lg p-4 border dark:border-gray-800 transition-all ${
              canMatch ? 'hover:shadow-md hover:border-primary dark:hover:border-primary' : 'opacity-75'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-semibold text-lg dark:text-white">
                    {getPredictionLabel(bet.prediction)}
                  </div>
                  
                  {/* Private Indicator */}
                  {isPrivate && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                      canMatch 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <Lock className="h-3 w-3" />
                      {canMatch ? 'For You' : 'Private'}
                    </span>
                  )}
                  
                  {/* Draw Indicator */}
                  {bet.allowDraw ? (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                      ✅ Draw Allowed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                      ❌ No Draw
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Bet ID: #{bet.betId.toString()}
                </div>
              </div>
              
              {/* Stake */}
              <div className="text-right">
                <div className="font-bold text-lg dark:text-white">
                  {formatStake(bet.stake, tokenInfo.decimals)} {tokenInfo.symbol}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {bet.usdValue && formatUSD(bet.usdValue)}
                </div>
              </div>
            </div>

            {/* Warning/Info Box */}
            {canMatch && (
              <>
                {bet.allowDraw ? (
                  <div className="mb-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-orange-900 dark:text-orange-100">
                        <p className="font-semibold">⚠️ Opponent Allowed Draw!</p>
                        <p className="mt-1 text-orange-800 dark:text-orange-200">
                          If you DON'T check "Allow Draw" below and match draws, opponent wins everything!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900 dark:text-blue-100">
                        <p className="font-semibold">💡 Opportunity!</p>
                        <p className="mt-1 text-blue-800 dark:text-blue-200">
                          Opponent didn't allow draw. If you check "Allow Draw" and match draws, YOU win!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Private Bet Not Available */}
            {!canMatch && isPrivate && (
              <div className="mb-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    This is a private bet for a specific user. You cannot match it.
                  </p>
                </div>
              </div>
            )}

            {/* Your Draw Strategy */}
            {canMatch && (
              <div className="mb-3 border-t dark:border-gray-700 pt-3">
                <p className="text-sm font-semibold dark:text-white mb-2">Your Draw Strategy:</p>
                <DrawCheckbox
                  checked={allowDraw}
                  onChange={(value) => setAllowDrawForBet(bet.betId, value)}
                  disabled={isMatchingThis}
                  opponentAllowsDraw={bet.allowDraw}
                  isCreator={false}
                />
                
                {/* Learn More Button */}
                <button
                  type="button"
                  onClick={() => setShowExplainerFor(
                    showExplainerFor === bet.betId.toString() ? null : bet.betId.toString()
                  )}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  {showExplainerFor === bet.betId.toString() ? '− Hide Details' : '+ Learn More'}
                </button>
                
                {/* Explainer */}
                {showExplainerFor === bet.betId.toString() && (
                  <div className="mt-3 border-t dark:border-gray-700 pt-3">
                    <DrawStrategyExplainer 
                      isCreator={false}
                      opponentAllowsDraw={bet.allowDraw}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Match Button */}
            <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {canMatch ? 'Ready to match' : 'Not available'}
              </div>

              <button
                onClick={() => handleMatch(bet.betId)}
                disabled={!canMatch || isMatching}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  canMatch
                    ? 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isMatchingThis ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Matching...</span>
                  </>
                ) : canMatch ? (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    <span>Match Bet</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Not Available</span>
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
