export const CONTRACTS = {
  BetOnBase: '0xF75dD9a3101040B99FA61708CF1A8038Cce048b5' as `0x${string}`,
  // Base Sepolia USDC (official Circle USDC)
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
  // Your Mock ZKLegend token
  MockZklegend: '0xa2dB0032d45770E864f3010892AA5622846bb71d' as `0x${string}`,
  // Price feeds
  ETHUSDPriceFeed: '0x4e95747B9607e231b91e968C78Ae46934ecccC7d' as `0x${string}`,
  ZKLUSDPriceFeed: '0xa92abf6469f87E7A07e95607d6fC1906E7EDDD11' as `0x${string}`,
} as const;

export const BET_ON_BASE_ABI = [
  // Read functions
  {
    name: 'matches',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'matchId', type: 'uint256' }],
    outputs: [
      { name: 'apiMatchId', type: 'uint256' },
      { name: 'kickoffTime', type: 'uint256' },
      { name: 'bettingClosed', type: 'bool' },
      { name: 'result', type: 'uint8' },
      { name: 'settled', type: 'bool' }
    ]
  },
  {
    name: 'bets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'betId', type: 'uint256' }],
    outputs: [
      { name: 'betId', type: 'uint256' },
      { name: 'matchId', type: 'uint256' },
      { name: 'bettor', type: 'address' },
      { name: 'prediction', type: 'uint8' },
      { name: 'stake', type: 'uint256' },
      { name: 'tokenType', type: 'uint8' },
      { name: 'allowDraw', type: 'bool' },
      { name: 'status', type: 'uint8' },
      { name: 'matchedBetId', type: 'uint256' },
      { name: 'createdAt', type: 'uint256' }
    ]
  },
  {
    name: 'getWaitingBets',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'matchId', type: 'uint256' },
      { name: 'prediction', type: 'uint8' }
    ],
    outputs: [{ name: '', type: 'uint256[]' }]
  },
  {
    name: 'getMatchBets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'matchId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256[]' }]
  },
  {
    name: 'canWithdrawWinnings',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'betId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'canRefundDraw',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'betId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'getStakeInUsd',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenType', type: 'uint8' },
      { name: 'stake', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'nextBetId',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'HIDDEN_FEE',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'WINNER_FEE_BP',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'MIN_STAKE_USD',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'MAX_STAKE_USD',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  
  // Write functions
  {
    name: 'createBet',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'matchId', type: 'uint256' },
      { name: 'prediction', type: 'uint8' },
      { name: 'tokenType', type: 'uint8' },
      { name: 'stake', type: 'uint256' },
      { name: 'allowDraw', type: 'bool' }
    ],
    outputs: []
  },
  {
    name: 'matchBet',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'targetBetId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'withdrawWinnings',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'betId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'withdrawUnmatched',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'betId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'refundDraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'betId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'refundCancelled',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'betId', type: 'uint256' }],
    outputs: []
  },
  
  // Events
  {
    name: 'BetCreated',
    type: 'event',
    inputs: [
      { name: 'betId', type: 'uint256', indexed: true },
      { name: 'matchId', type: 'uint256', indexed: true },
      { name: 'bettor', type: 'address', indexed: true },
      { name: 'prediction', type: 'uint8', indexed: false },
      { name: 'stake', type: 'uint256', indexed: false },
      { name: 'tokenType', type: 'uint8', indexed: false },
      { name: 'allowDraw', type: 'bool', indexed: false }
    ]
  },
  {
    name: 'BetMatched',
    type: 'event',
    inputs: [
      { name: 'betId1', type: 'uint256', indexed: true },
      { name: 'betId2', type: 'uint256', indexed: true },
      { name: 'matchId', type: 'uint256', indexed: true }
    ]
  },
  {
    name: 'BetSettled',
    type: 'event',
    inputs: [
      { name: 'betId', type: 'uint256', indexed: true },
      { name: 'winner', type: 'address', indexed: true },
      { name: 'winnings', type: 'uint256', indexed: false },
      { name: 'fee', type: 'uint256', indexed: false }
    ]
  },
  {
    name: 'BetRefunded',
    type: 'event',
    inputs: [
      { name: 'betId', type: 'uint256', indexed: true },
      { name: 'bettor', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false }
    ]
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

export enum Prediction {
  HOME = 0,
  AWAY = 1,
  DRAW = 2,
}

export enum TokenType {
  ETH = 0,
  USDC = 1,
  ZKLEGEND = 2,
}

export enum BetStatus {
  WAITING = 0,
  MATCHED = 1,
  SETTLED = 2,
  CANCELLED = 3,
  REFUNDED = 4,
}

export enum MatchResult {
  PENDING = 0,
  HOME_WIN = 1,
  AWAY_WIN = 2,
  DRAW = 3,
  CANCELLED = 4,
}

export const TOKEN_INFO = {
  [TokenType.ETH]: {
    symbol: 'ETH',
    name: 'Sepolia ETH',
    decimals: 18,
    address: null, // Native ETH doesn't need address
  },
  [TokenType.USDC]: {
    symbol: 'USDC',
    name: 'USD Coin (Sepolia)',
    decimals: 6,
    address: CONTRACTS.USDC, // Real Base Sepolia USDC
  },
  [TokenType.ZKLEGEND]: {
    symbol: 'ZKL',
    name: 'ZKLegend Token',
    decimals: 18,
    address: CONTRACTS.MockZklegend, // Your mock token
  },
} as const;

export const LEAGUES = {
  EPL: { id: 39, name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  LA_LIGA: { id: 140, name: 'La Liga', flag: '🇪🇸' },
  SERIE_A: { id: 135, name: 'Serie A', flag: '🇮🇹' },
  BUNDESLIGA: { id: 78, name: 'Bundesliga', flag: '🇩🇪' },
  CHAMPIONS: { id: 2, name: 'Champions League', flag: '🏆' },
  EUROPA: { id: 3, name: 'Europa League', flag: '⚽' },
} as const;