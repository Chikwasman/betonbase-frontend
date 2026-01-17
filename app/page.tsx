'use client';

import { useState, useEffect } from 'react';
import { useReadContracts } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction } from '@/lib/contracts';
import { MatchCard } from '@/components/MatchCard';
import { LeagueSidebar } from '@/components/LeagueSidebar';
import { MatchFilter } from '@/components/MatchFilter';
import { StatsBar } from '@/components/StatsBar';
import { Search, Loader2, Flame, Star, TrendingUp, Filter } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'all'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            const leagues = [...new Set(data.matches.map((m: any) => m.league))] as string[];
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
    .slice(0, 6);

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

  // Helper functions for date filtering
  const isToday = (timestamp: number) => {
    const matchDate = new Date(timestamp * 1000);
    const today = new Date();
    return (
      matchDate.getDate() === today.getDate() &&
      matchDate.getMonth() === today.getMonth() &&
      matchDate.getFullYear() === today.getFullYear()
    );
  };

  const isTomorrow = (timestamp: number) => {
    const matchDate = new Date(timestamp * 1000);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      matchDate.getDate() === tomorrow.getDate() &&
      matchDate.getMonth() === tomorrow.getMonth() &&
      matchDate.getFullYear() === tomorrow.getFullYear()
    );
  };

  // Filter matches by date
  const dateFilteredMatches = filteredMatches.filter((match: any) => {
    if (dateFilter === 'today') return isToday(match.kickoffTime);
    if (dateFilter === 'tomorrow') return isTomorrow(match.kickoffTime);
    return true; // 'all'
  });

  // Calculate counts for filter buttons
  const filterCounts = {
    today: filteredMatches.filter((m: any) => isToday(m.kickoffTime)).length,
    tomorrow: filteredMatches.filter((m: any) => isTomorrow(m.kickoffTime)).length,
    all: filteredMatches.length,
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Stats Bar - Traditional Betting Style */}
      <StatsBar />

      <div className="flex">
        {/* Sidebar - Desktop Only */}
        <div className="hidden lg:block">
          <LeagueSidebar
            availableLeagues={availableLeagues}
            selectedLeagues={selectedLeagues}
            onLeagueToggle={handleLeagueToggle}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="container mx-auto px-4 py-6">
            {/* Header - Traditional Betting Style */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-1">
                    BetOnBase
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Peer-to-Peer Sports Betting • Base Sepolia
                  </p>
                </div>
                
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden bg-green-600 text-white p-2 rounded-lg"
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Hot Matches Section - Traditional Betting Layout */}
            {hotMatches.length > 0 && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-t-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Flame className="h-6 w-6 text-white animate-pulse" />
                    <h2 className="text-xl font-bold text-white">🔥 HOT MATCHES</h2>
                  </div>
                  <Link
                    href="/hot-bets"
                    className="text-sm text-white hover:underline flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg"
                  >
                    View All <TrendingUp className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-gray-900 p-4 rounded-b-xl border-2 border-t-0 border-orange-200 dark:border-orange-900">
                  {hotMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {/* Featured Matches Section */}
            {starMatches.length > 0 && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-t-xl p-4 flex items-center gap-3">
                  <Star className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">⭐ FEATURED MATCHES</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-gray-900 p-4 rounded-b-xl border-2 border-t-0 border-yellow-200 dark:border-yellow-900">
                  {starMatches.slice(0, 6).map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {/* Search & Filter Section */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  All Matches
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {dateFilteredMatches.length} match{dateFilteredMatches.length !== 1 ? 'es' : ''}
                </div>
              </div>

              {/* Search Bar - Traditional Style */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-900 dark:text-white text-lg"
                />
              </div>

              {/* Date Filter */}
              {!loading && !error && (
                <MatchFilter
                  activeFilter={dateFilter}
                  onFilterChange={setDateFilter}
                  counts={filterCounts}
                />
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
                <span className="text-lg text-gray-600 dark:text-gray-400">Loading matches...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
                <p className="text-red-600 dark:text-red-400 mb-2 text-lg font-semibold">Failed to load matches</p>
                <p className="text-sm text-red-500 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Match List - Grid Layout */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateFilteredMatches.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                      {searchTerm || selectedLeagues.length === 0
                        ? 'No matches found matching your filters'
                        : 'No upcoming matches available'}
                    </p>
                    {(searchTerm || selectedLeagues.length === 0) && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setDateFilter('all');
                          handleSelectAll();
                        }}
                        className="text-green-600 dark:text-green-400 hover:underline font-semibold"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  dateFilteredMatches.map((match: any) => (
                    <MatchCard key={match.id} match={match} />
                  ))
                )}
              </div>
            )}

            {/* Connection Status */}
            {!loading && !error && matches.length > 0 && (
              <div className="mt-8 text-center py-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  ✅ Connected to oracle • {matches.length} matches loaded • Updates every 5 minutes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}