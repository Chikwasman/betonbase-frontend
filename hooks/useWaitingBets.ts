import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction } from '@/lib/contracts';

interface WaitingBet {
  betId: bigint;
  matchId: bigint;
  bettor: string;
  prediction: number;
  stake: bigint;
  allowDraw: boolean;
  targetBettor: string;
  createdAt: bigint;
}

export function useWaitingBets(matchId: number) {
  // Fetch waiting bets for all three predictions
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'getWaitingBets',
        args: [BigInt(matchId), Prediction.HOME],
      },
      {
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'getWaitingBets',
        args: [BigInt(matchId), Prediction.AWAY],
      },
      {
        address: CONTRACTS.BetOnBase,
        abi: BET_ON_BASE_ABI,
        functionName: 'getWaitingBets',
        args: [BigInt(matchId), Prediction.DRAW],
      },
    ],
  });

  // Extract bet IDs
  const betIds = useMemo(() => {
    const ids: bigint[] = [];
    if (data) {
      data.forEach((result) => {
        if (result.status === 'success' && Array.isArray(result.result)) {
          ids.push(...result.result);
        }
      });
    }
    return ids;
  }, [data]);

  // Fetch full bet details for each bet ID
  const betDetailsQueries = useMemo(() => {
    return betIds.map(betId => ({
      address: CONTRACTS.BetOnBase,
      abi: BET_ON_BASE_ABI,
      functionName: 'bets',
      args: [betId],
    }));
  }, [betIds]);

  const { data: betDetailsData, isLoading: loadingDetails } = useReadContracts({
    contracts: betDetailsQueries,
    query: {
      enabled: betIds.length > 0,
    }
  });

  // Process bet details
  const bets: WaitingBet[] = useMemo(() => {
    if (!betDetailsData) return [];

    return betIds
      .map((betId, index) => {
        const betDetail = betDetailsData[index];
        if (betDetail?.status === 'success' && betDetail.result) {
          const result = betDetail.result as any;
          
          // ✅ UPDATED: Correct array indices (no tokenType)
          return {
            betId,
            matchId: result[1],
            bettor: result[2],
            prediction: Number(result[3]),
            stake: result[4],
            allowDraw: result[5],      // ✅ Index 5 (was 6)
            targetBettor: result[9],   // ✅ Index 9 (was 10)
            createdAt: result[8],      // ✅ Index 8 (was 9)
          };
        }
        return null;
      })
      .filter((bet): bet is WaitingBet => bet !== null);
  }, [betIds, betDetailsData]);

  return {
    bets,
    isLoading: isLoading || loadingDetails,
    refetch,
  };
}
