'use client';

import { Info, Shield, Trophy, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface DrawStrategyProps {
  isCreator?: boolean;
  opponentAllowsDraw?: boolean;
  showDetailed?: boolean;
}

export function DrawStrategyExplainer({ 
  isCreator = false, 
  opponentAllowsDraw, 
  showDetailed = false 
}: DrawStrategyProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-3">
      
      {/* Quick Summary */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              What does "Allow Draw" mean?
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              It determines who wins if the match ends in a tie (draw).
            </p>
          </div>
        </div>
      </div>

      {/* Scenarios Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Draw Outcome Scenarios
          </h4>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          
          {/* Scenario 1: Both Don't Allow */}
          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Both ❌ Don't Allow Draw
                  </span>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                    Safe
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If draw → <strong className="text-green-600 dark:text-green-400">Both get refund</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Scenario 2: Only Creator Allows */}
          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Creator ✅ Allows, Matcher ❌ Doesn't
                  </span>
                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                    Risky
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If draw → <strong className="text-blue-600 dark:text-blue-400">Creator wins</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Scenario 3: Only Matcher Allows */}
          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Creator ❌ Doesn't, Matcher ✅ Allows
                  </span>
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    Risky
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If draw → <strong className="text-purple-600 dark:text-purple-400">Matcher wins</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Scenario 4: Both Allow */}
          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Both ✅ Allow Draw
                  </span>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                    Safe
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If draw → <strong className="text-green-600 dark:text-green-400">Both get refund</strong>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Contextual Advice */}
      {!isCreator && opponentAllowsDraw !== undefined && (
        <div className={`border rounded-lg p-4 ${
          opponentAllowsDraw 
            ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' 
            : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-start gap-2">
            {opponentAllowsDraw ? (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                    ⚠️ Opponent Allowed Draw!
                  </p>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">
                    If you DON'T select "Allow Draw" and match draws, opponent wins everything.
                  </p>
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    💡 Recommendation: Also select "Allow Draw" to neutralize opponent's advantage.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    💡 Opportunity!
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    Opponent didn't allow draw. If you select "Allow Draw" and match draws, YOU win!
                  </p>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Consider selecting "Allow Draw" for potential advantage.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Creator Advice */}
      {isCreator && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            💡 Strategy Tips:
          </p>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span><strong>Allow Draw:</strong> Take a calculated risk. You win if opponent doesn't allow it and match draws.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
              <span><strong>Don't Allow:</strong> Play it safe. You get refund if opponent also doesn't allow and match draws.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">⚠</span>
              <span>Remember: Matchers can see your choice and counter it!</span>
            </li>
          </ul>
        </div>
      )}

      {/* Toggle More Info */}
      {showDetailed && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
        >
          {showMore ? '− Show Less' : '+ Show Detailed Examples'}
        </button>
      )}

      {/* Detailed Examples */}
      {showMore && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Real Examples:
          </h4>

          {/* Example 1 */}
          <div className="space-y-2">
            <p className="font-medium text-gray-900 dark:text-white">
              Example 1: Both Play Safe
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-3 text-sm">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                <strong>Alice:</strong> Man United wins, ❌ No Draw (50 USDC)<br />
                <strong>Bob:</strong> Liverpool wins, ❌ No Draw (50 USDC)
              </p>
              <p className="text-gray-900 dark:text-white">
                <strong>Result:</strong> 1-1 Draw<br />
                <strong>Outcome:</strong> <span className="text-green-600 dark:text-green-400">Both get 50 USDC back</span>
              </p>
            </div>
          </div>

          {/* Example 2 */}
          <div className="space-y-2">
            <p className="font-medium text-gray-900 dark:text-white">
              Example 2: Alice Takes Risk
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-3 text-sm">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                <strong>Alice:</strong> Chelsea wins, ✅ Allow Draw (100 USDC)<br />
                <strong>Bob:</strong> Arsenal wins, ❌ No Draw (100 USDC)
              </p>
              <p className="text-gray-900 dark:text-white">
                <strong>Result:</strong> 2-2 Draw<br />
                <strong>Outcome:</strong> <span className="text-blue-600 dark:text-blue-400">Alice wins 195 USDC!</span> 🏆
              </p>
            </div>
          </div>

          {/* Example 3 */}
          <div className="space-y-2">
            <p className="font-medium text-gray-900 dark:text-white">
              Example 3: Bob Outsmarts Alice
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-3 text-sm">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                <strong>Alice:</strong> Man City wins, ❌ No Draw (75 USDC)<br />
                <strong>Bob:</strong> Spurs wins, ✅ Allow Draw (75 USDC)
              </p>
              <p className="text-gray-900 dark:text-white">
                <strong>Result:</strong> 0-0 Draw<br />
                <strong>Outcome:</strong> <span className="text-purple-600 dark:text-purple-400">Bob wins 146.25 USDC!</span> 🏆
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
