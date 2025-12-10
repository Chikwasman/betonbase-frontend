import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'BetOnBase',
  projectId: '28e656371574fb158774ad925004d199', // Get from https://cloud.walletconnect.com
  chains: [baseSepolia],
  ssr: true,
});