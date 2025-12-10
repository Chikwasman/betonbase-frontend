'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Trophy, TrendingUp } from 'lucide-react';
import { formatTimeRemaining } from '@/lib/utils';

interface Match {
  id: number;
  league: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: number;
  bettingClosed: boolean;
}

export function MatchCard({ match }: { match: Match }) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTimeRemaining(formatTimeRemaining(match.kickoffTime));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [match.kickoffTime]);

  const isSoonStart = match.kickoffTime - Math.floor(Date.now() / 1000) < 3600; // Less than 1 hour

  return (
    <Link href={`/match/${match.id}`}>
      <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
        {/* League Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">{match.league}</span>
          </div>
          
          {isSoonStart && !match.bettingClosed && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full animate-pulse">
              Starting Soon!
            </span>
          )}
          
          {match.bettingClosed && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
              Betting Closed
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="grid grid-cols-3 items-center gap-4 mb-4">
          {/* Home Team */}
          <div className="text-right">
            <div className="font-bold text-lg">{match.homeTeam}</div>
            <div className="text-sm text-muted-foreground">Home</div>
          </div>

          {/* VS */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">VS</div>
          </div>

          {/* Away Team */}
          <div className="text-left">
            <div className="font-bold text-lg">{match.awayTeam}</div>
            <div className="text-sm text-muted-foreground">Away</div>
          </div>
        </div>

        {/* Time & Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{timeRemaining}</span>
            <span className="text-xs text-gray-400">
              {new Date(match.kickoffTime * 1000).toLocaleDateString()}
            </span>
          </div>

          {!match.bettingClosed && (
            <div className="flex items-center gap-1 text-primary font-medium text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Place Bet</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}