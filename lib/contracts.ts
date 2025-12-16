export const CONTRACTS = {
  BetOnBase: '0x9bFb402c02A1d349aeDc2F6A59ab9f8f801C2978' as `0x${string}`,
  // Base Sepolia USDC (official Circle USDC)
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
  // Your Mock ZKLegend token
  MockZklegend: '0xa2dB0032d45770E864f3010892AA5622846bb71d' as `0x${string}`,
  // Price feeds
  ETHUSDPriceFeed: '0x4e95747B9607e231b91e968C78Ae46934ecccC7d' as `0x${string}`,
  ZKLUSDPriceFeed: '0xa92abf6469f87E7A07e95607d6fC1906E7EDDD11' as `0x${string}`,
} as const;

export const BET_ON_BASE_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "betId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "matchId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "bettor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum BetOnBase.Prediction",
        "name": "prediction",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "stake",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum BetOnBase.TokenType",
        "name": "tokenType",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "allowDraw",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "targetBettor",
        "type": "address"
      }
    ],
    "name": "BetCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "betId1",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "betId2",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "matchId",
        "type": "uint256"
      }
    ],
    "name": "BetMatched",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "betId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "bettor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "BetRefunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "betId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "winnings",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      }
    ],
    "name": "BetSettled",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "HIDDEN_FEE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_STAKE_USD",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_STAKE_USD",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WINNER_FEE_BP",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "bets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "betId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "matchId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "bettor",
        "type": "address"
      },
      {
        "internalType": "enum BetOnBase.Prediction",
        "name": "prediction",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "stake",
        "type": "uint256"
      },
      {
        "internalType": "enum BetOnBase.TokenType",
        "name": "tokenType",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "allowDraw",
        "type": "bool"
      },
      {
        "internalType": "enum BetOnBase.BetStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "matchedBetId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "targetBettor",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_betId",
        "type": "uint256"
      }
    ],
    "name": "canRefundDraw",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_betId",
        "type": "uint256"
      }
    ],
    "name": "canWithdrawWinnings",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_matchId",
        "type": "uint256"
      },
      {
        "internalType": "enum BetOnBase.Prediction",
        "name": "_prediction",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_stake",
        "type": "uint256"
      },
      {
        "internalType": "enum BetOnBase.TokenType",
        "name": "_tokenType",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "_allowDraw",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "_targetBettor",
        "type": "address"
      }
    ],
    "name": "createBet",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeCollector",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_matchId",
        "type": "uint256"
      }
    ],
    "name": "getMatchBets",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum BetOnBase.TokenType",
        "name": "_tokenType",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_stake",
        "type": "uint256"
      }
    ],
    "name": "getStakeInUsd",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_matchId",
        "type": "uint256"
      },
      {
        "internalType": "enum BetOnBase.Prediction",
        "name": "_prediction",
        "type": "uint8"
      }
    ],
    "name": "getWaitingBets",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_targetBetId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_allowDraw",
        "type": "bool"
      }
    ],
    "name": "matchBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "matches",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "apiMatchId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "kickoffTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "bettingClosed",
        "type": "bool"
      },
      {
        "internalType": "enum BetOnBase.MatchResult",
        "name": "result",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "settled",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextBetId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "oracle",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_betId",
        "type": "uint256"
      }
    ],
    "name": "refundCancelled",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_betId",
        "type": "uint256"
      }
    ],
    "name": "refundDraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_betId",
        "type": "uint256"
      }
    ],
    "name": "withdrawUnmatched",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_betId",
        "type": "uint256"
      }
    ],
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
    address: CONTRACTS.USDC,
  },
  [TokenType.ZKLEGEND]: {
    symbol: 'ZKL',
    name: 'ZKLegend Token',
    decimals: 18,
    address: CONTRACTS.MockZklegend,
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