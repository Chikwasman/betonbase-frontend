'use client';

import { useState } from 'react';
import { X, Menu, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

const LEAGUES = [
  { id: 'epl', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'laliga', name: 'La Liga', flag: '🇪🇸' },
  { id: 'seriea', name: 'Serie A', flag: '🇮🇹' },
  { id: 'bundesliga', name: 'Bundesliga', flag: '🇩🇪' },
  { id: 'champions', name: 'Champions League', flag: '🏆' },
  { id: 'europa', name: 'Europa League', flag: '⚽' },
];

interface LeagueSidebarProps {
  availableLeagues: string[];
  selectedLeagues: string[];
  onLeagueToggle: (league: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function LeagueSidebar({
  availableLeagues,
  selectedLeagues,
  onLeagueToggle,
  onSelectAll,
  onClearAll,
}: LeagueSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-40 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r dark:border-gray-800 z-50 transition-transform duration-300 overflow-y-auto',
          'w-64 lg:w-72',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold dark:text-white">Leagues</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="h-5 w-5 dark:text-gray-400" />
            </button>
          </div>

          {/* Select Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={onSelectAll}
              className="flex-1 px-3 py-1.5 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20"
            >
              Select All
            </button>
            <button
              onClick={onClearAll}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Clear
            </button>
          </div>

          {/* League List */}
          <div className="space-y-2">
            {availableLeagues.map((league) => {
              const leagueInfo = LEAGUES.find(l => l.name === league);
              const isSelected = selectedLeagues.includes(league);

              return (
                <button
                  key={league}
                  onClick={() => onLeagueToggle(league)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                    isSelected
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                  )}
                >
                  {isSelected ? (
                    <CheckSquare className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-xl">{leagueInfo?.flag || '⚽'}</span>
                  <span className={cn(
                    'text-sm font-medium flex-1',
                    isSelected ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {league}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Count */}
          {selectedLeagues.length > 0 && (
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <span className="font-bold">{selectedLeagues.length}</span> league
                {selectedLeagues.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
