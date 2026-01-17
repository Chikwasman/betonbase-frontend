import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, ERC20_ABI, Prediction, TOKEN_INFO } from '@/lib/contracts';

interface CreateBetParams {
  matchId: number;
  prediction: Prediction;
  stake: bigint;
  allowDraw: boolean;
  targetBettor: `0x${string}`;
}

export function useCreateBet() {
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const { writeContractAsync, isPending: isCreatingBet } = useWriteContract();
  const { address } = useAccount();

  const isLoading = isApproving || isCreatingBet;

  const createBet = async ({
    matchId,
    prediction,
    stake,
    allowDraw,
    targetBettor,
  }: CreateBetParams) => {
    try {
      setError(null);

      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Validation
      if (!stake || stake <= BigInt(0)) {
        throw new Error('Invalid stake amount');
      }

      if (prediction === Prediction.DRAW && !allowDraw) {
        throw new Error('Must allow draw to predict DRAW');
      }

      if (targetBettor !== '0x0000000000000000000000000000000000000000') {
        if (!/^0x[a-fA-F0-9]{40}$/.test(targetBettor)) {
          throw new Error('Invalid target bettor address');
        }
      }

      console.log('🔍 Checking token allowance...');
      
      // ✅ STEP 1: Check current allowance using a direct call
      let currentAllowance = BigInt(0);
      
      try {
        // Query allowance directly from the contract
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
      console.log('Required stake:', stake.toString(), 'ZKL');

      // ✅ STEP 2: Approve tokens if needed
      if (currentAllowance < stake) {
        console.log('⚠️ Insufficient allowance, requesting approval...');
        setIsApproving(true);
        
        try {
          // Request approval for the exact stake amount (or unlimited)
          const approveAmount = stake; // Or use: ethers.MaxUint256 for unlimited
          
          const approveHash = await writeContractAsync({
            address: TOKEN_INFO.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [CONTRACTS.BetOnBase, approveAmount],
          });

          console.log('📝 Approval transaction sent:', approveHash);
          console.log('⏳ Waiting for approval confirmation...');

          // Wait for approval transaction to be mined (simple polling)
          let attempts = 0;
          const maxAttempts = 30; // 30 seconds timeout
          
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

          // Extra delay to ensure blockchain state is updated
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

      // ✅ STEP 3: Create the bet
      console.log('🎲 Creating bet...');
      
      // ✅ FIX M-1: Renamed from HIDDEN_FEE to PLATFORM_GAS_FEE with documentation
      /**
       * Platform gas fee: 0.0001 ETH
       * This fee covers oracle gas costs for match settlement
       */
      const PLATFORM_GAS_FEE = BigInt('100000000000000'); // 0.0001 ETH
      
      const hash = await writeContractAsync({
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'createBet',
        args: [
          BigInt(matchId),
          prediction,
          stake,
          allowDraw,
          targetBettor,
        ],
        value: PLATFORM_GAS_FEE, // Platform gas fee for oracle operations
      });

      console.log('✅ Bet created successfully! Transaction:', hash);
      return hash;
      
    } catch (err: any) {
      console.error('❌ Create bet error:', err);
      
      // User-friendly error messages
      let errorMessage = 'Failed to create bet';
      
      if (err.message?.includes('user rejected') || err.message?.includes('cancelled')) {
        errorMessage = 'Transaction cancelled';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      } else if (err.message?.includes('approval')) {
        errorMessage = 'Token approval failed - please try again';
      } else if (err.message?.includes('Match not found')) {
        errorMessage = 'Match not available for betting';
      } else if (err.message?.includes('Betting closed')) {
        errorMessage = 'Betting is closed for this match';
      } else if (err.message?.includes('Must send 0.0001 ETH platform gas fee')) {
        errorMessage = 'Please ensure you have 0.0001 ETH for the platform gas fee';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    }
  };

  return {
    createBet,
    isLoading,
    isApproving,
    error,
  };
}