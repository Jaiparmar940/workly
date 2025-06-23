import { useEffect, useRef, useState } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  timeWindow: number; // in milliseconds
  cooldownPeriod: number; // in milliseconds
}

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  isBlocked: boolean;
  blockUntil: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    lastAttempt: 0,
    isBlocked: false,
    blockUntil: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkRateLimit = (): boolean => {
    const now = Date.now();

    // Check if currently blocked
    if (state.isBlocked && now < state.blockUntil) {
      return false;
    }

    // Reset if cooldown period has passed
    if (state.isBlocked && now >= state.blockUntil) {
      setState(prev => ({
        ...prev,
        isBlocked: false,
        attempts: 0,
        blockUntil: 0,
      }));
    }

    // Check if within time window
    if (now - state.lastAttempt < config.timeWindow) {
      // Increment attempts
      const newAttempts = state.attempts + 1;
      
      if (newAttempts >= config.maxAttempts) {
        // Block the user
        const blockUntil = now + config.cooldownPeriod;
        setState(prev => ({
          ...prev,
          isBlocked: true,
          blockUntil,
          attempts: newAttempts,
          lastAttempt: now,
        }));
        return false;
      } else {
        setState(prev => ({
          ...prev,
          attempts: newAttempts,
          lastAttempt: now,
        }));
        return true;
      }
    } else {
      // Reset attempts if outside time window
      setState(prev => ({
        ...prev,
        attempts: 1,
        lastAttempt: now,
      }));
      return true;
    }
  };

  const reset = () => {
    setState({
      attempts: 0,
      lastAttempt: 0,
      isBlocked: false,
      blockUntil: 0,
    });
  };

  const getRemainingTime = (): number => {
    const now = Date.now();
    return Math.max(0, state.blockUntil - now);
  };

  const getRemainingAttempts = (): number => {
    return Math.max(0, config.maxAttempts - state.attempts);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    checkRateLimit,
    reset,
    getRemainingTime,
    getRemainingAttempts,
    isBlocked: state.isBlocked,
    attempts: state.attempts,
  };
}; 