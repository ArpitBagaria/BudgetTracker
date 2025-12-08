import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Zap, Megaphone, Sparkles, TrendingUp, Target } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useCompanionChat } from '../hooks/useCompanionChat';
import { useExpenses } from '../hooks/useExpenses';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { generateChatResponse } from '../utils/chatResponses';
import { CompanionPersona } from '../utils/companionMessages';

export function CompanionChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile } = useUserProfile();
  const { messages, sendMessage } = useCompanionChat();
  const { expenses } = useExpenses();
  const { goals } = useSavingsGoals();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!profile) return null;

  const persona = (profile.ai_persona || 'roaster') as CompanionPersona;
  const companionName = profile.companion_name || 'Companion';

  const getCompanionIcon = () => {
    switch (persona) {
      case 'roaster':
        return <Zap className="w-5 h-5" />;
      case 'hype_man':
        return <Megaphone className="w-5 h-5" />;
      case 'wise_sage':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  const getCompanionColor = () => {
    switch (persona) {
      case 'roaster':
        return 'from-red-500 to-orange-500';
      case 'hype_man':
        return 'from-blue-500 to-cyan-500';
      case 'wise_sage':
        return 'from-emerald-500 to-teal-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setInputMessage('');
    await sendMessage(userMsg, 'user');

    setIsTyping(true);

    setTimeout(async () => {
      const thisMonth = new Date().getMonth();
      const monthExpenses = expenses.filter(e => new Date(e.date).getMonth() === thisMonth);
      const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      const response = generateChatResponse(userMsg, persona, {
        profile,
        totalExpenses,
        monthlyBudget: profile.monthly_budget || 0,
        currentStreak: profile.current_streak,
        goalsCount: goals.length,
      });

      await sendMessage(response, 'companion', 'chat');
      setIsTyping(false);
    }, 1000);
  };

  const getJourneyStats = () => {
    const thisMonth = new Date().getMonth();
    const monthExpenses = expenses.filter(e => new Date(e.date).getMonth() === thisMonth);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = profile.monthly_budget || 0;
    const remaining = budget - totalExpenses;

    return { totalExpenses, budget, remaining };
  };

  const stats = getJourneyStats();

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          <div className={`bg-gradient-to-r ${getCompanionColor()} p-4 rounded-t-2xl text-white`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  {getCompanionIcon()}
                </div>
                <div>
                  <h3 className="font-bold">{companionName}</h3>
                  <p className="text-xs opacity-90">Your AI Companion</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/20 backdrop-blur rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="opacity-90">Streak</span>
                </div>
                <p className="font-bold">{profile.current_streak} days</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Target className="w-3 h-3" />
                  <span className="opacity-90">Budget Left</span>
                </div>
                <p className="font-bold">${stats.remaining.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p className="mb-2">Start a conversation with {companionName}!</p>
                <p className="text-sm">Try asking:</p>
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => setInputMessage('How am I doing?')}
                    className="block w-full text-sm bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition"
                  >
                    How am I doing?
                  </button>
                  <button
                    onClick={() => setInputMessage('Give me some motivation')}
                    className="block w-full text-sm bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition"
                  >
                    Give me some motivation
                  </button>
                  <button
                    onClick={() => setInputMessage('Show me my progress')}
                    className="block w-full text-sm bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition"
                  >
                    Show me my progress
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Message ${companionName}...`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim()}
                className={`px-4 py-2 bg-gradient-to-r ${getCompanionColor()} text-white rounded-xl hover:opacity-90 transition disabled:opacity-50`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r ${getCompanionColor()} text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition flex items-center justify-center z-40`}
      >
        {isOpen ? <X className="w-8 h-8" /> : getCompanionIcon()}
      </button>
    </>
  );
}
