'use client';

import { useWaitingBets } from '@/hooks/useWaitingBets';
import { useMatchBet } from '@/hooks/useMatchBet';
import { formatStake, getPredictionLabel, formatUSD } from '@/lib/utils';
import { TOKEN_INFO, TokenType } from '@/lib/contracts';
import { TrendingUp, Loader2, Lock, Users } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useState } from 'react';

export function WaitingBets({ matchId }: { matchId: number }) {
  const { address } = useAccount();
  const { bets, isLoading } = useWaitingBets(matchId);
  const { matchBet, isLoading: isMatching } = useMatchBet();
  const [matchingBetId, setMatchingBetId] = useState<bigint | null>(null);
  const [allowDrawMap, setAllowDrawMap] = useState<{ [key: string]: boolean }>({});

  const handleMatch = async (betId: bigint, allowDraw: boolean) => {
    try {
      setMatchingBetId(betId);
      await matchBet(betId, allowDraw);
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
              canMatch ? 'hover:shadow-md hover:border-primary dark:hover:border-primary' : 'opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-semibold text-lg dark:text-white">
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
                    ⚖️ Draw allowed
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg dark:text-white">
                  {formatStake(bet.stake, tokenInfo.decimals)} {tokenInfo.symbol}
                </div>
                {bet.usdValue && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatUSD(bet.usdValue)}
                  </div>
                )}
              </div>
            </div>

            {/* Draw Strategy Toggle */}
            {canMatch && (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDraw}
                    onChange={() => toggleAllowDraw(bet.betId)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium dark:text-white">
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

            <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created {new Date(Number(bet.createdAt) * 1000).toLocaleDateString()}
              </div>

              <button
                onClick={() => handleMatch(bet.betId, allowDraw)}
                disabled={!canMatch || isMatching}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isMatchingThis ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                <span>{canMatch ? 'Match Bet' : 'Cannot Match'}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}