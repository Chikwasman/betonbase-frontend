'use client';

import { useWaitingBets } from '@/hooks/useWaitingBets';
import { useMatchBet } from '@/hooks/useMatchBet';
import { formatStake, getPredictionLabel } from '@/lib/utils';
import { TOKEN_INFO, Prediction } from '@/lib/contracts';
import { TrendingUp, Loader2, Lock, Users, DollarSign, UserCheck, Shield, Info } from 'lucide-react';
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
      
      await matchBet({ 
        betId: bet.betId, 
        targetBetStake: bet.stake,
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

  // Group bets by prediction
  const betsByPrediction = {
    [Prediction.HOME]: bets?.filter(b => b.prediction === Prediction.HOME) || [],
    [Prediction.DRAW]: bets?.filter(b => b.prediction === Prediction.DRAW) || [],
    [Prediction.AWAY]: bets?.filter(b => b.prediction === Prediction.AWAY) || [],
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border-2 dark:border-gray-800">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading marketplace...</span>
        </div>
      </div>
    );
  }

  if (!bets || bets.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Bets Available
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Be the first to create a bet on this match!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - Traditional Betting Style */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border-2 border-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">P2P Betting Market</h3>
              <p className="text-sm text-gray-400">{bets.length} bet{bets.length !== 1 ? 's' : ''} available to match</p>
            </div>
          </div>
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
            LIVE
          </div>
        </div>
      </div>

      {/* Approval Status */}
      {isApproving && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-600 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-100">Approving Tokens</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Step 1 of 2: Confirm in your wallet...</p>
            </div>
          </div>
        </div>
      )}

      {/* Market Sections - Traditional Odds Layout */}
      {[
        { prediction: Prediction.HOME, label: 'HOME BETS', color: 'blue', icon: '🏠' },
        { prediction: Prediction.DRAW, label: 'DRAW BETS', color: 'gray', icon: '🟰' },
        { prediction: Prediction.AWAY, label: 'AWAY BETS', color: 'red', icon: '🔵' },
      ].map(({ prediction, label, color, icon }) => {
        const sectionBets = betsByPrediction[prediction];
        if (sectionBets.length === 0) return null;

        return (
          <div key={prediction} className="space-y-3">
            {/* Section Header */}
            <div className={`
              flex items-center justify-between px-4 py-2 rounded-lg
              ${color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800' : ''}
              ${color === 'gray' ? 'bg-gray-50 dark:bg-gray-900/20 border-2 border-gray-200 dark:border-gray-800' : ''}
              ${color === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800' : ''}
            `}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <span className={`font-bold text-sm uppercase tracking-wide
                  ${color === 'blue' ? 'text-blue-900 dark:text-blue-300' : ''}
                  ${color === 'gray' ? 'text-gray-900 dark:text-gray-300' : ''}
                  ${color === 'red' ? 'text-red-900 dark:text-red-300' : ''}
                `}>
                  {label}
                </span>
              </div>
              <span className={`
                px-3 py-1 rounded-full text-xs font-bold
                ${color === 'blue' ? 'bg-blue-600 text-white' : ''}
                ${color === 'gray' ? 'bg-gray-600 text-white' : ''}
                ${color === 'red' ? 'bg-red-600 text-white' : ''}
              `}>
                {sectionBets.length} available
              </span>
            </div>

            {/* Bets List */}
            {sectionBets.map((bet) => {
              const isMyBet = address && bet.bettor.toLowerCase() === address.toLowerCase();
              const isPrivate = bet.targetBettor !== '0x0000000000000000000000000000000000000000';
              const allowDraw = allowDrawMap[bet.betId.toString()] || false;
              const matchingPrediction = getMatchingPrediction(bet);
              const isCurrentlyMatching = matchingBetId === bet.betId;

              return (
                <div
                  key={bet.betId.toString()}
                  className={`
                    bg-white dark:bg-gray-900 rounded-xl border-2 transition-all
                    ${isMyBet 
                      ? 'border-green-500 dark:border-green-600' 
                      : 'border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-600'
                    }
                    ${isCurrentlyMatching ? 'opacity-50' : ''}
                  `}
                >
                  <div className="p-4">
                    {/* Bet Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* Bettor Badge */}
                        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {bet.bettor.slice(0, 6)}...{bet.bettor.slice(-4)}
                          </span>
                        </div>

                        {/* Private Badge */}
                        {isPrivate && (
                          <div className="bg-purple-100 dark:bg-purple-900/20 px-2 py-1 rounded flex items-center gap-1">
                            <Lock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">PRIVATE</span>
                          </div>
                        )}

                        {/* My Bet Badge */}
                        {isMyBet && (
                          <div className="bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                            <span className="text-xs font-semibold text-green-700 dark:text-green-300">YOUR BET</span>
                          </div>
                        )}
                      </div>

                      {/* Stake - Large & Bold */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatStake(bet.stake, TOKEN_INFO.decimals)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          {TOKEN_INFO.symbol}
                        </div>
                      </div>
                    </div>

                    {/* Prediction Display */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Betting on:</div>
                      <div className={`text-lg font-bold
                        ${bet.prediction === Prediction.HOME ? 'text-blue-600 dark:text-blue-400' : ''}
                        ${bet.prediction === Prediction.DRAW ? 'text-gray-600 dark:text-gray-400' : ''}
                        ${bet.prediction === Prediction.AWAY ? 'text-red-600 dark:text-red-400' : ''}
                      `}>
                        {getPredictionLabel(bet.prediction)}
                      </div>
                    </div>

                    {/* Match Section - Only show if not my bet */}
                    {!isMyBet && (
                      <div className="space-y-3">
                        {/* Your Prediction Selector */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Your Prediction:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {bet.prediction === Prediction.DRAW ? (
                              <>
                                <button
                                  onClick={() => setPredictionForBet(bet.betId, Prediction.HOME)}
                                  className={`
                                    px-4 py-2 rounded-lg font-semibold transition-all border-2
                                    ${matchingPrediction === Prediction.HOME
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-blue-600'
                                    }
                                  `}
                                >
                                  HOME
                                </button>
                                <button
                                  onClick={() => setPredictionForBet(bet.betId, Prediction.AWAY)}
                                  className={`
                                    px-4 py-2 rounded-lg font-semibold transition-all border-2
                                    ${matchingPrediction === Prediction.AWAY
                                      ? 'bg-red-600 text-white border-red-600'
                                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-red-600'
                                    }
                                  `}
                                >
                                  AWAY
                                </button>
                              </>
                            ) : (
                              <div className="col-span-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  You'll bet on: <span className={`font-bold
                                    ${matchingPrediction === Prediction.HOME ? 'text-blue-600 dark:text-blue-400' : ''}
                                    ${matchingPrediction === Prediction.AWAY ? 'text-red-600 dark:text-red-400' : ''}
                                  `}>
                                    {getPredictionLabel(matchingPrediction)}
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Allow Draw Checkbox */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowDraw}
                            onChange={() => toggleAllowDraw(bet.betId)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Allow draw (refund if match draws)
                          </span>
                        </label>

                        {/* Match Button - Traditional Betting Style */}
                        <button
                          onClick={() => handleMatch(bet, allowDraw, matchingPrediction)}
                          disabled={isMatching || isApproving || isCurrentlyMatching}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                        >
                          {isCurrentlyMatching ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>MATCHING BET...</span>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-5 w-5" />
                              <span>MATCH THIS BET - {formatStake(bet.stake, TOKEN_INFO.decimals)} {TOKEN_INFO.symbol}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
