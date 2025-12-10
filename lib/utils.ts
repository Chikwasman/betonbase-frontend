import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatStake(stake: bigint, decimals: number): string {
  return parseFloat(formatUnits(stake, decimals)).toFixed(decimals === 6 ? 2 : 4);
}

export function formatUSD(usdValue: bigint): string {
  const value = parseFloat(formatUnits(usdValue, 8));
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatTimeRemaining(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now;

  if (diff <= 0) return 'Started';

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getPredictionLabel(prediction: number): string {
  const labels = ['HOME', 'AWAY', 'DRAW'];
  return labels[prediction] || 'UNKNOWN';
}

export function getStatusLabel(status: number): string {
  const labels = ['Waiting', 'Matched', 'Settled', 'Cancelled', 'Refunded'];
  return labels[status] || 'Unknown';
}

export function getStatusColor(status: number): string {
  const colors = {
    0: 'text-yellow-600 bg-yellow-100',
    1: 'text-blue-600 bg-blue-100',
    2: 'text-green-600 bg-green-100',
    3: 'text-gray-600 bg-gray-100',
    4: 'text-purple-600 bg-purple-100',
  };
  return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
}