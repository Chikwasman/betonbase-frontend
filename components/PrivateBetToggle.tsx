'use client';

import { useState } from 'react';
import { Lock, Users, Info, AlertTriangle } from 'lucide-react';

interface PrivateBetToggleProps {
  isPrivate: boolean;
  onToggle: (isPrivate: boolean) => void;
  targetAddress: string;
  onAddressChange: (address: string) => void;
  disabled?: boolean;
}

export function PrivateBetToggle({
  isPrivate,
  onToggle,
  targetAddress,
  onAddressChange,
  disabled = false,
}: PrivateBetToggleProps) {
  const [showHelp, setShowHelp] = useState(false);

  const isValidAddress = targetAddress === '' || /^0x[a-fA-F0-9]{40}$/.test(targetAddress);

  return (
    <div className="space-y-3">
      
      {/* Toggle */}
      <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              Private Bet
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Only a specific friend can match
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => onToggle(!isPrivate)}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
            isPrivate ? 'bg-purple-600' : 'bg-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPrivate ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Address Input */}
      {isPrivate && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Friend's Wallet Address *
          </label>
          <input
            type="text"
            value={targetAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="0x..."
            disabled={disabled}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm ${
              !isValidAddress ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          
          {!isValidAddress && targetAddress !== '' && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Invalid address format</span>
            </div>
          )}

          {isValidAddress && targetAddress !== '' && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
              <Info className="h-4 w-4" />
              <span>Valid address ✓</span>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      {isPrivate && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-2">How Private Bets Work:</p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                <li>• Only the specified address can match this bet</li>
                <li>• Share the match link with your friend</li>
                <li>• Other users will see it's private and can't match</li>
                <li>• Perfect for friendly wagers!</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Public Bet Info */}
      {!isPrivate && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Users className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold mb-1">Public Bet</p>
              <p>Anyone can match this bet. It will appear in the Hot Bets page for all users to see.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
