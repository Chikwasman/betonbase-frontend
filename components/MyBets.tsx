'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction, BetStatus, MatchResult, TokenType, TOKEN_INFO } from '@/lib/contracts';
import { Trophy, TrendingUp, Loader2, Wallet, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatStake, getPredictionLabel } from '@/lib/utils';
import { WinCelebration } from './WinCelebration';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UserBet {
  betId: bigint;
  matchId: bigint;
  bettor: string;
  prediction: number;
  stake: bigint;
  tokenType: number;
  allowDraw: boolean;
  status: number;
  matchedBetId: bigint;
  createdAt: bigint;
  homeTeam?: string;
  awayTeam?: string;
  league?: string;
  kickoffTime?: number;
  matchResult?: number;
  isSettled?: boolean;
  isWinner?: boolean;
  isClaimed?: boolean;
}

type TabType = 'all' | 'waiting' | 'matched';

export function MyBets() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingBetId, setClaimingBetId] = useState<bigint | null>(null);
  const [lastClaimTxHash, setLastClaimTxHash] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState<string>('');

  const { writeContractAsync } = useWriteContract();

  // Wait for claim transaction to complete
  const { isSuccess: claimSuccess } = useWaitForTransactionReceipt({
    hash: lastClaimTxHash as `0x${string}` | undefined,
  });

  // Trigger celebration then refresh when claim succeeds
  useEffect(() => {
    if (claimSuccess) {
      console.log('✅ Claim successful, showing celebration...');
      setShowCelebration(true); // Show celebration first!
      // Refresh will happen after celebration completes
    }
  }, [claimSuccess]);

  // Handle celebration complete
  const handleCelebrationComplete = () => {
    console.log('🎉 Celebration complete, refreshing data...');
    setShowCelebration(false);
    setRefreshTrigger(prev => prev + 1); // Now refresh the data
    setClaimingBetId(null);
    setLastClaimTxHash(null);
    setClaimedAmount('');
  };

  // Get total number of bets
  const { data: nextBetId, refetch: refetchNextBetId } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'nextBetId',
  });

  // Fetch matches from API
  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await fetch(`${API_URL}/api/matches`);
        const data = await response.json();
        if (data.success) {
          setMatches(data.matches);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    }
    fetchMatches();
  }, []);

  // Generate bet IDs to check (last 50 bets)
  const betIdsToCheck = [];
  if (nextBetId) {
    const totalBets = Number(nextBetId) - 1;
    const startFrom = Math.max(1, totalBets - 49);
    for (let i = totalBets; i >= startFrom; i--) {
      betIdsToCheck.push(BigInt(i));
    }
  }

  // Fetch all bet details
  const { data: betsData, isLoading: loadingBets, refetch: refetchBets } = useReadContracts({
    contracts: betIdsToCheck.map(betId => ({
      address: CONTRACTS.BetOnBase,
      abi: BET_ON_BASE_ABI,
      functionName: 'bets',
      args: [betId],
    })),
  });

  // Refetch when refresh is triggered
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetchBets();
    }
  }, [refreshTrigger, refetchBets]);

  // Get unique match IDs from user's bets
  const userMatchIds = new Set<bigint>();
  if (betsData && address) {
    betIdsToCheck.forEach((betId, index) => {
      const betData = betsData[index];
      if (betData.status === 'success' && betData.result) {
        const result = betData.result as any;
        const bettor = result[2] as string;
        if (bettor.toLowerCase() === address.toLowerCase()) {
          userMatchIds.add(result[1]);
        }
      }
    });
  }

  // Fetch match details from contract
  const matchDetailsQueries = Array.from(userMatchIds).map(matchId => ({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'matches',
    args: [matchId],
  }));

  const { data: contractMatchesData, refetch: refetchMatches } = useReadContracts({
    contracts: matchDetailsQueries,
  });

  // Refetch matches when refresh is triggered
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetchMatches();
    }
  }, [refreshTrigger, refetchMatches]);

  // Process bets
  const userBets: UserBet[] = [];
  
  if (betsData && address) {
    betIdsToCheck.forEach((betId, index) => {
      const betData = betsData[index];
      
      if (betData.status === 'success' && betData.result) {
        const result = betData.result as any;
        const bettor = result[2] as string;
        
        if (bettor.toLowerCase() === address.toLowerCase()) {
          const matchId = result[1];
          let matchInfo = matches.find(m => m.id === Number(matchId));
          let contractMatch = null;
          let matchResult = MatchResult.PENDING;
          let isSettled = false;
          
          const matchIdArray = Array.from(userMatchIds);
          const matchIndex = matchIdArray.findIndex(id => id === matchId);
          
          if (matchIndex >= 0 && contractMatchesData?.[matchIndex]) {
            const matchData = contractMatchesData[matchIndex];
            if (matchData.status === 'success' && matchData.result) {
              const contractResult = matchData.result as any;
              contractMatch = {
                apiMatchId: Number(contractResult[0]),
                kickoffTime: Number(contractResult[1]),
                bettingClosed: contractResult[2],
                result: Number(contractResult[3]),
                settled: contractResult[4],
              };
              matchResult = contractMatch.result;
              isSettled = contractMatch.settled;
            }
          }

          const prediction = Number(result[3]);
          const betStatus = Number(result[7]);
          const wasMatched = betStatus === BetStatus.MATCHED || betStatus === BetStatus.SETTLED;
          const isWinner = isSettled && wasMatched && (
            (matchResult === MatchResult.HOME_WIN && prediction === Prediction.HOME) ||
            (matchResult === MatchResult.AWAY_WIN && prediction === Prediction.AWAY) ||
            (matchResult === MatchResult.DRAW && prediction === Prediction.DRAW)
          );
          
          const isClaimed = betStatus === BetStatus.SETTLED;
          
          userBets.push({
            betId,
            matchId: result[1],
            bettor: result[2],
            prediction,
            stake: result[4],
            tokenType: Number(result[5]),
            allowDraw: result[6],
            status: betStatus,
            matchedBetId: result[8],
            createdAt: result[9],
            homeTeam: matchInfo?.homeTeam,
            awayTeam: matchInfo?.awayTeam,
            league: matchInfo?.league,
            kickoffTime: matchInfo?.kickoffTime || contractMatch?.kickoffTime,
            matchResult,
            isSettled,
            isWinner,
            isClaimed,
          });
        }
      }
    });
  }

  const sortedBets = userBets
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 15);

  const filteredBets = sortedBets.filter(bet => {
    if (activeTab === 'all') return true;
    if (activeTab === 'waiting') return bet.status === BetStatus.WAITING;
    if (activeTab === 'matched') return bet.status === BetStatus.MATCHED;
    return false;
  });

  useEffect(() => {
    if (!loadingBets) {
      setLoading(false);
    }
  }, [loadingBets]);

  const handleWithdrawUnmatched = async (betId: bigint) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'withdrawUnmatched',
        args: [betId],
      });
      console.log('Withdrawal transaction:', hash);
      
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 3000);
    } catch (error) {
      console.error('Error withdrawing:', error);
    }
  };

  const handleWithdrawWinnings = async (betId: bigint) => {
    try {
      setClaimingBetId(betId);
      
      // Find the bet to get stake amount for celebration
      const bet = sortedBets.find(b => b.betId === betId);
      if (bet) {
        const tokenInfo = TOKEN_INFO[bet.tokenType as TokenType];
        const stakeAmount = formatStake(bet.stake, tokenInfo.decimals);
        // Calculate winnings (stake * 2 - 2.5% fee)
        const winnings = (Number(stakeAmount) * 2 * 0.975).toFixed(2);
        setClaimedAmount(`${winnings} ${tokenInfo.symbol}`);
      }
      
      const hash = await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'withdrawWinnings',
        args: [betId],
      });
      
      console.log('✅ Claim transaction sent:', hash);
      setLastClaimTxHash(hash);
    } catch (error) {
      console.error('❌ Error claiming winnings:', error);
      setClaimingBetId(null);
      setLastClaimTxHash(null);
      setClaimedAmount('');
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">My Bets</h2>
        <div className="text-center py-8">
          <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Connect your wallet to view your bets</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Win Celebration Overlay */}
      <WinCelebration 
        show={showCelebration} 
        onComplete={handleCelebrationComplete}
        amount={claimedAmount}
      />

      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold dark:text-white">My Bets</h2>
          {!loading && sortedBets.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {sortedBets.length} of your recent bets
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b dark:border-gray-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            All
            {sortedBets.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 text-xs rounded-full">
                {sortedBets.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('waiting')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'waiting'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Waiting
            {sortedBets.filter(b => b.status === BetStatus.WAITING).length > 0 && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                {sortedBets.filter(b => b.status === BetStatus.WAITING).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('matched')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'matched'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Matched
            {sortedBets.filter(b => b.status === BetStatus.MATCHED).length > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                {sortedBets.filter(b => b.status === BetStatus.MATCHED).length}
              </span>
            )}
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Loading your bets...</p>
          </div>
        )}

        {!loading && filteredBets.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              {activeTab === 'all' ? 'No bets yet' : `No ${activeTab} bets`}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              {activeTab === 'all' 
                ? "Place your first bet on an upcoming match!" 
                : "Switch tabs to see your other bets"}
            </p>
          </div>
        )}

        {!loading && filteredBets.length > 0 && (
          <div className="space-y-3">
            {filteredBets.map((bet) => {
              const tokenInfo = TOKEN_INFO[bet.tokenType as TokenType];
              const isClaiming = claimingBetId === bet.betId;

              return (
                <div
                  key={bet.betId.toString()}
                  className="border dark:border-gray-800 rounded-lg p-4 hover:border-primary dark:hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {bet.homeTeam && bet.awayTeam ? (
                        <>
                          <div className="font-semibold dark:text-white">
                            {bet.homeTeam} vs {bet.awayTeam}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{bet.league}</div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold dark:text-white">Match #{bet.matchId.toString()}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {bet.isSettled ? 'Match completed' : 'Match details unavailable'}
                          </div>
                        </>
                      )}
                      {bet.kickoffTime && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(bet.kickoffTime * 1000).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {bet.status === BetStatus.WAITING && (
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full">
                        ⏳ Waiting
                      </span>
                    )}
                    {bet.status === BetStatus.MATCHED && !bet.isSettled && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">
                        🤝 Matched
                      </span>
                    )}
                    {bet.isWinner && !bet.isClaimed && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                        🏆 Won
                      </span>
                    )}
                    {bet.isWinner && bet.isClaimed && (
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium rounded-full animate-in zoom-in duration-500">
                        ✅ Won - Claimed
                      </span>
                    )}
                    {bet.isSettled && !bet.isWinner && (
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full">
                        ❌ Lost
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Prediction</div>
                      <div className="font-semibold dark:text-white">{getPredictionLabel(bet.prediction)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stake</div>
                      <div className="font-semibold dark:text-white">
                        {formatStake(bet.stake, tokenInfo.decimals)} {tokenInfo.symbol}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t dark:border-gray-800">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Bet #{bet.betId.toString()}
                    </div>

                    <div className="flex gap-2">
                      {bet.status === BetStatus.WAITING && (
                        <button
                          onClick={() => handleWithdrawUnmatched(bet.betId)}
                          className="px-3 py-1.5 bg-gray-600 dark:bg-gray-700 text-white text-xs rounded hover:bg-gray-700 dark:hover:bg-gray-600 font-medium transition-colors"
                        >
                          Withdraw
                        </button>
                      )}
                      
                      {bet.isWinner && !bet.isClaimed && (
                        <button
                          onClick={() => handleWithdrawWinnings(bet.betId)}
                          disabled={isClaiming}
                          className="px-3 py-1.5 bg-green-600 dark:bg-green-700 text-white text-xs rounded hover:bg-green-700 dark:hover:bg-green-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {isClaiming ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Claiming...
                            </>
                          ) : (
                            <>💰 Claim Winnings</>
                          )}
                        </button>
                      )}
                      
                      <Link
                        href={`/match/${bet.matchId}`}
                        className="px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white text-xs rounded hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-colors"
                      >
                        View Match
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
