'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract, useReadContracts, useWriteContract } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction, BetStatus, MatchResult, TokenType, TOKEN_INFO } from '@/lib/contracts';
import { Trophy, TrendingUp, Loader2, Wallet, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatStake, getPredictionLabel } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.betonbase365.xyz';

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
}

type TabType = 'all' | 'waiting' | 'matched';

export function MyBets() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { writeContractAsync } = useWriteContract();

  // Get total number of bets
  const { data: nextBetId, refetch: refetchBetIds } = useReadContract({
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

  // Generate bet IDs to check (last 100 bets for better coverage)
  const betIdsToCheck = useMemo(() => {
    const ids: bigint[] = [];
    if (nextBetId) {
      const totalBets = Number(nextBetId) - 1;
      const startFrom = Math.max(1, totalBets - 99); // Check last 100 bets
      for (let i = totalBets; i >= startFrom; i--) {
        ids.push(BigInt(i));
      }
    }
    return ids;
  }, [nextBetId]);

  // Fetch all bet details
  const { data: betsData, isLoading: loadingBets, refetch: refetchBets } = useReadContracts({
    contracts: betIdsToCheck.map(betId => ({
      address: CONTRACTS.BetOnBase,
      abi: BET_ON_BASE_ABI,
      functionName: 'bets',
      args: [betId],
    })),
    query: {
      enabled: betIdsToCheck.length > 0,
    }
  });

  // Get unique match IDs from user's bets
  const userMatchIds = useMemo(() => {
    const matchIds = new Set<bigint>();
    if (betsData && address) {
      betIdsToCheck.forEach((betId, index) => {
        const betData = betsData[index];
        if (betData?.status === 'success' && betData.result) {
          const result = betData.result as any;
          const bettor = result[2] as string;
          if (bettor.toLowerCase() === address.toLowerCase()) {
            matchIds.add(result[1]);
          }
        }
      });
    }
    return matchIds;
  }, [betsData, address, betIdsToCheck]);

  // Fetch match details from contract for all user's matches
  const matchDetailsQueries = useMemo(() => {
    return Array.from(userMatchIds).map(matchId => ({
      address: CONTRACTS.BetOnBase,
      abi: BET_ON_BASE_ABI,
      functionName: 'matches',
      args: [matchId],
    }));
  }, [userMatchIds]);

  const { data: contractMatchesData } = useReadContracts({
    contracts: matchDetailsQueries,
    query: {
      enabled: matchDetailsQueries.length > 0,
    }
  });

  // Process bets - filter for current user
  const userBets: UserBet[] = useMemo(() => {
    const bets: UserBet[] = [];
    
    if (betsData && address) {
      betIdsToCheck.forEach((betId, index) => {
        const betData = betsData[index];
        
        if (betData?.status === 'success' && betData.result) {
          const result = betData.result as any;
          const bettor = result[2] as string;
          
          if (bettor.toLowerCase() === address.toLowerCase()) {
            const matchId = result[1];
            
            // Try to get match from API first
            let matchInfo = matches.find(m => m.id === Number(matchId));
            
            // If not in API, get from contract
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

            // Determine if user won
            const prediction = Number(result[3]);
            const betStatus = Number(result[7]);
            const isWinner = isSettled && betStatus === BetStatus.MATCHED && (
              (matchResult === MatchResult.HOME_WIN && prediction === Prediction.HOME) ||
              (matchResult === MatchResult.AWAY_WIN && prediction === Prediction.AWAY) ||
              (matchResult === MatchResult.DRAW && prediction === Prediction.DRAW)
            );
            
            bets.push({
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
            });
          }
        }
      });
    }
    
    return bets;
  }, [betsData, address, betIdsToCheck, matches, userMatchIds, contractMatchesData]);

  // Sort by creation time (newest first) and take last 15
  const sortedBets = useMemo(() => {
    return userBets
      .sort((a, b) => Number(b.createdAt - a.createdAt))
      .slice(0, 15);
  }, [userBets]);

  // Filter by tab
  const filteredBets = useMemo(() => {
    return sortedBets.filter(bet => {
      if (activeTab === 'all') return true;
      if (activeTab === 'waiting') return bet.status === BetStatus.WAITING;
      if (activeTab === 'matched') return bet.status === BetStatus.MATCHED;
      return false;
    });
  }, [sortedBets, activeTab]);

  useEffect(() => {
    if (!loadingBets) {
      setLoading(false);
    }
  }, [loadingBets]);

  // Handle withdraw unmatched
  const handleWithdrawUnmatched = async (betId: bigint) => {
    try {
      await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'withdrawUnmatched',
        args: [betId],
      });
      
      // Refresh bets after withdrawal
      await refetchBetIds();
      await refetchBets();
      
      alert('Bet withdrawn successfully!');
    } catch (error: any) {
      console.error('Error withdrawing bet:', error);
      alert(error.message || 'Failed to withdraw bet');
    }
  };

  // Handle withdraw winnings
  const handleWithdrawWinnings = async (betId: bigint) => {
    try {
      await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'withdrawWinnings',
        args: [betId],
      });
      
      // Refresh bets after claiming
      await refetchBetIds();
      await refetchBets();
      
      alert('🎉 Winnings claimed successfully!');
    } catch (error: any) {
      console.error('Error claiming winnings:', error);
      alert(error.message || 'Failed to claim winnings');
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

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Loading your bets...</p>
        </div>
      )}

      {/* No Bets */}
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

      {/* Bet List */}
      {!loading && filteredBets.length > 0 && (
        <div className="space-y-3">
          {filteredBets.map((bet) => {
            const tokenInfo = TOKEN_INFO[bet.tokenType as TokenType];

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

                  {/* Status Badge */}
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
                  {bet.isWinner && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                      🏆 Won
                    </span>
                  )}
                  {bet.isSettled && !bet.isWinner && bet.status === BetStatus.MATCHED && (
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

                  {/* Actions */}
                  <div className="flex gap-2">
                    {bet.status === BetStatus.WAITING && (
                      <button
                        onClick={() => handleWithdrawUnmatched(bet.betId)}
                        className="px-3 py-1.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 font-medium"
                      >
                        Withdraw
                      </button>
                    )}
                    
                    {bet.isWinner && (
                      <button
                        onClick={() => handleWithdrawWinnings(bet.betId)}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 font-medium"
                      >
                        💰 Claim Winnings
                      </button>
                    )}
                    
                    <Link
                      href={`/match/${bet.matchId}`}
                      className="px-3 py-1.5 bg-primary text-white text-xs rounded hover:bg-primary/90 font-medium"
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
  );
}