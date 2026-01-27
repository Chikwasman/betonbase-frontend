'use client';

import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

export function BetaDisclaimer() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('betaDisclaimerAccepted');
    if (!hasSeenDisclaimer) {
      setTimeout(() => setShowDisclaimer(true), 500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('betaDisclaimerAccepted', 'true');
    setShowDisclaimer(false);
  };

  if (!showDisclaimer) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full border border-green-200 dark:border-green-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-t-xl">
            <div className="flex items-center gap-3">
              <Info className="h-7 w-7 text-white" />
              <h2 className="text-xl font-bold text-white">Welcome to BetOnBase! 👋</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We're currently in <span className="font-semibold text-blue-600 dark:text-blue-400">beta </span>. 
              While we've worked hard to make everything secure, please only bet what you can afford to lose.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-900 dark:text-blue-100">
              💡 <span className="font-semibold">Pro tip:</span> By using BetOnBase, you acknowledge that we cannot be held responsible for any 
losses or damages that may result from using our platform. Smart contracts and 
blockchain transactions carry inherent risks. Please bet responsibly.
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0">
            <button
              onClick={handleAccept}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Got it, let's go! 🚀
            </button>
          </div>
        </div>
      </div>
    </>
  );
}