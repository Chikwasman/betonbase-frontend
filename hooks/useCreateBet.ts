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
  const [isLoading, setIsLoading] = useState(false);
  
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
      setIsLoading(true);

      // If DRAW prediction, must allow draw
      if (prediction === Prediction.DRAW && !allowDraw) {
        throw new Error('Must allow draw when predicting draw');
      }

      // If using ERC20, approve first and WAIT for confirmation
      if (tokenType !== TokenType.ETH) {
        const tokenAddress = TOKEN_INFO[tokenType].address;
        if (!tokenAddress) throw new Error('Invalid token');

        console.log('📝 Approving token...');
        
        // Approve token spending
        const approveTxHash = await writeContractAsync({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACTS.BetOnBase, stake],
        });

        console.log('✅ Approval tx sent:', approveTxHash);
        console.log('⏳ Waiting for approval to be mined...');

        // CRITICAL FIX: Wait for approval to be confirmed
        // This prevents the race condition on faster connections
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds for block confirmation

        console.log('✅ Approval confirmed, proceeding with bet...');
      }

      // Create the bet
      const feeValue = (hiddenFee || BigInt(1000000000000000)) as bigint; // Default 0.001 ETH
      const totalValue = tokenType === TokenType.ETH ? (stake as bigint) + feeValue : feeValue;

      console.log('📝 Creating bet with params:', {
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

      console.log('✅ Bet created successfully! Transaction:', hash);
      
      setIsLoading(false);
      return hash;
    } catch (err: any) {
      console.error('❌ Error creating bet:', err);
      
      // Only set error if it's a real error (not just revert after success)
      if (!err?.message?.includes('Bet creation tx:')) {
        const errorMessage = err?.message || err?.shortMessage || 'Failed to create bet';
        setError(errorMessage);
      }
      
      setIsLoading(false);
      throw err;
    }
  };

  return {
    createBet,
    isLoading,
    error,
  };
}