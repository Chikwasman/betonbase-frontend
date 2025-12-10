'use client';

import { use, useState, useEffect } from 'react';
import { BetForm } from '@/components/BetForm';
import { WaitingBets } from '@/components/WaitingBets';
import { ArrowLeft, Trophy, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatTimeRemaining } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const matchId = parseInt(id);
  
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatch() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/matches/${matchId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch match');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setMatch(data.match);
        } else {
          throw new Error(data.error || 'Match not found');
        }
      } catch (err: any) {
        console.error('Error fetching match:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Matches</span>
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-2">Failed to load match</p>
            <p className="text-sm text-red-500">{error || 'Match not found'}</p>
            <Link 
              href="/"
              className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Return to Matches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Matches</span>
        </Link>

        {/* Match Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          {/* League */}
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">{match.league}</span>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-3 items-center gap-8 mb-6">
            <div className="text-right">
              <div className="text-3xl font-bold mb-2">{match.homeTeam}</div>
              <div className="text-muted-foreground">Home</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-gray-300">VS</div>
            </div>

            <div className="text-left">
              <div className="text-3xl font-bold mb-2">{match.awayTeam}</div>
              <div className="text-muted-foreground">Away</div>
            </div>
          </div>

          {/* Time Info */}
          <div className="flex items-center justify-center gap-2 text-gray-600 pt-6 border-t">
            <Clock className="h-5 w-5" />
            <span className="font-medium">{formatTimeRemaining(match.kickoffTime)}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm">
              {new Date(match.kickoffTime * 1000).toLocaleString()}
            </span>
          </div>

          {/* Betting Status */}
          {match.bettingClosed && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 font-medium">⚠️ Betting is closed for this match</p>
              <p className="text-sm text-yellow-600 mt-1">Betting closes 15 minutes before kickoff</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bet Form */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Place Your Bet</h2>
            <BetForm matchId={matchId} match={match} />
          </div>

          {/* Waiting Bets */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Available Bets</h2>
            <WaitingBets matchId={matchId} />
          </div>
        </div>
      </div>
    </div>
  );
}