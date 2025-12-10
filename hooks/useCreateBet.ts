import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, ERC20_ABI, Prediction, TokenType, TOKEN_INFO } from '@/lib/contracts';

interface CreateBetParams {
  matchId: number;
  prediction: Prediction;
  tokenType: TokenType;
  stake: bigint;
  allowDraw: boolean;
}

export function useCreateBet() {
  const [error, setError] = useState<string | null>(null);
  
  const { writeContractAsync } = useWriteContract();

  // Read hidden fee
  const { data: hiddenFee } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'HIDDEN_FEE',
  });

  const createBet = async ({ matchId, prediction, tokenType, stake, allowDraw }: CreateBetParams) => {
    try {
      setError(null);

      // If DRAW prediction, must allow draw
      if (prediction === Prediction.DRAW && !allowDraw) {
        throw new Error('Must allow draw when predicting draw');
      }

      // If using ERC20, approve first
      if (tokenType !== TokenType.ETH) {
        const tokenAddress = TOKEN_INFO[tokenType].address;
        if (!tokenAddress) throw new Error('Invalid token');

        console.log('Approving token...');
        
        // Approve token spending
        const approveTx = await writeContractAsync({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACTS.BetOnBase, stake],
        });

        console.log('Approval tx:', approveTx);
      }

      // Create the bet
      const feeValue = (hiddenFee || BigInt(0)) as bigint;
      const totalValue = tokenType === TokenType.ETH ? (stake as bigint) + feeValue : feeValue;

      console.log('Creating bet with params:', {
        matchId: BigInt(matchId),
        prediction,
        tokenType,
        stake: stake.toString(),
        allowDraw,
        totalValue: totalValue.toString(),
      });

      const hash = await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'createBet',
        args: [BigInt(matchId), prediction, tokenType, stake, allowDraw],
        value: totalValue,
      });

      console.log('Bet creation tx:', hash);
      return hash;
    } catch (err: any) {
      console.error('Error creating bet:', err);
      const errorMessage = err?.message || err?.shortMessage || 'Failed to create bet';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    createBet,
    isLoading: false, // Can add loading state
    error,
  };
}