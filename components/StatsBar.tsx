'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, Activity, Flame } from 'lucide-react';
import { useReadContract } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI } from '@/lib/contracts';

export function StatsBar() {
  const [stats, setStats] = useState({
    totalMatches: 0,
    activeBets: 0,
    tvl: '0',
    fee: '2.5%',
  });

  // You can fetch real stats from your API or contract
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/matches`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(prev => ({
              ...prev,
              totalMatches: data.matches.length,
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 border-b-2 border-gray-700 dark:border-gray-600">
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Matches */}
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.totalMatches}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                Live Matches
              </div>
            </div>
          </div>

          {/* Active Bets */}
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.activeBets}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                Active Bets
              </div>
            </div>
          </div>

          {/* TVL */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.tvl || '—'}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                Total Value
              </div>
            </div>
          </div>

          {/* Fee */}
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.fee}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                Winner Fee
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling Ticker (Optional) */}
      <div className="bg-gray-800 dark:bg-gray-900 border-t border-gray-700 dark:border-gray-600 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap py-2 text-sm text-gray-300">
          <span className="inline-flex items-center gap-2 mx-4">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live on Base Sepolia
          </span>
          <span className="mx-4">•</span>
          <span className="mx-4">⚡ P2P Betting Platform</span>
          <span className="mx-4">•</span>
          <span className="mx-4">🔒 Fully Decentralized</span>
          <span className="mx-4">•</span>
          <span className="mx-4">💎 0.0001 ETH Platform Fee</span>
          <span className="mx-4">•</span>
          <span className="mx-4">🎯 2.5% Winner Fee</span>
          <span className="mx-4">•</span>
          <span className="inline-flex items-center gap-2 mx-4">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live on Base Sepolia
          </span>
        </div>
      </div>
    </div>
  );
}
