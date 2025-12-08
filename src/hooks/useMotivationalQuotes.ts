import { useMemo } from 'react';

const ONBOARDING_QUOTES = [
  "Every dollar saved is a step toward freedom.",
  "Small changes today, big impact tomorrow.",
  "Your future self will thank you for starting now.",
  "Compound interest is the eighth wonder of the world. - Albert Einstein",
  "Don't save what is left after spending; spend what is left after saving. - Warren Buffett",
  "A budget is telling your money where to go instead of wondering where it went. - Dave Ramsey",
  "The habit of saving is itself an education; it fosters every virtue. - T.T. Munger",
  "Do not save what is left after spending, but spend what is left after saving. - Warren Buffett",
  "The art is not in making money, but in keeping it. - Proverb",
  "Financial freedom is available to those who learn about it and work for it. - Robert Kiyosaki",
];

const DASHBOARD_QUOTES = [
  "Track your progress, transform your life.",
  "Every expense tracked is a lesson learned.",
  "Knowledge is power, especially about your money.",
  "Small steps lead to big financial wins.",
  "Stay mindful, stay wealthy.",
];

export function useMotivationalQuotes(context: 'onboarding' | 'dashboard' = 'onboarding') {
  const quotes = useMemo(() => {
    return context === 'onboarding' ? ONBOARDING_QUOTES : DASHBOARD_QUOTES;
  }, [context]);

  const getRandomQuote = () => {
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return { getRandomQuote, quotes };
}
