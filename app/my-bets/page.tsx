'use client';

import { MyBets } from '@/components/MyBets';

export default function MyBetsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <MyBets />
      </div>
    </div>
  );
}
