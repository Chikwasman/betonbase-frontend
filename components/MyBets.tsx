'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, BetStatus, MatchResult, TOKEN_INFO, TokenType, Prediction } from '@/lib/contracts';
import { formatStake, getPredictionLabel } from '@/lib/utils';
import { Trophy, Clock, Loader2, CheckCircle, XCircle, TrendingUp, RefreshCw, Lock } from 'lucide-react';
import { WinCelebration } from '@/components/WinCelebration';

interface UserBet {
  betId: bigint;
  matchId: bigint;
  bettor: string;
  prediction: number;
  stake: bigint;
  tokenType: number;
  allowDraw: boolean;
  betStatus: number;
  matchedBetId: bigint;
  targetBettor: string;
  isClaimed: boolean;
}

interface MatchData {
  kickoffTime: bigint;
  bettingClosed: boolean;
  result: number;
  settled: boolean;
}

export function MyBets() {
  const { address } = useAccount();
  const [userBetIds, setUserBetIds] = useState<bigint[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'won' | 'lost'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [claimingBetId, setClaimingBetId] = useState<bigint | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [showCelebration, setShowCelebration] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState<string>('0');

  const { writeContractAsync } = useWriteContract();

  // Monitor transaction
  const { isSuccess: claimSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Trigger refresh after claim success
  useEffect(() => {
    if (claimSuccess && txHash) {
      setShowCelebration(true);
      // Refresh will happen after celebration completes
      setTxHash(undefined);
      setClaimingBetId(null);
    }
  }, [claimSuccess, txHash]);

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch user's bet IDs
  const { data: betIdsData, refetch: refetchBetIds } = useReadContracts({
    contracts: address ? [{
      address: CONTRACTS.BetOnBase,
      abi: BET_ON_BASE_ABI,
      functionName: 'getUserBets',
      args: [address],
    }] : [],
  });

  useEffect(() => {
    if (betIdsData && betIdsData[0]?.status === 'success') {
      const ids = betIdsData[0].result as bigint[];
      setUserBetIds(ids || []);
    }
  }, [betIdsData, refreshTrigger]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      refetchBetIds();
    }
  }, [refreshTrigger, refetchBetIds]);

  // Fetch bet details
  const betQueries = userBetIds.map(betId => ({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'bets',
    args: [betId],
  }));

  const { data: betsData, refetch: refetchBets } = useReadContracts({
    contracts: betQueries,
  });

  // Fetch match data for each bet
  const matchIds = betsData?.map(bet => {
    if (bet.status === 'success' && bet.result) {
      const result = bet.result as any;
      return result[1]; // matchId
    }
    return BigInt(0);
  }).filter(id => id !== BigInt(0)) || [];

  const matchQueries = matchIds.map(matchId => ({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'matches',
    args: [matchId],
  }));

  const { data: matchesData, refetch: refetchMatches } = useReadContracts({
    contracts: matchQueries,
  });

  useEffect(() => {
    if (refreshTrigger > 0) {
      refetchBets();
      refetchMatches();
    }
  }, [refreshTrigger, refetchBets, refetchMatches]);

  // Parse bets
  const userBets: (UserBet & { matchData: MatchData | null; matchedBet?: UserBet })[] = [];
  
  if (betsData && matchesData) {
    betsData.forEach((bet, index) => {
      if (bet.status === 'success' && bet.result) {
        const result = bet.result as any;
        const matchData = matchesData[index];
        
        const userBet: UserBet & { matchData: MatchData | null; matchedBet?: UserBet } = {
          betId: result[0],
          matchId: result[1],
          bettor: result[2],
          prediction: Number(result[3]),
          stake: result[4],
          tokenType: Number(result[5]),
          allowDraw: result[6],
          betStatus: Number(result[7]),
          matchedBetId: result[8],
          targetBettor: result[10],
          isClaimed: Number(result[7]) === BetStatus.SETTLED,
          matchData: matchData && matchData.status === 'success' && matchData.result ? {
            kickoffTime: (matchData.result as any)[1],
            bettingClosed: (matchData.result as any)[2],
            result: Number((matchData.result as any)[3]),
            settled: (matchData.result as any)[4],
          } : null,
        };
        
        userBets.push(userBet);
      }
    });
  }

  // Fetch matched bet details for winner determination
  const matchedBetQueries = userBets
    .filter(bet => bet.matchedBetId && bet.matchedBetId !== BigInt(0))
    .map(bet => ({
      address: CONTRACTS.BetOnBase,
      abi: BET_ON_BASE_ABI,
      functionName: 'bets',
      args: [bet.matchedBetId],
    }));

  const { data: matchedBetsData } = useReadContracts({
    contracts: matchedBetQueries,
  });

  // Attach matched bet data
  if (matchedBetsData) {
    let matchedIndex = 0;
    userBets.forEach(bet => {
      if (bet.matchedBetId && bet.matchedBetId !== BigInt(0)) {
        const matchedData = matchedBetsData[matchedIndex];
        if (matchedData && matchedData.status === 'success' && matchedData.result) {
          const result = matchedData.result as any;
          bet.matchedBet = {
            betId: result[0],
            matchId: result[1],
            bettor: result[2],
            prediction: Number(result[3]),
            stake: result[4],
            tokenType: Number(result[5]),
            allowDraw: result[6],
            betStatus: Number(result[7]),
            matchedBetId: result[8],
            targetBettor: result[10],
            isClaimed: false,
          };
        }
        matchedIndex++;
      }
    });
  }

  // Determine winners with NEW draw logic
  userBets.forEach(bet => {
    if (bet.matchData?.settled && bet.matchData.result !== MatchResult.PENDING) {
      const matchResult = bet.matchData.result;
      const matchedBet = bet.matchedBet;
      
      if (matchResult === MatchResult.DRAW && matchedBet) {
        // NEW DRAW LOGIC
        
        // If either predicted DRAW, they win
        if (bet.prediction === Prediction.DRAW) {
          (bet as any).isWinner = true;
        } else if (matchedBet.prediction === Prediction.DRAW) {
          (bet as any).isWinner = false;
        } else {
          // Neither predicted DRAW, check allowDraw
          const betAllowsDraw = bet.allowDraw;
          const matchedAllowsDraw = matchedBet.allowDraw;
          
          if (betAllowsDraw && !matchedAllowsDraw) {
            (bet as any).isWinner = true;
          } else if (!betAllowsDraw && matchedAllowsDraw) {
            (bet as any).isWinner = false;
          } else {
            // Both same → Refund
            (bet as any).isWinner = null; // null = refund
          }
        }
      } else {
        // Normal HOME/AWAY logic
        if (matchResult === MatchResult.HOME_WIN && bet.prediction === Prediction.HOME) {
          (bet as any).isWinner = true;
        } else if (matchResult === MatchResult.AWAY_WIN && bet.prediction === Prediction.AWAY) {
          (bet as any).isWinner = true;
        } else {
          (bet as any).isWinner = false;
        }
      }
    }
  });

  // Filter bets
  const filteredBets = userBets.filter(bet => {
    if (filter === 'all') return true;
    
    if (filter === 'active') {
      return bet.betStatus === BetStatus.WAITING || 
             (bet.betStatus === BetStatus.MATCHED && !bet.matchData?.settled);
    }
    
    if (filter === 'won') {
      return (bet as any).isWinner === true;
    }
    
    if (filter === 'lost') {
      return (bet as any).isWinner === false;
    }
    
    return true;
  });

  const handleWithdrawWinnings = async (betId: bigint, stake: bigint) => {
    try {
      setClaimingBetId(betId);
      const winnings = (Number(stake) * 2 * 0.975).toFixed(2);
      setClaimedAmount(winnings);
      
      const hash = await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'withdrawWinnings',
        args: [betId],
      });
      
      setTxHash(hash);
    } catch (error) {
      console.error('Error withdrawing:', error);
      setClaimingBetId(null);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Connect your wallet to view your bets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        
        {/* Celebration */}
        <WinCelebration 
          show={showCelebration}
          onComplete={handleCelebrationComplete}
          amount={claimedAmount}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">My Bets</h1>
            <p className="text-gray-600 dark:text-gray-400">Track all your bets and claim winnings</p>
          </div>
          
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'active', 'won', 'lost'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-900 border dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Bets List */}
        {filteredBets.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">No bets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBets.map((bet) => {
              const tokenInfo = TOKEN_INFO[bet.tokenType as TokenType];
              const isPrivate = bet.targetBettor && bet.targetBettor !== '0x0000000000000000000000000000000000000000';
              const isWinner = (bet as any).isWinner;
              const isClaiming = claimingBetId === bet.betId;
              const showClaimButton = isWinner === true && !bet.isClaimed && bet.betStatus === BetStatus.MATCHED;
              
              // Draw outcome determination
              let drawOutcome = null;
              if (bet.matchData?.result === MatchResult.DRAW && bet.matchedBet) {
                if (bet.prediction === Prediction.DRAW) {
                  drawOutcome = 'predicted-draw-won';
                } else if (bet.matchedBet.prediction === Prediction.DRAW) {
                  drawOutcome = 'opponent-predicted-draw';
                } else if (bet.allowDraw && !bet.matchedBet.allowDraw) {
                  drawOutcome = 'you-allowed-won';
                } else if (!bet.allowDraw && bet.matchedBet.allowDraw) {
                  drawOutcome = 'opponent-allowed-won';
                } else {
                  drawOutcome = 'both-same-refund';
                }
              }
              
              return (
                <div
                  key={bet.betId.toString()}
                  className="bg-white dark:bg-gray-900 rounded-lg p-5 border dark:border-gray-800 hover:shadow-md transition-all"
                >
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {bet.betStatus === BetStatus.WAITING && (
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                        ⏳ Waiting
                      </span>
                    )}
                    {bet.betStatus === BetStatus.MATCHED && !bet.matchData?.settled && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        🔒 Matched
                      </span>
                    )}
                    {isWinner === true && !bet.isClaimed && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                        🏆 Won
                      </span>
                    )}
                    {isWinner === true && bet.isClaimed && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                        ✅ Won - Claimed
                      </span>
                    )}
                    {isWinner === false && (
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                        ❌ Lost
                      </span>
                    )}
                    {isWinner === null && bet.matchData?.settled && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                        🔄 Refund Available
                      </span>
                    )}
                    
                    {/* Private Badge */}
                    {isPrivate && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </span>
                    )}
                  </div>

                  {/* Bet Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Prediction:</span>
                      <span className="font-semibold dark:text-white">{getPredictionLabel(bet.prediction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Stake:</span>
                      <span className="font-semibold dark:text-white">
                        {formatStake(bet.stake, tokenInfo.decimals)} {tokenInfo.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Draw Setting:</span>
                      <span className="text-sm font-medium dark:text-white">
                        {bet.allowDraw ? '✅ Allowed' : '❌ Not Allowed'}
                      </span>
                    </div>
                    
                    {/* Show opponent's draw setting if matched */}
                    {bet.matchedBet && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Opponent Draw:</span>
                        <span className="text-sm font-medium dark:text-white">
                          {bet.matchedBet.allowDraw ? '✅ Allowed' : '❌ Not Allowed'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Draw Outcome Explanation */}
                  {drawOutcome && (
                    <div className="mb-4 p-3 rounded-lg border text-sm">
                      {drawOutcome === 'predicted-draw-won' && (
                        <div className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                          <p className="text-green-900 dark:text-green-100 font-semibold">🏆 You Predicted Draw!</p>
                          <p className="text-green-800 dark:text-green-200 text-xs mt-1">
                            You won because you predicted DRAW correctly.
                          </p>
                        </div>
                      )}
                      
                      {drawOutcome === 'opponent-predicted-draw' && (
                        <div className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                          <p className="text-red-900 dark:text-red-100 font-semibold">❌ Opponent Predicted Draw</p>
                          <p className="text-red-800 dark:text-red-200 text-xs mt-1">
                            Opponent won because they predicted DRAW correctly.
                          </p>
                        </div>
                      )}
                      
                      {drawOutcome === 'you-allowed-won' && (
                        <div className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                          <p className="text-green-900 dark:text-green-100 font-semibold">🏆 You Allowed Draw!</p>
                          <p className="text-green-800 dark:text-green-200 text-xs mt-1">
                            You won because you allowed draw and opponent didn't.
                          </p>
                        </div>
                      )}
                      
                      {drawOutcome === 'opponent-allowed-won' && (
                        <div className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                          <p className="text-red-900 dark:text-red-100 font-semibold">❌ Opponent Allowed Draw</p>
                          <p className="text-red-800 dark:text-red-200 text-xs mt-1">
                            Opponent won because they allowed draw and you didn't.
                          </p>
                        </div>
                      )}
                      
                      {drawOutcome === 'both-same-refund' && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                          <p className="text-blue-900 dark:text-blue-100 font-semibold">🔄 Draw Refund</p>
                          <p className="text-blue-800 dark:text-blue-200 text-xs mt-1">
                            Both had same draw setting, so both get refund.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Claim Button */}
                  {showClaimButton && (
                    <button
                      onClick={() => handleWithdrawWinnings(bet.betId, bet.stake)}
                      disabled={isClaiming}
                      className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Claiming...</span>
                        </>
                      ) : (
                        <>
                          <Trophy className="h-5 w-5" />
                          <span>💰 Claim Winnings</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
