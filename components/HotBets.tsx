'use client';

import { useState, useEffect } from 'react';
import { useReadContracts } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction, TOKEN_INFO, TokenType } from '@/lib/contracts';
import { TrendingUp, Clock, Users, Flame } from 'lucide-react';
import Link from 'next/link';
import { formatStake, getPredictionLabel } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface WaitingBet {
  betId: bigint;
  matchId: bigint;
  bettor: string;
  prediction: number;
  stake: bigint;
  tokenType: number;
  allowDraw: boolean;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoffTime: number;
}

export function HotBets() {
  const [matches, setMatches] = useState<any[]>([]);
  const [allWaitingBetIds, setAllWaitingBetIds] = useState<bigint[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch waiting bets for all matches
  const matchQueries = matches.flatMap(match => [
    {
      address: CONTRACTS.BetOnBase,
      abi: BET_ON_BASE_ABI,
      functionName: 'getWaitingBets',
      args: [BigInt(match.id), Prediction.HOME],
    },
    {
      address: CONTRACTS.BetOnBase,
      abi: BET_ON_BASE_ABI,
      functionName: 'getWaitingBets',
      args: [BigInt(match.id), Prediction.AWAY],
    },
    {
      address: CONTRACTS.BetOnBase,
      abi: BET_ON_BASE_ABI,
      functionName: 'getWaitingBets',
      args: [BigInt(match.id), Prediction.DRAW],
    },
  ]);

  const { data: waitingBetsData, isLoading: loadingBets } = useReadContracts({
    contracts: matchQueries,
  });

  // Extract all bet IDs
  useEffect(() => {
    if (waitingBetsData) {
      const allBetIds: bigint[] = [];
      waitingBetsData.forEach((result) => {
        if (result.status === 'success' && Array.isArray(result.result)) {
          allBetIds.push(...result.result);
        }
      });
      setAllWaitingBetIds(allBetIds.slice(0, 20)); // Limit to 20 for performance
      setLoading(false);
    }
  }, [waitingBetsData]);

  // Fetch bet details
  const betDetailsQueries = allWaitingBetIds.map(betId => ({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'bets',
    args: [betId],
  }));

  const { data: betDetailsData, isLoading: loadingDetails } = useReadContracts({
    contracts: betDetailsQueries,
  });

  // Combine bet details with match info
  const hotBets: WaitingBet[] = [];
  
  if (betDetailsData && matches.length > 0) {
    allWaitingBetIds.forEach((betId, index) => {
      const betDetail = betDetailsData[index];
      if (betDetail.status === 'success' && betDetail.result) {
        const result = betDetail.result as any;
        const matchId = Number(result[1]);
        const match = matches.find(m => m.id === matchId);
        
        if (match && result[7] === 0) { // status === WAITING
          hotBets.push({
            betId,
            matchId: result[1],
            bettor: result[2],
            prediction: Number(result[3]),
            stake: result[4],
            tokenType: Number(result[5]),
            allowDraw: result[6],
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            league: match.league,
            kickoffTime: match.kickoffTime,
          });
        }
      }
    });
  }

  // Sort by stake (highest first)
  hotBets.sort((a, b) => Number(b.stake - a.stake));

  if (loading || loadingBets || loadingDetails) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Flame className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold">🔥 Hot Bets</h2>
        </div>
        <div className="text-center text-gray-500">Loading hot bets...</div>
      </div>
    );
  }

  if (hotBets.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Flame className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold">🔥 Hot Bets</h2>
        </div>
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No waiting bets yet</p>
          <p className="text-sm text-gray-400 mt-2">Be the first to place a bet!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Flame className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold">🔥 Hot Bets</h2>
        </div>
        <div className="text-sm text-gray-500">
          {hotBets.length} waiting to be matched
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotBets.slice(0, 6).map((bet) => {
          const tokenInfo = TOKEN_INFO[bet.tokenType as TokenType];
          const oppositePrediction = bet.prediction === Prediction.HOME ? 'AWAY' : 
                                     bet.prediction === Prediction.AWAY ? 'HOME' : 
                                     'HOME/AWAY';
          
          return (
            <Link
              key={bet.betId.toString()}
              href={`/match/${bet.matchId}`}
              className="border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer"
            >
              {/* Match Info */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">{bet.league}</div>
                <div className="font-semibold text-sm">
                  {bet.homeTeam} vs {bet.awayTeam}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="h-3 w-3" />
                  {new Date(bet.kickoffTime * 1000).toLocaleDateString()}
                </div>
              </div>

              {/* Bet Details */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">They picked:</span>
                  <span className="text-sm font-bold text-orange-600">
                    {getPredictionLabel(bet.prediction)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Stake:</span>
                  <span className="text-lg font-bold">
                    {formatStake(bet.stake, tokenInfo.decimals)} {tokenInfo.symbol}
                  </span>
                </div>
              </div>

              {/* Match Button */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-xs text-green-700 mb-1">You would pick:</div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-green-900">{oppositePrediction}</span>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-xs text-green-600 mt-2">
                  Click to match this bet →
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {hotBets.length > 6 && (
        <div className="mt-6 text-center">
          <Link 
            href="/hot-bets"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
          >
            View All {hotBets.length} Hot Bets
            <TrendingUp className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
