'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Trophy, TrendingUp, Users, DollarSign, Flame } from 'lucide-react';
import { formatTimeRemaining } from '@/lib/utils';
import { useReadContracts } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction } from '@/lib/contracts';

interface Match {
  id: number;
  league: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: number;
  bettingClosed: boolean;
}

export function MatchCard({ match, showBetCount = false }: { match: Match; showBetCount?: boolean }) {
  const [timeRemaining, setTimeRemaining] = useState('');

  // Fetch waiting bets count
  const { data: waitingBetsData } = useReadContracts({
    contracts: [
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
    ],
  });

  // Calculate bet counts
  const homeBets = Array.isArray(waitingBetsData?.[0]?.result) ? waitingBetsData[0].result.length : 0;
  const awayBets = Array.isArray(waitingBetsData?.[1]?.result) ? waitingBetsData[1].result.length : 0;
  const drawBets = Array.isArray(waitingBetsData?.[2]?.result) ? waitingBetsData[2].result.length : 0;
  const totalBets = homeBets + awayBets + drawBets;

  useEffect(() => {
    const updateTime = () => {
      setTimeRemaining(formatTimeRemaining(match.kickoffTime));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [match.kickoffTime]);

  const isSoonStart = match.kickoffTime - Math.floor(Date.now() / 1000) < 3600; // Less than 1 hour
  const isHot = totalBets >= 3;

  return (
    <Link href={`/match/${match.id}`}>
      <div 
        className={`
          relative bg-white dark:bg-gray-900 border-2 dark:border-gray-800 rounded-xl 
          overflow-hidden transition-all duration-300
          hover:shadow-xl hover:border-green-500 dark:hover:border-green-600 
          hover:-translate-y-1 cursor-pointer
          ${isHot ? 'border-orange-200 dark:border-orange-900' : ''}
        `}
      >
        {/* Hot Badge - Traditional Betting Style */}
        {isHot && (
          <div className="absolute -top-1 -right-1 z-10">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-bl-xl rounded-tr-xl shadow-lg flex items-center gap-2 animate-pulse">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-bold">HOT</span>
            </div>
          </div>
        )}

        {/* League Header - Traditional Style */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                {match.league}
              </span>
            </div>

            {isSoonStart && !match.bettingClosed ? (
              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-1">
                <Clock className="h-3 w-3" />
                STARTING SOON
              </span>
            ) : match.bettingClosed ? (
              <span className="px-2 py-0.5 bg-gray-600 text-white text-xs font-bold rounded-full">
                CLOSED
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
            )}
          </div>
        </div>

        {/* Match Details */}
        <div className="p-5">
          {/* Teams - Traditional Horizontal Layout */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-4">
            {/* Home Team */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {match.homeTeam.substring(0, 3).toUpperCase()}
                </span>
              </div>
              <div className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                {match.homeTeam}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-1">
                Home
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center px-2">
              <div className="text-sm font-bold text-gray-400 dark:text-gray-600">VS</div>
              <div className="h-px w-12 bg-gray-300 dark:bg-gray-700 my-1"></div>
            </div>

            {/* Away Team */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-red-600 dark:text-red-400">
                  {match.awayTeam.substring(0, 3).toUpperCase()}
                </span>
              </div>
              <div className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                {match.awayTeam}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-1">
                Away
              </div>
            </div>
          </div>

          {/* P2P Market Info - Traditional Odds Style */}
          {totalBets > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-3 mb-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-green-900 dark:text-green-300 uppercase flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  P2P Market
                </span>
                <span className="text-xs font-bold text-green-700 dark:text-green-400">
                  {totalBets} bet{totalBets !== 1 ? 's' : ''} waiting
                </span>
              </div>
              
              {/* Market Breakdown - Traditional Odds Display */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">HOME</div>
                  <div className={`text-sm font-bold ${homeBets > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                    {homeBets > 0 ? `${homeBets} bet${homeBets !== 1 ? 's' : ''}` : '—'}
                  </div>
                </div>
                <div className="text-center border-x border-gray-300 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">DRAW</div>
                  <div className={`text-sm font-bold ${drawBets > 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'}`}>
                    {drawBets > 0 ? `${drawBets} bet${drawBets !== 1 ? 's' : ''}` : '—'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">AWAY</div>
                  <div className={`text-sm font-bold ${awayBets > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                    {awayBets > 0 ? `${awayBets} bet${awayBets !== 1 ? 's' : ''}` : '—'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Time & Action Bar - Traditional Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{timeRemaining}</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                {new Date(match.kickoffTime * 1000).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>

            {!match.bettingClosed && (
              <button className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-sm rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg">
                <TrendingUp className="h-4 w-4" />
                <span>BET NOW</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
