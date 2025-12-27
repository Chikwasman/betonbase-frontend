// components/MatchFilter.tsx
'use client'

import { Calendar, Clock, List } from 'lucide-react'

interface MatchFilterProps {
  activeFilter: 'today' | 'tomorrow' | 'all'
  onFilterChange: (filter: 'today' | 'tomorrow' | 'all') => void
  counts: {
    today: number
    tomorrow: number
    all: number
  }
}

export function MatchFilter({ activeFilter, onFilterChange, counts }: MatchFilterProps) {
  const filters = [
    {
      id: 'today' as const,
      label: 'Today',
      icon: Calendar,
      count: counts.today,
    },
    {
      id: 'tomorrow' as const,
      label: 'Tomorrow',
      icon: Clock,
      count: counts.tomorrow,
    },
    {
      id: 'all' as const,
      label: 'All Matches',
      icon: List,
      count: counts.all,
    },
  ]

  return (
    <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
      {filters.map((filter) => {
        const Icon = filter.icon
        const isActive = activeFilter === filter.id

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              whitespace-nowrap
              ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{filter.label}</span>
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }
              `}
            >
              {filter.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}