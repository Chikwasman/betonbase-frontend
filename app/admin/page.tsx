'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI } from '@/lib/contracts';
import { Shield, AlertTriangle, Settings, Database, TrendingUp, Users, AlertOctagon, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// 🔥 REPLACE THIS WITH YOUR DEPLOYER WALLET ADDRESS
const DEPLOYER_ADDRESS = '0x62D4C02280d5C8624CE998fC028ee14286b98541'; // <-- PUT YOUR ADDRESS HERE

// Extended ABI with admin functions including emergency
const ADMIN_ABI = [
  ...BET_ON_BASE_ABI,
  {
    name: 'cancelMatch',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'matchId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'activateEmergency',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'emergencyMode',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'emergencyWithdrawTime',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'withdrawFees',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'pause',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'unpause',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as any;

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState<string>('');

  // Read contract stats
  const { data: nextBetId } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'nextBetId',
  });

  const { data: platformFee } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'PLATFORM_GAS_FEE',
  });

  const { data: winnerFeeBP } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'WINNER_FEE_BP',
  });

  // Emergency mode state
  const { data: emergencyMode, refetch: refetchEmergencyMode } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: ADMIN_ABI,
    functionName: 'emergencyMode',
  }) as { data: boolean | undefined; refetch: () => void };

  const { data: emergencyWithdrawTime, refetch: refetchWithdrawTime } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: ADMIN_ABI,
    functionName: 'emergencyWithdrawTime',
  }) as { data: bigint | undefined; refetch: () => void };

  const { writeContractAsync } = useWriteContract();

  // Check if user is admin (using hardcoded deployer address)
  const isAdmin = isConnected && address?.toLowerCase() === DEPLOYER_ADDRESS.toLowerCase();

  console.log('Admin check:', {
    connected: isConnected,
    userAddress: address,
    deployerAddress: DEPLOYER_ADDRESS,
    isAdmin,
  });

  // Update emergency countdown
  useEffect(() => {
    if (!emergencyMode || !emergencyWithdrawTime) {
      setEmergencyCountdown('');
      return;
    }

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const withdrawTimestamp = Number(emergencyWithdrawTime);
      const timeLeft = withdrawTimestamp - now;

      if (timeLeft <= 0) {
        setEmergencyCountdown('✅ Emergency withdrawals now available!');
        return;
      }

      const days = Math.floor(timeLeft / 86400);
      const hours = Math.floor((timeLeft % 86400) / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      const seconds = timeLeft % 60;

      setEmergencyCountdown(
        `${days}d ${hours}h ${minutes}m ${seconds}s until withdrawals available`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [emergencyMode, emergencyWithdrawTime]);

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
      } as any);

      alert(`Match ${matchId} cancelled successfully!`);
      setSelectedMatch(null);
      setCancelReason('');
    } catch (error: any) {
      console.error('Error cancelling match:', error);
      alert('Failed to cancel match: ' + (error.message || 'Unknown error'));
    }
  };

  // Activate emergency mode
  const handleActivateEmergency = async () => {
    setShowEmergencyConfirm(false);

    try {
      const tx = await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: ADMIN_ABI,
        functionName: 'activateEmergency',
        args: [],
      } as any);

      alert('🚨 Emergency mode activated!\n\nUsers can withdraw after 7 days.\n\nTransaction: ' + tx);
      
      // Refetch emergency state
      setTimeout(() => {
        refetchEmergencyMode();
        refetchWithdrawTime();
      }, 2000);
    } catch (error: any) {
      console.error('Error activating emergency:', error);
      
      if (error.message?.includes('Emergency already active')) {
        alert('Emergency mode is already active!');
      } else {
        alert('Failed to activate emergency mode: ' + (error.message || 'Unknown error'));
      }
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
        args: [],
      } as any);

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
        args: [],
      } as any);

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

        {/* Emergency Mode Alert */}
        {emergencyMode && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mb-6 animate-pulse">
            <div className="flex items-start gap-4">
              <AlertOctagon className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  🚨 EMERGENCY MODE ACTIVE
                </h3>
                <p className="text-red-700 mb-3">
                  The emergency withdrawal mechanism has been activated. Users can withdraw their funds after the waiting period.
                </p>
                <div className="bg-white rounded-lg p-4 border border-red-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-900">Countdown:</span>
                  </div>
                  <p className="text-lg font-mono text-red-800">
                    {emergencyCountdown}
                  </p>
                  {emergencyWithdrawTime && (
                    <p className="text-sm text-red-600 mt-2">
                      Available at: {new Date(Number(emergencyWithdrawTime) * 1000).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
                  {platformFee ? (Number(platformFee) / 1e18).toFixed(4) : '0'} ETH
                </div>
                <div className="text-sm text-gray-600">Platform Fee</div>
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
          {/* Emergency Controls */}
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-red-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertOctagon className="h-6 w-6 text-red-600" />
              Emergency Controls
            </h2>
            
            {!emergencyMode ? (
              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠️ What is Emergency Mode?</h3>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>Activates 7-day withdrawal delay</li>
                    <li>Allows users to recover stuck funds</li>
                    <li>Use only if oracle fails</li>
                    <li>Cannot be reversed once activated</li>
                  </ul>
                </div>

                <button
                  onClick={() => setShowEmergencyConfirm(true)}
                  className="w-full px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-lg flex items-center justify-center gap-2"
                >
                  <AlertOctagon className="h-6 w-6" />
                  ACTIVATE EMERGENCY MODE
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="font-semibold text-gray-900">Emergency Mode Active</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Users can withdraw their funds after the waiting period expires.
                </p>
                <div className="text-xs text-gray-500">
                  Activated: {emergencyWithdrawTime ? 
                    new Date((Number(emergencyWithdrawTime) - 7 * 24 * 60 * 60) * 1000).toLocaleString() : 
                    'Unknown'
                  }
                </div>
              </div>
            )}
          </div>

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
        </div>

        {/* System Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
            <div className="flex justify-between">
              <span className="text-gray-600">Emergency Mode:</span>
              <span className={`font-semibold ${emergencyMode ? 'text-red-600' : 'text-green-600'}`}>
                {emergencyMode ? '🚨 ACTIVE' : '✅ Normal'}
              </span>
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

        {/* Emergency Confirmation Modal */}
        {showEmergencyConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-lg w-full">
              <div className="text-center mb-6">
                <AlertOctagon className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-red-900 mb-2">
                  Activate Emergency Mode?
                </h3>
                <p className="text-gray-600">
                  This action cannot be undone. Please confirm you understand the consequences.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-red-900 mb-3">⚠️ WARNING</h4>
                <ul className="text-sm text-red-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Users will be able to withdraw ALL their bets after 7 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>This should only be used if the oracle has failed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Emergency mode cannot be deactivated once enabled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>The 7-day delay protects users from owner abuse</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleActivateEmergency}
                  className="w-full px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-lg"
                >
                  YES, ACTIVATE EMERGENCY MODE
                </button>
                <button
                  onClick={() => setShowEmergencyConfirm(false)}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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