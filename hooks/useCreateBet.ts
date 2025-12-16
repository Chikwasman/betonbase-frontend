import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction, TokenType } from '@/lib/contracts';

interface CreateBetParams {
  matchId: number;
  prediction: Prediction;
  tokenType: TokenType;
  stake: bigint;
  allowDraw: boolean;
  targetBettor: `0x${string}`;  // NEW: 0x0 for public, address for private
}

export function useCreateBet() {
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync, isPending: isLoading } = useWriteContract();

  const createBet = async ({
    matchId,
    prediction,
    tokenType,
    stake,
    allowDraw,
    targetBettor,  // NEW parameter
  }: CreateBetParams) => {
    try {
      setError(null);

      // Validation
      if (!stake || stake <= BigInt(0)) {
        throw new Error('Invalid stake amount');
      }

      if (prediction === Prediction.DRAW && !allowDraw) {
        throw new Error('Must allow draw to predict DRAW');
      }

      if (targetBettor !== '0x0000000000000000000000000000000000000000') {
        // Validate target address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(targetBettor)) {
          throw new Error('Invalid target bettor address');
        }
      }

      // Calculate value to send
      const HIDDEN_FEE = BigInt('1000000000000000'); // 0.001 ETH
      let value = HIDDEN_FEE;

      if (tokenType === TokenType.ETH) {
        value = stake + HIDDEN_FEE;
      }

      // Call contract
      const hash = await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'createBet',
        args: [
          BigInt(matchId),
          prediction,
          stake,
          tokenType,
          allowDraw,
          targetBettor,  // NEW: Pass targetBettor
        ],
        value,
      });

      return hash;
    } catch (err: any) {
      console.error('Create bet error:', err);
      setError(err.message || 'Failed to create bet');
      throw err;
    }
  };

  return {
    createBet,
    isLoading,
    error,
  };
}
