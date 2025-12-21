import { useState } from 'react';
import { useWriteContract, useAccount, useReadContract } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, ERC20_ABI, Prediction, TOKEN_INFO } from '@/lib/contracts';

interface MatchBetParams {
  betId: bigint;
  targetBetStake: bigint; // ✅ NEW: We need the waiting bet's stake
  allowDraw: boolean;
  prediction: Prediction;
}

export function useMatchBet() {
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const { writeContractAsync, isPending: isMatching } = useWriteContract();
  const { address } = useAccount();

  const isLoading = isApproving || isMatching;

  const matchBet = async ({ betId, targetBetStake, allowDraw, prediction }: MatchBetParams) => {
    try {
      setError(null);

      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Validate prediction
      if (prediction !== Prediction.HOME && prediction !== Prediction.AWAY && prediction !== Prediction.DRAW) {
        throw new Error('Invalid prediction');
      }

      console.log('🔍 Checking token allowance...');
      
      // ✅ STEP 1: Check current allowance
      let currentAllowance = BigInt(0);
      
      try {
        const allowanceData = await fetch(
          `https://sepolia.basescan.org/api?module=contract&action=eth_call&to=${TOKEN_INFO.address}&data=0xdd62ed3e${address.slice(2).padStart(64, '0')}${CONTRACTS.BetOnBase.slice(2).padStart(64, '0')}`
        ).then(r => r.json());
        
        if (allowanceData.result) {
          currentAllowance = BigInt(allowanceData.result);
        }
      } catch (e) {
        console.log('Allowance check failed, assuming 0');
      }

      console.log('Current allowance:', currentAllowance.toString(), 'ZKL');
      console.log('Required stake:', targetBetStake.toString(), 'ZKL');

      // ✅ STEP 2: Approve tokens if needed (MUST match waiting bet's stake)
      if (currentAllowance < targetBetStake) {
        console.log('⚠️ Insufficient allowance, requesting approval...');
        setIsApproving(true);
        
        try {
          const approveHash = await writeContractAsync({
            address: TOKEN_INFO.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [CONTRACTS.BetOnBase, targetBetStake], // ✅ Approve exact stake amount
          });

          console.log('📝 Approval transaction sent:', approveHash);
          console.log('⏳ Waiting for approval confirmation...');

          // Wait for approval
          let attempts = 0;
          const maxAttempts = 30;
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
              const receipt = await window.ethereum?.request({
                method: 'eth_getTransactionReceipt',
                params: [approveHash]
              });
              
              if (receipt) {
                if (receipt.status === '0x1') {
                  console.log('✅ Approval confirmed!');
                  break;
                } else if (receipt.status === '0x0') {
                  throw new Error('Approval transaction failed');
                }
              }
            } catch (e) {
              // Continue polling
            }
            
            attempts++;
          }
          
          if (attempts >= maxAttempts) {
            throw new Error('Approval timeout - please try again');
          }

          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (approveErr: any) {
          setIsApproving(false);
          console.error('Approval error:', approveErr);
          
          if (approveErr.message?.includes('user rejected')) {
            throw new Error('Approval cancelled by user');
          }
          throw new Error('Token approval failed: ' + approveErr.message);
        }
        
        setIsApproving(false);
      } else {
        console.log('✅ Sufficient allowance already granted');
      }

      // ✅ STEP 3: Match the bet
      console.log('🎲 Matching bet...');
      
      const HIDDEN_FEE = BigInt('1000000000000000'); // 0.001 ETH

      // ✅ Contract automatically uses targetBet's stake, we just pass betId
      const hash = await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'matchBet',
        args: [
          betId,           // Target bet ID
          allowDraw,       // Our draw preference
          prediction,      // Our prediction
        ],
        value: HIDDEN_FEE, // Hidden fee in ETH
      });

      console.log('✅ Bet matched successfully! Transaction:', hash);
      return hash;
      
    } catch (err: any) {
      console.error('❌ Match bet error:', err);
      
      let errorMessage = 'Failed to match bet';
      
      if (err.message?.includes('user rejected') || err.message?.includes('cancelled')) {
        errorMessage = 'Transaction cancelled';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      } else if (err.message?.includes('approval')) {
        errorMessage = 'Token approval failed - please try again';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    }
  };

  return {
    matchBet,
    isLoading,
    isApproving,
    error,
  };
}
