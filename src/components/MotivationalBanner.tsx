import { useState, useEffect } from 'react';
import { Sparkles, X, Zap, Megaphone } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { getCompanionMessage, CompanionPersona } from '../utils/companionMessages';

interface MotivationalBannerProps {
  context?: string;
  className?: string;
}

export function MotivationalBanner({ context = 'expense_added', className = '' }: MotivationalBannerProps) {
  const { profile } = useUserProfile();
  const [message, setMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (profile) {
      const persona = (profile.ai_persona || 'roaster') as CompanionPersona;
      const companionMessage = getCompanionMessage(persona, context);
      setMessage(companionMessage);
      setIsVisible(true);
    }
  }, [context, profile]);

  if (!message || !isVisible || !profile) return null;

  const persona = (profile.ai_persona || 'roaster') as CompanionPersona;

  const getCompanionStyle = () => {
    switch (persona) {
      case 'roaster':
        return {
          gradient: 'from-red-50 to-orange-50 border-red-500',
          icon: <Zap className="w-5 h-5 text-red-600" />,
          title: 'Roast Master'
        };
      case 'hype_man':
        return {
          gradient: 'from-blue-50 to-cyan-50 border-blue-500',
          icon: <Megaphone className="w-5 h-5 text-blue-600" />,
          title: 'Hype Man'
        };
      case 'wise_sage':
        return {
          gradient: 'from-emerald-50 to-teal-50 border-emerald-500',
          icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
          title: 'Wise Sage'
        };
      default:
        return {
          gradient: 'from-gray-50 to-gray-100 border-gray-500',
          icon: <Sparkles className="w-5 h-5 text-gray-600" />,
          title: 'Companion'
        };
    }
  };

  const style = getCompanionStyle();

  return (
    <div className={`relative p-4 md:p-6 bg-gradient-to-r ${style.gradient} rounded-2xl border-l-4 ${className}`}>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 hover:bg-white/50 rounded-lg transition"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {style.icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            {style.title}
          </p>
          <p className="text-gray-800 font-medium pr-6">{message}</p>
        </div>
      </div>
    </div>
  );
}
