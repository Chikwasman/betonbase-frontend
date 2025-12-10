'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useReadContracts, useWriteContract } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction, BetStatus, TokenType, TOKEN_INFO } from '@/lib/contracts';
import { Trophy, TrendingUp, Loader2, Wallet, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatStake, getPredictionLabel } from '@/lib/utils';

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
}

type TabType = 'all' | 'waiting' | 'matched';

export function MyBets() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { writeContractAsync } = useWriteContract();

  // Get total number of bets
  const { data: nextBetId } = useReadContract({
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
    const startFrom = Math.max(1, totalBets - 49); // Check last 50
    for (let i = totalBets; i >= startFrom; i--) {
      betIdsToCheck.push(BigInt(i));
    }
  }

  // Fetch all bet details
  const { data: betsData, isLoading: loadingBets } = useReadContracts({
    contracts: betIdsToCheck.map(betId => ({
      address: CONTRACTS.BetOnBase,
      abi: BET_ON_BASE_ABI,
      functionName: 'bets',
      args: [betId],
    })),
  });

  // Process bets - filter for current user
  const userBets: UserBet[] = [];
  
  if (betsData && address) {
    betIdsToCheck.forEach((betId, index) => {
      const betData = betsData[index];
      
      if (betData.status === 'success' && betData.result) {
        const result = betData.result as any;
        const bettor = result[2] as string;
        
        // Only include bets from current user
        if (bettor.toLowerCase() === address.toLowerCase()) {
          const matchId = result[1];
          const match = matches.find(m => m.id === Number(matchId));
          
          userBets.push({
            betId,
            matchId: result[1],
            bettor: result[2],
            prediction: Number(result[3]),
            stake: result[4],
            tokenType: Number(result[5]),
            allowDraw: result[6],
            status: Number(result[7]),
            matchedBetId: result[8],
            createdAt: result[9],
            homeTeam: match?.homeTeam,
            awayTeam: match?.awayTeam,
            league: match?.league,
            kickoffTime: match?.kickoffTime,
          });
        }
      }
    });
  }

  // Sort by creation time (newest first) and take last 15
  const sortedBets = userBets
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 15);

  // Filter by tab
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

  // Handle withdraw unmatched
  const handleWithdrawUnmatched = async (betId: bigint) => {
    if (!confirm('Withdraw this unmatched bet?')) return;
    
    try {
      await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'withdrawUnmatched',
        args: [betId],
      });
      alert('Bet withdrawn successfully!');
      window.location.reload();
    } catch (error: any) {
      console.error('Withdraw error:', error);
      alert('Failed to withdraw: ' + (error.shortMessage || error.message || 'Unknown error'));
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
      alert('Winnings claimed successfully!');
      window.location.reload();
    } catch (error: any) {
      console.error('Withdraw error:', error);
      alert('Failed to claim: ' + (error.shortMessage || error.message || 'Unknown error'));
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">My Bets</h2>
        <div className="text-center py-8">
          <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Connect your wallet to view your bets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Bets</h2>
        {!loading && sortedBets.length > 0 && (
          <span className="text-sm text-gray-500">
            Showing {sortedBets.length} of your recent bets
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All
          {sortedBets.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              {sortedBets.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('waiting')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'waiting'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Waiting
          {sortedBets.filter(b => b.status === BetStatus.WAITING).length > 0 && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              {sortedBets.filter(b => b.status === BetStatus.WAITING).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('matched')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'matched'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Matched
          {sortedBets.filter(b => b.status === BetStatus.MATCHED).length > 0 && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {sortedBets.filter(b => b.status === BetStatus.MATCHED).length}
            </span>
          )}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-500">Loading your bets...</p>
        </div>
      )}

      {/* No Bets */}
      {!loading && filteredBets.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            {activeTab === 'all' ? 'No bets yet' : `No ${activeTab} bets`}
          </p>
          <p className="text-sm text-gray-400 mb-6">
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
                className="border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {bet.homeTeam && bet.awayTeam ? (
                      <>
                        <div className="font-semibold">
                          {bet.homeTeam} vs {bet.awayTeam}
                        </div>
                        <div className="text-sm text-gray-500">{bet.league}</div>
                        {bet.kickoffTime && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <Clock className="h-3 w-3" />
                            {new Date(bet.kickoffTime * 1000).toLocaleString()}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="font-semibold">Match #{bet.matchId.toString()}</div>
                        <div className="text-sm text-gray-500">Loading match details...</div>
                      </>
                    )}
                  </div>

                  {/* Status Badge */}
                  {bet.status === BetStatus.WAITING && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      ⏳ Waiting
                    </span>
                  )}
                  {bet.status === BetStatus.MATCHED && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      🤝 Matched
                    </span>
                  )}
                  {bet.status === BetStatus.SETTLED && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      ✅ Settled
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Your Prediction</div>
                    <div className="font-semibold">{getPredictionLabel(bet.prediction)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Stake</div>
                    <div className="font-semibold">
                      {formatStake(bet.stake, tokenInfo.decimals)} {tokenInfo.symbol}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xs text-gray-500">
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