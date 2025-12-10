'use client';

import { useState, useEffect } from 'react';
import { useReadContracts } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction } from '@/lib/contracts';
import { MatchCard } from '@/components/MatchCard';
import { LeagueSidebar } from '@/components/LeagueSidebar';
import { Search, Loader2, Flame, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);

  // Fetch matches from oracle API
  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/matches`);

        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }

        const data = await response.json();

        if (data.success) {
          setMatches(data.matches);
          // Auto-select all leagues on first load
          if (selectedLeagues.length === 0) {
            const leagues = [...new Set(data.matches.map((m: any) => m.league))];
            setSelectedLeagues(leagues);
          }
        } else {
          throw new Error(data.error || 'Failed to fetch matches');
        }
      } catch (err: any) {
        console.error('Error fetching matches:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();

    // Refresh matches every 5 minutes
    const interval = setInterval(fetchMatches, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Get unique leagues
  const availableLeagues = [...new Set(matches.map((m: any) => m.league))];

  // Fetch waiting bets for hot matches
  const matchQueries = matches.slice(0, 20).flatMap(match => [
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

  const { data: waitingBetsData } = useReadContracts({
    contracts: matchQueries,
  });

  // Calculate bet counts per match
  const matchBetCounts = new Map<number, number>();
  
  if (waitingBetsData) {
    matches.slice(0, 20).forEach((match, matchIndex) => {
      const homeResult = waitingBetsData[matchIndex * 3];
      const awayResult = waitingBetsData[matchIndex * 3 + 1];
      const drawResult = waitingBetsData[matchIndex * 3 + 2];

      const count =
        (Array.isArray(homeResult?.result) ? homeResult.result.length : 0) +
        (Array.isArray(awayResult?.result) ? awayResult.result.length : 0) +
        (Array.isArray(drawResult?.result) ? drawResult.result.length : 0);

      matchBetCounts.set(match.id, count);
    });
  }

  // Get hot matches (most bets)
  const hotMatches = matches
    .map(m => ({ ...m, betCount: matchBetCounts.get(m.id) || 0 }))
    .filter(m => m.betCount > 0)
    .sort((a, b) => b.betCount - a.betCount)
    .slice(0, 3);

  // Get star matches (upcoming, no filter)
  const starMatches = matches.slice(0, 6);

  // Filter matches by league and search
  const filteredMatches = matches.filter((match: any) => {
    const matchesSearch =
      match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLeague =
      selectedLeagues.length === 0 || selectedLeagues.includes(match.league);

    return matchesSearch && matchesLeague;
  });

  // League handlers
  const handleLeagueToggle = (league: string) => {
    setSelectedLeagues((prev) =>
      prev.includes(league) ? prev.filter((l) => l !== league) : [...prev, league]
    );
  };

  const handleSelectAll = () => {
    setSelectedLeagues(availableLeagues);
  };

  const handleClearAll = () => {
    setSelectedLeagues([]);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <LeagueSidebar
        availableLeagues={availableLeagues}
        selectedLeagues={selectedLeagues}
        onLeagueToggle={handleLeagueToggle}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">BetOnBase</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Decentralized P2P betting on Base Sepolia
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                {loading ? '...' : filteredMatches.length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-400">Available Matches</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-900 dark:text-green-300">$10 - $1M</div>
              <div className="text-sm text-green-700 dark:text-green-400">Bet Limits (USD)</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-300">2.5%</div>
              <div className="text-sm text-purple-700 dark:text-purple-400">Winner Fee</div>
            </div>
          </div>

          {/* Hot Matches Section */}
          {hotMatches.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Flame className="h-6 w-6 text-orange-500" />
                  <h2 className="text-2xl font-bold dark:text-white">🔥 Hot Matches</h2>
                </div>
                <Link
                  href="/hot-bets"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View all bets <TrendingUp className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotMatches.map((match) => (
                  <div key={match.id} className="relative">
                    <div className="absolute -top-2 -right-2 z-10 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {match.betCount} bet{match.betCount !== 1 ? 's' : ''}
                    </div>
                    <MatchCard match={match} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Star Matches Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold dark:text-white">⭐ Featured Matches</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {starMatches.slice(0, 6).map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">All Matches</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading matches...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <p className="text-red-600 dark:text-red-400 mb-2">Failed to load matches</p>
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Match List */}
          {!loading && !error && (
            <div className="space-y-4">
              {filteredMatches.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || selectedLeagues.length === 0
                      ? 'No matches found matching your filters'
                      : 'No upcoming matches available'}
                  </p>
                  {(searchTerm || selectedLeagues.length === 0) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        handleSelectAll();
                      }}
                      className="mt-4 text-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                filteredMatches.map((match: any) => (
                  <MatchCard key={match.id} match={match} />
                ))
              )}
            </div>
          )}

          {/* Connection Status */}
          {!loading && !error && matches.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ✅ Connected to oracle • {matches.length} matches loaded
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}