// Powered by OnSpace.AI
// ASK VALENTINA — Countdown Hook for 24-hour response window

import { useState, useEffect, useCallback } from 'react';

const RESPONSE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
  label: string;
  progress: number; // 0 to 1, where 1 = just submitted, 0 = expired
}

export function useCountdown(submittedAt: string): CountdownResult {
  const calcRemaining = useCallback(() => {
    const submitted = new Date(submittedAt).getTime();
    const deadline = submitted + RESPONSE_WINDOW_MS;
    const now = Date.now();
    return Math.max(0, deadline - now);
  }, [submittedAt]);

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    setRemaining(calcRemaining());
    const interval = setInterval(() => {
      const ms = calcRemaining();
      setRemaining(ms);
      if (ms <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [calcRemaining]);

  const isExpired = remaining <= 0;
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  const progress = Math.min(1, remaining / RESPONSE_WINDOW_MS);

  let label = '';
  if (isExpired) {
    label = 'Response window closed';
  } else if (hours > 0) {
    label = `${hours}h ${minutes}m remaining`;
  } else if (minutes > 0) {
    label = `${minutes}m ${seconds}s remaining`;
  } else {
    label = `${seconds}s remaining`;
  }

  return { hours, minutes, seconds, totalMs: remaining, isExpired, label, progress };
}
