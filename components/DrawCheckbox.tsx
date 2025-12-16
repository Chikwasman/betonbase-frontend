'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

interface DrawCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  opponentAllowsDraw?: boolean;
  isCreator?: boolean;
}

export function DrawCheckbox({ 
  checked, 
  onChange, 
  disabled = false,
  opponentAllowsDraw,
  isCreator = true
}: DrawCheckboxProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="space-y-2">
      
      {/* Checkbox */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowDraw"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label 
            htmlFor="allowDraw" 
            className={`font-medium text-gray-900 dark:text-white ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Allow Draw
          </label>
        </div>

        {/* Info Button */}
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Quick Explanation */}
      <div className="text-sm text-gray-600 dark:text-gray-400 ml-6">
        {isCreator ? (
          <>
            {checked ? (
              <p>
                ✅ If draw: You win (unless opponent also selects) or get refund
              </p>
            ) : (
              <p>
                ❌ If draw: Get refund (unless opponent selects, then they win)
              </p>
            )}
          </>
        ) : (
          <>
            {opponentAllowsDraw !== undefined && (
              <>
                {opponentAllowsDraw ? (
                  checked ? (
                    <p className="text-green-600 dark:text-green-400">
                      ✅ Good! Both get refund if draw (opponent's advantage neutralized)
                    </p>
                  ) : (
                    <p className="text-orange-600 dark:text-orange-400">
                      ⚠️ Warning: Opponent wins if draw! Consider checking this box.
                    </p>
                  )
                ) : (
                  checked ? (
                    <p className="text-blue-600 dark:text-blue-400">
                      ✅ Smart! You'll win if draw (opponent didn't select)
                    </p>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">
                      Both get refund if draw (safe choice)
                    </p>
                  )
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Tooltip Overlay */}
      {showTooltip && (
        <div className="relative">
          <div className="absolute left-0 top-0 z-50 w-full max-w-md p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-900 dark:text-white">
                Draw Strategy Explained:
              </p>
              
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    ✓ Both DON'T allow → Both get refund
                  </p>
                </div>
                <div>
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    ✓ Only YOU allow → You win on draw
                  </p>
                </div>
                <div>
                  <p className="font-medium text-red-600 dark:text-red-400">
                    ✗ Only OPPONENT allows → Opponent wins on draw
                  </p>
                </div>
                <div>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    ✓ Both ALLOW → Both get refund
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                Click outside to close
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
