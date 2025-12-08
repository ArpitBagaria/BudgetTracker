import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface CompanionMessage {
  id: string;
  user_id: string;
  message: string;
  sender: 'user' | 'companion';
  context: string;
  created_at: string;
}

export function useCompanionChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('companion_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const sendMessage = async (message: string, sender: 'user' | 'companion', context = 'chat') => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('companion_messages')
      .insert({
        user_id: user.id,
        message,
        sender,
        context,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages(prev => [...prev, data]);
    }

    return { data, error };
  };

  return { messages, loading, sendMessage, refetch: fetchMessages };
}
