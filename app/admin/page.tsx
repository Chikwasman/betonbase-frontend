'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI } from '@/lib/contracts';
import { Shield, AlertTriangle, Settings, Database, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// 🔥 REPLACE THIS WITH YOUR DEPLOYER WALLET ADDRESS
const DEPLOYER_ADDRESS = '0x62D4C02280d5C8624CE998fC028ee14286b98541'; // <-- PUT YOUR ADDRESS HERE

// Extended ABI with potential admin functions
const ADMIN_ABI = [
  ...BET_ON_BASE_ABI,
  'function cancelMatch(uint256 matchId)',
  'function withdrawFees()',
  'function pause()',
  'function unpause()',
] as const;

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Read contract stats
  const { data: nextBetId } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'nextBetId',
  });

  const { data: hiddenFee } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'HIDDEN_FEE',
  });

  const { data: winnerFeeBP } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'WINNER_FEE_BP',
  });

  const { writeContractAsync } = useWriteContract();

  // Check if user is admin (using hardcoded deployer address)
  const isAdmin = isConnected && address?.toLowerCase() === DEPLOYER_ADDRESS.toLowerCase();

  console.log('Admin check:', {
    connected: isConnected,
    userAddress: address,
    deployerAddress: DEPLOYER_ADDRESS,
    isAdmin,
  });

  // Fetch matches from API
  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await fetch(`${API_URL}/api/matches`);
        const data = await response.json();
        if (data.success) {
          setMatches(data.matches);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    }
    fetchMatches();
  }, []);

  // Cancel match
  const handleCancelMatch = async (matchId: number) => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: ADMIN_ABI,
        functionName: 'cancelMatch',
        args: [BigInt(matchId)],
      });

      alert(`Match ${matchId} cancelled successfully!`);
      setSelectedMatch(null);
      setCancelReason('');
    } catch (error: any) {
      console.error('Error cancelling match:', error);
      alert('Failed to cancel match: ' + (error.message || 'Unknown error'));
    }
  };

  // Withdraw fees
  const handleWithdrawFees = async () => {
    if (!confirm('Withdraw all accumulated fees?')) return;

    try {
      await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: ADMIN_ABI,
        functionName: 'withdrawFees',
      });

      alert('Fees withdrawn successfully!');
    } catch (error: any) {
      console.error('Error withdrawing fees:', error);
      alert('Failed to withdraw fees: ' + (error.message || 'Unknown error'));
    }
  };

  // Pause/Unpause contract
  const handlePauseToggle = async (pause: boolean) => {
    try {
      await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: ADMIN_ABI,
        functionName: pause ? 'pause' : 'unpause',
      });

      alert(`Contract ${pause ? 'paused' : 'unpaused'} successfully!`);
    } catch (error: any) {
      console.error('Error toggling pause:', error);
      alert('Failed to toggle pause: ' + (error.message || 'Unknown error'));
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-6">Connect your wallet to access admin features</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 shadow-lg text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-red-900">Access Denied</h1>
          <p className="text-red-600 mb-4">You are not authorized to access this page</p>
          <div className="bg-white rounded p-4 mb-4">
            <p className="text-xs text-gray-600 mb-2">Required (Deployer):</p>
            <p className="text-xs font-mono break-all">{DEPLOYER_ADDRESS}</p>
            <p className="text-xs text-gray-600 mt-2 mb-2">Your address:</p>
            <p className="text-xs font-mono break-all">{address}</p>
          </div>
          <Link 
            href="/"
            className="mt-4 inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage BetOnBase platform</p>
            </div>
            <Link 
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Success Badge */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Admin Access Granted</p>
              <p className="text-sm text-green-700">Connected as: {address}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Database className="h-10 w-10 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {nextBetId ? (Number(nextBetId) - 1).toString() : '0'}
                </div>
                <div className="text-sm text-gray-600">Total Bets</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-10 w-10 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{matches.length}</div>
                <div className="text-sm text-gray-600">Active Matches</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Settings className="h-10 w-10 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {hiddenFee ? (Number(hiddenFee) / 1e18).toFixed(4) : '0'} ETH
                </div>
                <div className="text-sm text-gray-600">Hidden Fee</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {winnerFeeBP ? (Number(winnerFeeBP) / 100).toFixed(1) : '0'}%
                </div>
                <div className="text-sm text-gray-600">Winner Fee</div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Contract Controls */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Contract Controls</h2>
            <div className="space-y-3">
              <button
                onClick={handleWithdrawFees}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                💰 Withdraw Accumulated Fees
              </button>

              <button
                onClick={() => handlePauseToggle(true)}
                className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
              >
                ⏸️ Pause Contract
              </button>

              <button
                onClick={() => handlePauseToggle(false)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                ▶️ Unpause Contract
              </button>
            </div>
          </div>

          {/* Oracle Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">System Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Contract:</span>
                <span className="font-mono text-xs text-right break-all max-w-[200px]">
                  {CONTRACTS.BetOnBase}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Deployer:</span>
                <span className="font-mono text-xs text-right break-all max-w-[200px]">
                  {DEPLOYER_ADDRESS}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API URL:</span>
                <span className="font-mono text-xs">{API_URL}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Matches */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Active Matches</h2>
          
          {matches.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active matches</p>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="border rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        {match.homeTeam} vs {match.awayTeam}
                      </div>
                      <div className="text-sm text-gray-600">
                        {match.league} • ID: {match.id}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(match.kickoffTime * 1000).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMatch(match.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Cancel Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancel Match Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Cancel Match #{selectedMatch}</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Reason for Cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Match postponed, Technical issues, etc."
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedMatch(null);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCancelMatch(selectedMatch)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}