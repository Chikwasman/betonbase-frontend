import { useState } from 'react';
import { useWriteContract, useReadContract } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI } from '@/lib/contracts';

export function useMatchBet() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  // Read hidden fee
  const { data: hiddenFee } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'HIDDEN_FEE',
  });

  const matchBet = async (betId: bigint) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get bet details to determine value needed
      // For now, just send a reasonable amount
      const value = hiddenFee || BigInt(0);

      const hash = await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'matchBet',
        args: [betId],
        value,
      });

      console.log('Match bet tx:', hash);
      return hash;
    } catch (err: any) {
      console.error('Error matching bet:', err);
      setError(err.message || 'Failed to match bet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    matchBet,
    isLoading,
    error,
  };
}