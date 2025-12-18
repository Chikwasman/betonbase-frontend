export const CONTRACTS = {
  // ✅ UPDATE THIS with your new deployed contract address
  BetOnBase: '0x27D3Cf35De2a54Baf2A97ED025f20B9aAb802A49' as `0x${string}`,
  
  // ✅ UPDATE THIS with your new ZKL token address (from deployment)
  MockZklegend: '0xD5626a35aC7E4Bf2B664fb9Ab4b93C07C2F4Eb81' as `0x${string}`,
  
  // ❌ REMOVED: USDC, ETHUSDPriceFeed, ZKLUSDPriceFeed (not needed in simplified version)
} as const;

// ✅ NEW SIMPLIFIED ABI - Single token system, DRAW matching support
export const BET_ON_BASE_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_feeCollector", "type": "address" },
      { "internalType": "address", "name": "_oracle", "type": "address" },
      { "internalType": "address", "name": "_bettingToken", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "address", "name": "token", "type": "address" }],
    "name": "SafeERC20FailedOperation",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "betId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "bettor", "type": "address" },
      { "indexed": false, "internalType": "enum BetOnBase.Prediction", "name": "prediction", "type": "uint8" },
      { "indexed": false, "internalType": "uint256", "name": "stake", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "allowDraw", "type": "bool" },
      { "indexed": false, "internalType": "address", "name": "targetBettor", "type": "address" }
    ],
    "name": "BetCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "betId1", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "betId2", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256" }
    ],
    "name": "BetMatched",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "betId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "bettor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "BetRefunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "betId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "winner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "payout", "type": "uint256" }
    ],
    "name": "BetSettled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "apiMatchId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "kickoffTime", "type": "uint256" }
    ],
    "name": "MatchAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "apiMatchId", "type": "uint256" },
      { "indexed": false, "internalType": "enum BetOnBase.MatchResult", "name": "result", "type": "uint8" }
    ],
    "name": "MatchResultSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BETTING_CUTOFF",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "HIDDEN_FEE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "REFUND_DELAY",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WINNER_FEE_BP",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_apiMatchId", "type": "uint256" },
      { "internalType": "uint256", "name": "_kickoffTime", "type": "uint256" }
    ],
    "name": "addMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "bets",
    "outputs": [
      { "internalType": "uint256", "name": "betId", "type": "uint256" },
      { "internalType": "uint256", "name": "matchId", "type": "uint256" },
      { "internalType": "address", "name": "bettor", "type": "address" },
      { "internalType": "enum BetOnBase.Prediction", "name": "prediction", "type": "uint8" },
      { "internalType": "uint256", "name": "stake", "type": "uint256" },
      { "internalType": "bool", "name": "allowDraw", "type": "bool" },
      { "internalType": "enum BetOnBase.BetStatus", "name": "status", "type": "uint8" },
      { "internalType": "uint256", "name": "matchedBetId", "type": "uint256" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "address", "name": "targetBettor", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bettingToken",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_betId", "type": "uint256" }],
    "name": "canRefundDraw",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_betId", "type": "uint256" }],
    "name": "canWithdrawWinnings",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_apiMatchId", "type": "uint256" }],
    "name": "closeBetting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_matchId", "type": "uint256" },
      { "internalType": "enum BetOnBase.Prediction", "name": "_prediction", "type": "uint8" },
      { "internalType": "uint256", "name": "_stake", "type": "uint256" },
      { "internalType": "bool", "name": "_allowDraw", "type": "bool" },
      { "internalType": "address", "name": "_targetBettor", "type": "address" }
    ],
    "name": "createBet",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeCollector",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_matchId", "type": "uint256" }],
    "name": "getMatchBets",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_matchId", "type": "uint256" },
      { "internalType": "enum BetOnBase.Prediction", "name": "_prediction", "type": "uint8" }
    ],
    "name": "getWaitingBets",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_targetBetId", "type": "uint256" },
      { "internalType": "bool", "name": "_allowDraw", "type": "bool" },
      { "internalType": "enum BetOnBase.Prediction", "name": "_matchingPrediction", "type": "uint8" }
    ],
    "name": "matchBet",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "matches",
    "outputs": [
      { "internalType": "uint256", "name": "apiMatchId", "type": "uint256" },
      { "internalType": "uint256", "name": "kickoffTime", "type": "uint256" },
      { "internalType": "bool", "name": "bettingClosed", "type": "bool" },
      { "internalType": "enum BetOnBase.MatchResult", "name": "result", "type": "uint8" },
      { "internalType": "bool", "name": "settled", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxStake",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minStake",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextBetId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "oracle",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_betId", "type": "uint256" }],
    "name": "refundCancelled",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_betId", "type": "uint256" }],
    "name": "refundDraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_bettingToken", "type": "address" }],
    "name": "setBettingToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_feeCollector", "type": "address" }],
    "name": "setFeeCollector",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_apiMatchId", "type": "uint256" },
      { "internalType": "enum BetOnBase.MatchResult", "name": "_result", "type": "uint8" }
    ],
    "name": "setMatchResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_oracle", "type": "address" }],
    "name": "setOracle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_minStake", "type": "uint256" },
      { "internalType": "uint256", "name": "_maxStake", "type": "uint256" }
    ],
    "name": "setStakeLimits",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_betId", "type": "uint256" }],
    "name": "withdrawUnmatched",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_betId", "type": "uint256" }],
    "name": "withdrawWinnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }]
  }
] as const;

// ✅ Prediction enum (unchanged)
export enum Prediction {
  HOME = 0,
  AWAY = 1,
  DRAW = 2,
}

// ❌ REMOVED: TokenType enum (single token system now)

// ✅ BetStatus enum (unchanged)
export enum BetStatus {
  WAITING = 0,
  MATCHED = 1,
  SETTLED = 2,
  CANCELLED = 3,
  REFUNDED = 4,
}

// ✅ MatchResult enum (unchanged)
export enum MatchResult {
  PENDING = 0,
  HOME_WIN = 1,
  AWAY_WIN = 2,
  DRAW = 3,
  CANCELLED = 4,
}

// ✅ NEW: Single token info (ZKL only on testnet)
export const TOKEN_INFO = {
  symbol: 'ZKL',
  name: 'ZKLegend Token',
  decimals: 18,
  address: CONTRACTS.MockZklegend,
} as const;

// ✅ Leagues (unchanged)
export const LEAGUES = {
  EPL: { id: 39, name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  LA_LIGA: { id: 140, name: 'La Liga', flag: '🇪🇸' },
  SERIE_A: { id: 135, name: 'Serie A', flag: '🇮🇹' },
  BUNDESLIGA: { id: 78, name: 'Bundesliga', flag: '🇩🇪' },
  CHAMPIONS: { id: 2, name: 'Champions League', flag: '🏆' },
  EUROPA: { id: 3, name: 'Europa League', flag: '⚽' },
} as const;

// ✅ Helper function to format stake
export function formatStake(stake: bigint): string {
  return (Number(stake) / 1e18).toFixed(2);
}

// ✅ Helper function to get prediction label
export function getPredictionLabel(prediction: Prediction): string {
  switch (prediction) {
    case Prediction.HOME:
      return 'Home Win';
    case Prediction.AWAY:
      return 'Away Win';
    case Prediction.DRAW:
      return 'Draw';
    default:
      return 'Unknown';
  }
}