'use client';

import { useState, useEffect } from 'react';
import { useReadContracts } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction, TOKEN_INFO, TokenType } from '@/lib/contracts';
import { TrendingUp, Clock, Users, Flame, Loader2, Filter } from 'lucide-react';
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

export default function HotBetsPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [allWaitingBetIds, setAllWaitingBetIds] = useState<bigint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState('all');

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
      setAllWaitingBetIds(allBetIds);
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

  // Get unique leagues
  const leagues = ['all', ...new Set(hotBets.map(b => b.league))];

  // Filter by league
  const filteredBets = selectedLeague === 'all' 
    ? hotBets 
    : hotBets.filter(b => b.league === selectedLeague);

  // Sort by stake (highest first)
  filteredBets.sort((a, b) => Number(b.stake - a.stake));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold dark:text-white">Hot Bets</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            All waiting bets from the community - match them now!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-800">
            <div className="text-3xl font-bold text-primary dark:text-blue-400">
              {loading || loadingDetails ? '...' : filteredBets.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Waiting Bets</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-800">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {loading ? '...' : new Set(hotBets.map(b => b.matchId.toString())).size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Matches</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-800">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {loading ? '...' : leagues.length - 1}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Leagues</div>
          </div>
        </div>

        {/* League Filter */}
        <div className="mb-6 flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="px-4 py-2 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-900 dark:text-white"
          >
            {leagues.map(league => (
              <option key={league} value={league}>
                {league === 'all' ? 'All Leagues' : league}
              </option>
            ))}
          </select>
          {selectedLeague !== 'all' && (
            <button
              onClick={() => setSelectedLeague('all')}
              className="text-sm text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Loading */}
        {(loading || loadingDetails) && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading hot bets...</p>
          </div>
        )}

        {/* No Bets */}
        {!loading && !loadingDetails && filteredBets.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border dark:border-gray-800">
            <Users className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No hot bets available</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {selectedLeague !== 'all' 
                ? 'Try selecting a different league' 
                : 'Be the first to place a bet!'}
            </p>
          </div>
        )}

        {/* Bet List */}
        {!loading && !loadingDetails && filteredBets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBets.map((bet) => {
              const tokenInfo = TOKEN_INFO[bet.tokenType as TokenType];
              const oppositePrediction = bet.prediction === Prediction.HOME ? 'AWAY' : 
                                         bet.prediction === Prediction.AWAY ? 'HOME' : 
                                         'HOME/AWAY';
              
              return (
                <Link
                  key={bet.betId.toString()}
                  href={`/match/${bet.matchId}`}
                  className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-5 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Match Info */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{bet.league}</div>
                    <div className="font-semibold dark:text-white">
                      {bet.homeTeam} vs {bet.awayTeam}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(bet.kickoffTime * 1000).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Bet Details */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">They picked:</span>
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {getPredictionLabel(bet.prediction)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Stake:</span>
                      <span className="text-lg font-bold dark:text-white">
                        {formatStake(bet.stake, tokenInfo.decimals)} {tokenInfo.symbol}
                      </span>
                    </div>
                  </div>

                  {/* Match Button */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="text-xs text-green-700 dark:text-green-400 mb-1">You would pick:</div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-900 dark:text-green-300">{oppositePrediction}</span>
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Click to match this bet →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
