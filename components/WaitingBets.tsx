'use client';

import { useWaitingBets } from '@/hooks/useWaitingBets';
import { useMatchBet } from '@/hooks/useMatchBet';
import { formatStake, getPredictionLabel, formatUSD } from '@/lib/utils';
import { TOKEN_INFO, TokenType } from '@/lib/contracts';
import { TrendingUp, Loader2 } from 'lucide-react';

export function WaitingBets({ matchId }: { matchId: number }) {
  const { bets, isLoading } = useWaitingBets(matchId);
  const { matchBet, isLoading: isMatching } = useMatchBet();

  const handleMatch = async (betId: bigint) => {
    try {
      await matchBet(betId);
      alert('Bet matched successfully!');
    } catch (error) {
      console.error('Error matching bet:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 border flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!bets || bets.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border text-center">
        <p className="text-gray-500">No bets available to match</p>
        <p className="text-sm text-gray-400 mt-2">Be the first to create a bet!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bets.map((bet) => {
        const tokenInfo = TOKEN_INFO[bet.tokenType as TokenType];
        
        return (
          <div
            key={bet.betId.toString()}
            className="bg-white rounded-lg p-4 border hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-lg">
                  {getPredictionLabel(bet.prediction)}
                </div>
                <div className="text-sm text-gray-500">
                  Bet ID: #{bet.betId.toString()}
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg">
                  {formatStake(bet.stake, tokenInfo.decimals)} {tokenInfo.symbol}
                </div>
                <div className="text-sm text-gray-500">
                  {bet.usdValue && formatUSD(bet.usdValue)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="text-xs text-gray-500">
                {bet.allowDraw ? 'Draw allowed' : 'No draw'}
              </div>

              <button
                onClick={() => handleMatch(bet.betId)}
                disabled={isMatching}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isMatching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                <span>Match Bet</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}