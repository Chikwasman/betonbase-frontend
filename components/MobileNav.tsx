'use client';

import { Home, TrendingUp, Wallet, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';

export function MobileNav() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      href: '/',
      active: pathname === '/',
    },
    {
      icon: TrendingUp,
      label: 'Hot Bets',
      href: '/hot-bets',
      active: pathname === '/hot-bets',
    },
    {
      icon: Wallet,
      label: 'My Bets',
      href: '/my-bets',
      active: pathname === '/my-bets',
      badge: isConnected, // Show indicator if connected
    },
    {
      icon: User,
      label: 'Account',
      href: '/my-bets',
      active: pathname === '/my-bets',
    },
  ];

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20 lg:hidden"></div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1 relative transition-all
                  ${item.active 
                    ? 'text-green-600 dark:text-green-500' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500'
                  }
                `}
              >
                {/* Active indicator */}
                {item.active && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-green-600 dark:bg-green-500"></div>
                )}

                {/* Icon with badge */}
                <div className="relative">
                  <Icon className={`h-6 w-6 ${item.active ? 'scale-110' : ''} transition-transform`} />
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>

                {/* Label */}
                <span className={`text-xs font-medium ${item.active ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
