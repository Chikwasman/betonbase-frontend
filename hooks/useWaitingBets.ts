import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction } from '@/lib/contracts';

export interface WaitingBet {
  betId: bigint;
  matchId: bigint;
  bettor: `0x${string}`;
  prediction: number;
  stake: bigint;
  tokenType: number;
  allowDraw: boolean;
  status: number;
  matchedBetId: bigint;
  createdAt: bigint;
  targetBettor?: `0x${string}`;  // ✅ Added this field
  usdValue?: bigint;
}

export function useWaitingBets(matchId: number) {
  // Get waiting bets for all predictions
  const { data: homeBets, isLoading: loadingHome } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'getWaitingBets',
    args: [BigInt(matchId), Prediction.HOME],
  });

  const { data: awayBets, isLoading: loadingAway } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'getWaitingBets',
    args: [BigInt(matchId), Prediction.AWAY],
  });

  const { data: drawBets, isLoading: loadingDraw } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'getWaitingBets',
    args: [BigInt(matchId), Prediction.DRAW],
  });

  // Combine all bet IDs
  const allBetIds = [
    ...(homeBets as bigint[] || []),
    ...(awayBets as bigint[] || []),
    ...(drawBets as bigint[] || []),
  ];

  // Fetch bet details for all waiting bets
  const { data: betsData, isLoading: loadingBets } = useReadContracts({
    contracts: allBetIds.map(betId => ({
      address: CONTRACTS.BetOnBase,
      abi: BET_ON_BASE_ABI,
      functionName: 'bets',
      args: [betId],
    })),
    query: {
      enabled: allBetIds.length > 0,
    }
  });

  // Process bet data
  const bets: WaitingBet[] = [];
  
  if (betsData) {
    allBetIds.forEach((betId, index) => {
      const betData = betsData[index];
      if (betData?.status === 'success' && betData.result) {
        const result = betData.result as any;
        bets.push({
          betId,
          matchId: result[1],
          bettor: result[2],
          prediction: Number(result[3]),
          stake: result[4],
          tokenType: Number(result[5]),
          allowDraw: result[6],
          status: Number(result[7]),
          matchedBetId: result[8],
          createdAt: result[9],
          targetBettor: result[10], // ✅ Now includes targetBettor from contract
        });
      }
    });
  }

  const isLoading = loadingHome || loadingAway || loadingDraw || loadingBets;

  return {
    bets: bets.length > 0 ? bets : null,
    isLoading,
  };
}