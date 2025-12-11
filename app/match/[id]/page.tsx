'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, MatchResult } from '@/lib/contracts';
import { BetForm } from '@/components/BetForm';
import { WaitingBets } from '@/components/WaitingBets';
import { Clock, Trophy, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function MatchPage() {
  const params = useParams();
  // NEW
  const matchId = params?.id ? Number(params.id) : 0;
  const { isConnected } = useAccount();
  
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch match from contract
  const { data: contractMatch, isLoading: loadingContract } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'matches',
    args: [BigInt(matchId)],
  });

  // Fetch match from API
  useEffect(() => {
    async function fetchMatch() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/matches/${matchId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMatch(data.match);
          }
        }
      } catch (err) {
        console.error('Error fetching match from API:', err);
      } finally {
        setLoading(false);
      }
    }

    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  // Parse contract match data
  let contractMatchData = null;
  if (contractMatch) {
    const result = contractMatch as any;
    contractMatchData = {
      apiMatchId: Number(result[0]),
      kickoffTime: Number(result[1]),
      bettingClosed: result[2],
      result: Number(result[3]),
      settled: result[4],
    };
  }

  const isLoading = loading || loadingContract;

  // If match not in API but exists in contract
  const matchExists = match || contractMatchData;
  const isBettingClosed = contractMatchData?.bettingClosed || false;
  const isSettled = contractMatchData?.settled || false;
  const matchResult = contractMatchData?.result;

  // Get result label
  const getResultLabel = (result: number) => {
    if (result === MatchResult.HOME_WIN) return 'Home Win';
    if (result === MatchResult.AWAY_WIN) return 'Away Win';
    if (result === MatchResult.DRAW) return 'Draw';
    return 'Pending';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (!matchExists) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border dark:border-gray-800">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 dark:text-white">Match Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This match doesn't exist or hasn't been added to the blockchain yet.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Back to Matches
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Match Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-6 border dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {match?.league || `Match #${matchId}`}
              </span>
            </div>
            {isSettled && (
              <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                ✅ Settled
              </span>
            )}
            {isBettingClosed && !isSettled && (
              <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                🔒 Betting Closed
              </span>
            )}
            {!isBettingClosed && (
              <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                🟢 Live Betting
              </span>
            )}
          </div>

          {/* Teams */}
          <div className="grid grid-cols-3 gap-4 items-center mb-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🏠</div>
              <div className="text-xl font-bold dark:text-white">
                {match?.homeTeam || 'Home Team'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">VS</div>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-2">✈️</div>
              <div className="text-xl font-bold dark:text-white">
                {match?.awayTeam || 'Away Team'}
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t dark:border-gray-800">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Kickoff</div>
              <div className="flex items-center justify-center gap-2 text-sm font-medium dark:text-white">
                <Clock className="h-4 w-4" />
                {contractMatchData?.kickoffTime ? (
                  new Date(contractMatchData.kickoffTime * 1000).toLocaleString()
                ) : match?.kickoffTime ? (
                  new Date(match.kickoffTime * 1000).toLocaleString()
                ) : (
                  'TBD'
                )}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Match ID</div>
              <div className="text-sm font-medium dark:text-white">#{matchId}</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
              <div className="text-sm font-medium dark:text-white">
                {isSettled ? 'Finished' : isBettingClosed ? 'In Progress' : 'Upcoming'}
              </div>
            </div>

            {isSettled && matchResult !== undefined && (
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Result</div>
                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                  {getResultLabel(matchResult)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Place Bet Section */}
          <div className="lg:col-span-2">
            {!isBettingClosed && isConnected ? (
              <BetForm matchId={matchId} match={match} />
            ) : !isBettingClosed && !isConnected ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border dark:border-gray-800">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Connect your wallet to place a bet
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border dark:border-gray-800">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {isSettled ? 'This match has been settled' : 'Betting is closed for this match'}
                </p>
              </div>
            )}
          </div>

          {/* Waiting Bets Section */}
          <div className="lg:col-span-1">
            <WaitingBets matchId={matchId} />
          </div>
        </div>
      </div>
    </div>
  );
}
