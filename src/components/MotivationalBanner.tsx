import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useMotivationalQuotes } from '../hooks/useMotivationalQuotes';

interface MotivationalBannerProps {
  context?: string;
  className?: string;
}

export function MotivationalBanner({ context, className = '' }: MotivationalBannerProps) {
  const { getRandomQuote } = useMotivationalQuotes(context);
  const [quote, setQuote] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const randomQuote = getRandomQuote(context);
    setQuote(randomQuote);
    setIsVisible(true);
  }, [context]);

  if (!quote || !isVisible) return null;

  const getBgColor = () => {
    switch (quote.category) {
      case 'motivational':
        return 'from-purple-50 to-pink-50 border-purple-500';
      case 'educational':
        return 'from-blue-50 to-cyan-50 border-blue-500';
      case 'warning':
        return 'from-orange-50 to-yellow-50 border-orange-500';
      case 'celebration':
        return 'from-green-50 to-emerald-50 border-emerald-500';
      default:
        return 'from-gray-50 to-gray-100 border-gray-500';
    }
  };

  return (
    <div className={`relative p-4 md:p-6 bg-gradient-to-r ${getBgColor()} rounded-2xl border-l-4 ${className}`}>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 hover:bg-white/50 rounded-lg transition"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="text-gray-800 font-medium mb-1 pr-6">{quote.quote}</p>
          {quote.author && (
            <p className="text-sm text-gray-600">— {quote.author}</p>
          )}
        </div>
      </div>
    </div>
  );
}
