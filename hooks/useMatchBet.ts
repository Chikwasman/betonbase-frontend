import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, TokenType } from '@/lib/contracts';

export function useMatchBet() {
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync, isPending: isLoading } = useWriteContract();

  const matchBet = async (betId: bigint, allowDraw: boolean) => {  // NEW: allowDraw parameter
    try {
      setError(null);

      // For now, we'll use the simplest approach:
      // User sends ETH to match ETH bets, or ERC20 for ERC20 bets
      // The contract will handle stake validation
      
      const HIDDEN_FEE = BigInt('1000000000000000'); // 0.001 ETH

      // Call contract
      const hash = await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'matchBet',
        args: [
          betId,
          allowDraw,  // NEW: Pass allowDraw parameter
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
