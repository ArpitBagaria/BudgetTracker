import { Zap, Megaphone, Sparkles } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';

type Companion = 'roaster' | 'hype_man' | 'wise_sage';

interface CompanionOption {
  id: Companion;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgGradient: string;
  preview: string;
}

const companions: CompanionOption[] = [
  {
    id: 'roaster',
    name: 'Roast Master',
    icon: <Zap className="w-8 h-8" />,
    description: 'Tough love and sarcastic feedback to keep you in check',
    color: 'text-red-600',
    bgGradient: 'from-red-50 to-orange-50 border-red-500',
    preview: "Another coffee? Your wallet is crying harder than you did at that sad movie."
  },
  {
    id: 'hype_man',
    name: 'Hype Man',
    icon: <Megaphone className="w-8 h-8" />,
    description: 'Encouraging and motivational support for every win',
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-cyan-50 border-blue-500',
    preview: "YES! You logged that expense! You're absolutely crushing it today!"
  },
  {
    id: 'wise_sage',
    name: 'Wise Sage',
    icon: <Sparkles className="w-8 h-8" />,
    description: 'Thoughtful wisdom and mindful financial guidance',
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-50 to-teal-50 border-emerald-500',
    preview: "Consider this: every mindful spending choice today shapes your tomorrow."
  }
];

export function AICompanionSelector() {
  const { profile, updateProfile } = useUserProfile();

  const handleSelectCompanion = async (companionId: Companion) => {
    await updateProfile({ ai_persona: companionId });
  };

  if (!profile) return null;

  const selectedCompanion = profile.ai_persona || 'roaster';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your AI Companion</h2>
        <p className="text-gray-600">
          Select the personality that will guide your financial journey
        </p>
      </div>

      <div className="grid gap-4">
        {companions.map((companion) => {
          const isSelected = selectedCompanion === companion.id;

          return (
            <button
              key={companion.id}
              onClick={() => handleSelectCompanion(companion.id)}
              className={`text-left p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                isSelected
                  ? `bg-gradient-to-r ${companion.bgGradient} border-l-4 shadow-md`
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white shadow-sm' : 'bg-white/70'
                  }`}
                >
                  <div className={companion.color}>{companion.icon}</div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {companion.name}
                    </h3>
                    {isSelected && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs font-semibold text-emerald-600">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{companion.description}</p>

                  {isSelected && (
                    <div className="bg-white/70 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-700 italic">"{companion.preview}"</p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
