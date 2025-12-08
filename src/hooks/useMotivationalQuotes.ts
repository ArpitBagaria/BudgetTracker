import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Quote {
  id: string;
  quote: string;
  author: string | null;
  category: string;
  context: string;
}

export function useMotivationalQuotes(context?: string) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, [context]);

  const fetchQuotes = async () => {
    let query = supabase.from('motivational_quotes').select('*');

    if (context) {
      query = query.eq('context', context);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching quotes:', error);
    } else {
      setQuotes(data || []);
    }
    setLoading(false);
  };

  const getRandomQuote = (specificContext?: string): Quote | null => {
    const contextQuotes = specificContext
      ? quotes.filter(q => q.context === specificContext)
      : quotes;

    if (contextQuotes.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * contextQuotes.length);
    return contextQuotes[randomIndex];
  };

  return { quotes, loading, getRandomQuote };
}
