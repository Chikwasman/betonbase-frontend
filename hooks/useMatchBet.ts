import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction } from '@/lib/contracts';

interface MatchBetParams {
  betId: bigint;
  allowDraw: boolean;
  prediction: Prediction; // ✅ NEW: Required for DRAW bet matching
}

export function useMatchBet() {
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync, isPending: isLoading } = useWriteContract();

  const matchBet = async ({ betId, allowDraw, prediction }: MatchBetParams) => {
    try {
      setError(null);

      // Validate prediction
      if (prediction !== Prediction.HOME && prediction !== Prediction.AWAY && prediction !== Prediction.DRAW) {
        throw new Error('Invalid prediction');
      }

      // Hidden fee in ETH
      const HIDDEN_FEE = BigInt('1000000000000000'); // 0.001 ETH

      // ✅ NEW: Call contract with 3 parameters (added prediction)
      const hash = await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'matchBet',
        args: [
          betId,
          allowDraw,
          prediction, // ✅ NEW: Pass prediction parameter
        ],
        value: HIDDEN_FEE, // User pays hidden fee in ETH
      });

      return hash;
    } catch (err: any) {
      console.error('Match bet error:', err);
      setError(err.message || 'Failed to match bet');
      throw err;
    }
  };

  return {
    matchBet,
    isLoading,
    error,
  };
}