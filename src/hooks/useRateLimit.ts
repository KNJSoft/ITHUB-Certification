import { useState, useEffect } from 'react';

interface RateLimitState {
  isBlocked: boolean;
  remainingAttempts: number;
  resetTime: number | null;
  blockDuration: number;
}

const RATE_LIMIT_KEY = 'rate_limit';
const BLOCK_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

export const useRateLimit = (action: 'login' | 'register' | 'reset_password') => {
  const [rateLimit, setRateLimit] = useState<RateLimitState>({
    isBlocked: false,
    remainingAttempts: 5,
    resetTime: null,
    blockDuration: BLOCK_DURATION
  });

  useEffect(() => {
    // Charger l'état du rate limit depuis localStorage
    const stored = localStorage.getItem(`${RATE_LIMIT_KEY}_${action}`);
    if (stored) {
      const data = JSON.parse(stored);
      const now = Date.now();
      
      // Vérifier si le blocage a expiré
      if (data.blockUntil && now < data.blockUntil) {
        setRateLimit({
          isBlocked: true,
          remainingAttempts: 0,
          resetTime: data.blockUntil,
          blockDuration: BLOCK_DURATION
        });
      } else if (data.blockUntil && now >= data.blockUntil) {
        // Réinitialiser après expiration
        resetRateLimit();
      } else {
        setRateLimit({
          isBlocked: false,
          remainingAttempts: data.remainingAttempts || 5,
          resetTime: null,
          blockDuration: BLOCK_DURATION
        });
      }
    }
  }, [action]);

  const recordAttempt = (success: boolean) => {
    if (success) {
      // Réinitialiser en cas de succès
      resetRateLimit();
      return;
    }

    const stored = localStorage.getItem(`${RATE_LIMIT_KEY}_${action}`);
    let attempts = stored ? JSON.parse(stored).attempts || 0 : 0;
    attempts++;

    const MAX_ATTEMPTS = 5;
    
    if (attempts >= MAX_ATTEMPTS) {
      // Bloquer pour 1 minute
      const blockUntil = Date.now() + BLOCK_DURATION;
      const data = {
        attempts,
        blockUntil,
        remainingAttempts: 0
      };
      localStorage.setItem(`${RATE_LIMIT_KEY}_${action}`, JSON.stringify(data));
      
      setRateLimit({
        isBlocked: true,
        remainingAttempts: 0,
        resetTime: blockUntil,
        blockDuration: BLOCK_DURATION
      });
    } else {
      const data = {
        attempts,
        blockUntil: null,
        remainingAttempts: MAX_ATTEMPTS - attempts
      };
      localStorage.setItem(`${RATE_LIMIT_KEY}_${action}`, JSON.stringify(data));
      
      setRateLimit({
        isBlocked: false,
        remainingAttempts: MAX_ATTEMPTS - attempts,
        resetTime: null,
        blockDuration: BLOCK_DURATION
      });
    }
  };

  const resetRateLimit = () => {
    localStorage.removeItem(`${RATE_LIMIT_KEY}_${action}`);
    setRateLimit({
      isBlocked: false,
      remainingAttempts: 5,
      resetTime: null,
      blockDuration: BLOCK_DURATION
    });
  };

  const getTimeRemaining = () => {
    if (!rateLimit.resetTime) return 0;
    const remaining = rateLimit.resetTime - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  };

  return {
    ...rateLimit,
    recordAttempt,
    resetRateLimit,
    getTimeRemaining
  };
};
