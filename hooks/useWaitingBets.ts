import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACTS, BET_ON_BASE_ABI, Prediction } from '@/lib/contracts';

interface WaitingBet {
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
}

export function useWaitingBets(matchId: number) {
  // Get waiting bets for all predictions
  const { data: homeBets, isLoading: loadingHome, refetch: refetchHome } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'getWaitingBets',
    args: [BigInt(matchId), Prediction.HOME],
  });

  const { data: awayBets, isLoading: loadingAway, refetch: refetchAway } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'getWaitingBets',
    args: [BigInt(matchId), Prediction.AWAY],
  });

  const { data: drawBets, isLoading: loadingDraw, refetch: refetchDraw } = useReadContract({
    address: CONTRACTS.BetOnBase,
    abi: BET_ON_BASE_ABI,
    functionName: 'getWaitingBets',
    args: [BigInt(matchId), Prediction.DRAW],
  });

  // Combine all bet IDs
  const allBetIds: bigint[] = [
    ...(Array.isArray(homeBets) ? homeBets : []),
    ...(Array.isArray(awayBets) ? awayBets : []),
    ...(Array.isArray(drawBets) ? drawBets : []),
  ];

  console.log('Waiting bets for match', matchId, ':', {
    home: homeBets,
    away: awayBets,
    draw: drawBets,
    total: allBetIds.length
  });

  // Fetch real details for each bet
  const { data: betDetailsData, isLoading: loadingDetails, refetch: refetchDetails } = useReadContracts({
    contracts: allBetIds.map(betId => ({
      address: CONTRACTS.BetOnBase,
      abi: BET_ON_BASE_ABI,
      functionName: 'bets',
      args: [betId],
    })),
  });

  const isLoading = loadingHome || loadingAway || loadingDraw || loadingDetails;

  // Refetch function to refresh all data
  const refetch = () => {
    refetchHome();
    refetchAway();
    refetchDraw();
    refetchDetails();
  };

  // If no bets found
  if (allBetIds.length === 0) {
    return {
      bets: [],
      isLoading,
      refetch,
    };
  }

  if (!betDetailsData) {
    return {
      bets: [],
      isLoading,
      refetch,
    };
  }

  // Map bet details to proper format
  const bets: WaitingBet[] = allBetIds
    .map((betId, index) => {
      const betDetail = betDetailsData[index];
      
      // Skip if bet detail failed to load
      if (betDetail.status !== 'success' || !betDetail.result) {
        console.log('Failed to load bet', betId);
        return null;
      }

      const result = betDetail.result as any;

      console.log('Bet', betId.toString(), 'details:', result);

      // Map based on the struct order from your contract
      // Bet struct: betId, matchId, bettor, prediction, stake, tokenType, allowDraw, status, matchedBetId, createdAt
      return {
        betId: result[0] || betId, // betId
        matchId: result[1] || BigInt(matchId), // matchId
        bettor: result[2] || '0x0000000000000000000000000000000000000000', // bettor
        prediction: Number(result[3] || 0), // prediction
        stake: result[4] || BigInt(0), // stake
        tokenType: Number(result[5] || 0), // tokenType
        allowDraw: Boolean(result[6]), // allowDraw
        status: Number(result[7] || 0), // status
        matchedBetId: result[8] || BigInt(0), // matchedBetId
        createdAt: result[9] || BigInt(0), // createdAt
      };
    })
    .filter((bet): bet is WaitingBet => {
      // Only show waiting bets (status === 0)
      return bet !== null && bet.status === 0;
    });

  console.log('Processed waiting bets:', bets);

  return {
    bets,
    isLoading,
    refetch,
  };
}