'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

interface WinCelebrationProps {
  show: boolean;
  onComplete: () => void;
  amount?: string;
}

export function WinCelebration({ show, onComplete, amount }: WinCelebrationProps) {
  const [confettiPieces, setConfettiPieces] = useState<Array<{
    id: number;
    left: number;
    delay: number;
    duration: number;
    color: string;
  }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
        color: ['#10B981', '#FBBF24', '#3B82F6', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)],
      }));
      setConfettiPieces(pieces);

      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
        
        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute -top-10 w-3 h-3 animate-confetti"
              style={{
                left: `${piece.left}%`,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                transform: 'rotate(45deg)',
              }}
            />
          ))}
        </div>

        {/* Center Trophy Animation */}
        <div className="relative z-10 text-center animate-in zoom-in duration-500">
          
          {/* Sparkle Ring */}
          <div className="absolute inset-0 -m-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-sparkle"
                style={{
                  top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
                  left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping" />
              </div>
            ))}
          </div>

          {/* Trophy */}
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full p-12 shadow-2xl animate-bounce-once">
            <Trophy className="h-32 w-32 text-white drop-shadow-2xl" strokeWidth={2.5} />
          </div>

          {/* Text */}
          <div className="mt-8 space-y-2 animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <h2 className="text-5xl font-black text-white drop-shadow-lg animate-pulse-slow">
              🎉 WINNER! 🎉
            </h2>
            {amount && (
              <p className="text-3xl font-bold text-green-400 drop-shadow-lg animate-in zoom-in duration-500 delay-500">
                +{amount}
              </p>
            )}
            <p className="text-xl text-white/90 drop-shadow animate-in fade-in duration-700 delay-700">
              Winnings Claimed Successfully!
            </p>
          </div>

          {/* Floating Money Icons */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`money-${i}`}
              className="absolute text-4xl animate-float-up"
              style={{
                top: '50%',
                left: `${20 + i * 15}%`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0,
              }}
            >
              💰
            </div>
          ))}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce-once {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          25% {
            transform: translateY(-30px) scale(1.1);
          }
          50% {
            transform: translateY(0) scale(1);
          }
          75% {
            transform: translateY(-15px) scale(1.05);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes float-up {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1.5);
            opacity: 0;
          }
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-bounce-once {
          animation: bounce-once 1s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
      `}</style>
    </>
  );
}
