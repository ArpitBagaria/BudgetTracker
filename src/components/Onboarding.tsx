import { useState, useEffect } from 'react';
import {
  DollarSign,
  Coffee,
  ShoppingBag,
  Bus,
  Pizza,
  Users,
  Palmtree,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useMotivationalQuotes } from '../hooks/useMotivationalQuotes';
import {
  ExpenseCategory,
  analyzeBudget,
  calculateCompoundInterest,
  getFinancialWisdom,
} from '../utils/financialCalculations';

interface OnboardingProps {
  onComplete: () => void;
}

const WEEKDAY_OPTIONS = [
  { name: 'Canteen/Food', icon: <Pizza className="w-6 h-6" />, category: 'discretionary' },
  { name: 'Snacks & Coffee', icon: <Coffee className="w-6 h-6" />, category: 'discretionary' },
  { name: 'Commute', icon: <Bus className="w-6 h-6" />, category: 'necessity' },
  { name: 'Groceries', icon: <ShoppingBag className="w-6 h-6" />, category: 'necessity' },
];

const WEEKEND_OPTIONS = [
  { name: 'Hangouts/Social', icon: <Users className="w-6 h-6" />, category: 'discretionary' },
  { name: 'Outings/Entertainment', icon: <Palmtree className="w-6 h-6" />, category: 'discretionary' },
  { name: 'Shopping', icon: <ShoppingBag className="w-6 h-6" />, category: 'discretionary' },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { updateProfile } = useUserProfile();
  const { getRandomQuote } = useMotivationalQuotes('onboarding');

  const [aiPersona, setAiPersona] = useState('roaster');
  const [themePreference, setThemePreference] = useState('neobrutalism');
  const [darkMode, setDarkMode] = useState(true);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [weekdayExpenses, setWeekdayExpenses] = useState<ExpenseCategory[]>([]);
  const [weekendExpenses, setWeekendExpenses] = useState<ExpenseCategory[]>([]);
  const [targetSavings, setTargetSavings] = useState('');
  const [currentQuote, setCurrentQuote] = useState<any>(null);

  useEffect(() => {
    setCurrentQuote(getRandomQuote());
  }, [step]);

  const addWeekdayExpense = (name: string) => {
    if (!weekdayExpenses.find(e => e.name === name)) {
      setWeekdayExpenses([...weekdayExpenses, { name, amount: 0, frequency: 'daily' }]);
    }
  };

  const addWeekendExpense = (name: string) => {
    if (!weekendExpenses.find(e => e.name === name)) {
      setWeekendExpenses([...weekendExpenses, { name, amount: 0, frequency: 'daily' }]);
    }
  };

  const updateExpenseAmount = (
    type: 'weekday' | 'weekend',
    name: string,
    amount: number
  ) => {
    if (type === 'weekday') {
      setWeekdayExpenses(
        weekdayExpenses.map(e => (e.name === name ? { ...e, amount } : e))
      );
    } else {
      setWeekendExpenses(
        weekendExpenses.map(e => (e.name === name ? { ...e, amount } : e))
      );
    }
  };

  const removeExpense = (type: 'weekday' | 'weekend', name: string) => {
    if (type === 'weekday') {
      setWeekdayExpenses(weekdayExpenses.filter(e => e.name !== name));
    } else {
      setWeekendExpenses(weekendExpenses.filter(e => e.name !== name));
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    const budget = analyzeBudget(
      parseFloat(monthlyIncome),
      weekdayExpenses,
      weekendExpenses,
      parseFloat(targetSavings)
    );

    await updateProfile({
      onboarding_completed: true,
      ai_persona: aiPersona,
      theme_preference: themePreference,
      dark_mode: darkMode,
      monthly_income: parseFloat(monthlyIncome),
      target_savings: parseFloat(targetSavings),
      weekday_budget: weekdayExpenses as any,
      weekend_budget: weekendExpenses as any,
      monthly_budget: budget.totalExpenses,
    });

    await supabase.from('financial_plan').upsert({
      user_id: user.id,
      monthly_income: parseFloat(monthlyIncome),
      total_expenses: budget.totalExpenses,
      suggested_savings: budget.actualSavings,
      necessities_amount: budget.weekdayExpenses * 0.6,
      discretionary_amount: budget.totalExpenses - budget.weekdayExpenses * 0.6,
      suggestions: budget.suggestions,
      updated_at: new Date().toISOString(),
    });

    onComplete();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return aiPersona !== '';
      case 2:
        return themePreference !== '';
      case 3:
        return monthlyIncome && parseFloat(monthlyIncome) > 0;
      case 4:
        return weekdayExpenses.length > 0 && weekdayExpenses.every(e => e.amount > 0);
      case 5:
        return weekendExpenses.length > 0 && weekendExpenses.every(e => e.amount > 0);
      case 6:
        return targetSavings && parseFloat(targetSavings) > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-12 bg-emerald-500' : i < step ? 'w-8 bg-emerald-300' : 'w-8 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {currentQuote && (
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-l-4 border-purple-500">
              <p className="text-gray-800 italic mb-2">"{currentQuote.quote}"</p>
              {currentQuote.author && (
                <p className="text-sm text-gray-600">— {currentQuote.author}</p>
              )}
            </div>
          )}

          {step === 1 && <StepPersona value={aiPersona} onChange={setAiPersona} />}
          {step === 2 && <StepTheme value={themePreference} onChange={setThemePreference} darkMode={darkMode} onDarkModeChange={setDarkMode} />}
          {step === 3 && <Step1 value={monthlyIncome} onChange={setMonthlyIncome} />}
          {step === 4 && (
            <Step2
              expenses={weekdayExpenses}
              onAdd={addWeekdayExpense}
              onUpdate={(name, amount) => updateExpenseAmount('weekday', name, amount)}
              onRemove={name => removeExpense('weekday', name)}
            />
          )}
          {step === 5 && (
            <Step3
              expenses={weekendExpenses}
              onAdd={addWeekendExpense}
              onUpdate={(name, amount) => updateExpenseAmount('weekend', name, amount)}
              onRemove={name => removeExpense('weekend', name)}
            />
          )}
          {step === 6 && <Step4 value={targetSavings} onChange={setTargetSavings} income={parseFloat(monthlyIncome)} />}
          {step === 7 && (
            <Step5
              monthlyIncome={parseFloat(monthlyIncome)}
              weekdayExpenses={weekdayExpenses}
              weekendExpenses={weekendExpenses}
              targetSavings={parseFloat(targetSavings)}
            />
          )}
          {step === 8 && (
            <Step6
              savings={
                parseFloat(monthlyIncome) -
                analyzeBudget(
                  parseFloat(monthlyIncome),
                  weekdayExpenses,
                  weekendExpenses,
                  parseFloat(targetSavings)
                ).totalExpenses
              }
            />
          )}

          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
            {step < 8 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition shadow-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                Start My Journey
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPersona({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const personas = [
    {
      id: 'roaster',
      name: 'The Roast Master',
      emoji: '🔥',
      description: 'Keeps it real. Will roast your spending but hypes your wins.',
      example: '"Another latte? That\'s 1% of your Spring Break fund gone 💀"'
    },
    {
      id: 'hype_man',
      name: 'The Hype Man',
      emoji: '🚀',
      description: 'All positive vibes. Celebrates every win, big or small.',
      example: '"YESSS! Look at you being responsible! That\'s what I\'m talking about! 🎉"'
    },
    {
      id: 'wise_sage',
      name: 'The Wise Sage',
      emoji: '🧘',
      description: 'Thoughtful wisdom. Gives you perspective without judgment.',
      example: '"$5 today or $30 in 5 years with compound interest? The choice is yours."'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce">🤖</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose your AI companion</h2>
        <p className="text-gray-600">They'll give you feedback on your spending</p>
      </div>

      <div className="space-y-4">
        {personas.map(persona => (
          <button
            key={persona.id}
            onClick={() => onChange(persona.id)}
            className={`w-full text-left p-6 rounded-2xl border-4 transition transform hover:scale-105 ${
              value === persona.id
                ? 'border-emerald-500 bg-emerald-50 shadow-xl'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{persona.emoji}</div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-1">{persona.name}</h3>
                <p className="text-gray-600 mb-3">{persona.description}</p>
                <div className="bg-white/80 p-3 rounded-lg border-l-4 border-purple-400">
                  <p className="text-sm text-gray-700 italic">{persona.example}</p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepTheme({
  value,
  onChange,
  darkMode,
  onDarkModeChange
}: {
  value: string;
  onChange: (v: string) => void;
  darkMode: boolean;
  onDarkModeChange: (v: boolean) => void;
}) {
  const themes = [
    {
      id: 'neobrutalism',
      name: 'Neobrutalism',
      description: 'Bold, high contrast, maximum impact',
      preview: 'bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600'
    },
    {
      id: 'glassmorphism',
      name: 'Glassmorphism',
      description: 'Sleek, frosted glass aesthetic',
      preview: 'bg-gradient-to-br from-blue-400 via-cyan-300 to-teal-400'
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      description: 'Neon vibes, future aesthetic',
      preview: 'bg-gradient-to-br from-purple-900 via-pink-600 to-cyan-400'
    },
    {
      id: 'default',
      name: 'Clean & Modern',
      description: 'Simple, clean, professional',
      preview: 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎨</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Pick your vibe</h2>
        <p className="text-gray-600">Customize how your app looks and feels</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            className={`text-left p-4 rounded-2xl border-4 transition transform hover:scale-105 ${
              value === theme.id
                ? 'border-emerald-500 shadow-xl'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`h-24 ${theme.preview} rounded-xl mb-3 shadow-lg`}></div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{theme.name}</h3>
            <p className="text-sm text-gray-600">{theme.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Dark Mode</h4>
            <p className="text-sm text-gray-600">Save battery, look cooler</p>
          </div>
          <button
            onClick={() => onDarkModeChange(!darkMode)}
            className={`relative w-16 h-8 rounded-full transition ${
              darkMode ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition transform ${
                darkMode ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function Step1({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-4">
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's start with the basics</h2>
        <p className="text-gray-600">How much money do you receive each month?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monthly Income (from allowance, part-time job, etc.)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">$</span>
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-2xl font-semibold"
            placeholder="0.00"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">This helps us create a realistic budget for you</p>
      </div>
    </div>
  );
}

function Step2({
  expenses,
  onAdd,
  onUpdate,
  onRemove,
}: {
  expenses: ExpenseCategory[];
  onAdd: (name: string) => void;
  onUpdate: (name: string, amount: number) => void;
  onRemove: (name: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4">
          <Coffee className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Typical weekday spending</h2>
        <p className="text-gray-600">What do you usually spend on during weekdays? (per day)</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {WEEKDAY_OPTIONS.map(option => (
          <button
            key={option.name}
            onClick={() => onAdd(option.name)}
            disabled={expenses.some(e => e.name === option.name)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition ${
              expenses.some(e => e.name === option.name)
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {option.icon}
            <span className="font-medium text-sm">{option.name}</span>
          </button>
        ))}
      </div>

      {expenses.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Daily amounts:</h3>
          {expenses.map(expense => (
            <div key={expense.name} className="flex items-center gap-3">
              <input
                type="number"
                step="0.01"
                value={expense.amount || ''}
                onChange={(e) => onUpdate(expense.name, parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
              />
              <span className="text-gray-600 font-medium min-w-[140px]">{expense.name}</span>
              <button
                onClick={() => onRemove(expense.name)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Step3({
  expenses,
  onAdd,
  onUpdate,
  onRemove,
}: {
  expenses: ExpenseCategory[];
  onAdd: (name: string) => void;
  onUpdate: (name: string, amount: number) => void;
  onRemove: (name: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Weekend vibes</h2>
        <p className="text-gray-600">What about weekends? (per day)</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {WEEKEND_OPTIONS.map(option => (
          <button
            key={option.name}
            onClick={() => onAdd(option.name)}
            disabled={expenses.some(e => e.name === option.name)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition ${
              expenses.some(e => e.name === option.name)
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {option.icon}
            <span className="font-medium text-sm">{option.name}</span>
          </button>
        ))}
      </div>

      {expenses.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Daily amounts:</h3>
          {expenses.map(expense => (
            <div key={expense.name} className="flex items-center gap-3">
              <input
                type="number"
                step="0.01"
                value={expense.amount || ''}
                onChange={(e) => onUpdate(expense.name, parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
              />
              <span className="text-gray-600 font-medium min-w-[140px]">{expense.name}</span>
              <button
                onClick={() => onRemove(expense.name)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Step4({ value, onChange, income }: { value: string; onChange: (v: string) => void; income: number }) {
  const maxSavings = income * 0.5;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your savings goal</h2>
        <p className="text-gray-600">How much do you want to save each month?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monthly Savings Target
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">$</span>
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-2xl font-semibold"
            placeholder="0.00"
          />
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Financial experts recommend saving 20-30% of your income.
            For you, that would be ${(income * 0.2).toFixed(0)} - ${(income * 0.3).toFixed(0)}/month.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step5({
  monthlyIncome,
  weekdayExpenses,
  weekendExpenses,
  targetSavings,
}: {
  monthlyIncome: number;
  weekdayExpenses: ExpenseCategory[];
  weekendExpenses: ExpenseCategory[];
  targetSavings: number;
}) {
  const budget = analyzeBudget(monthlyIncome, weekdayExpenses, weekendExpenses, targetSavings);
  const situation = budget.savingsShortfall <= 0 ? 'good' : budget.savingsShortfall < 100 ? 'tight' : 'struggling';

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your personalized plan</h2>
        <p className="text-gray-600">Here's what your budget looks like</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-sm text-emerald-700 font-medium mb-1">Monthly Income</p>
          <p className="text-2xl font-bold text-emerald-900">${monthlyIncome.toFixed(0)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-sm text-red-700 font-medium mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-900">${budget.totalExpenses.toFixed(0)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-medium mb-1">Actual Savings</p>
          <p className="text-2xl font-bold text-blue-900">${budget.actualSavings.toFixed(0)}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-sm text-purple-700 font-medium mb-1">Target Savings</p>
          <p className="text-2xl font-bold text-purple-900">${targetSavings.toFixed(0)}</p>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-l-4 border-orange-500">
        <p className="text-lg font-semibold text-gray-900 mb-4">{getFinancialWisdom(situation)}</p>
        <div className="space-y-2">
          {budget.suggestions.map((suggestion, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step6({ savings }: { savings: number }) {
  const projections = calculateCompoundInterest(Math.max(savings, 50), 5, 0.05);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mb-4">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">The power of compound interest</h2>
        <p className="text-gray-600">Watch your money grow over time</p>
      </div>

      <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
        <p className="text-sm text-gray-600 mb-4">
          If you save <strong>${Math.max(savings, 50).toFixed(0)}/month</strong> with a 5% annual return:
        </p>

        <div className="space-y-3">
          {projections.map(({ year, amount }) => (
            <div key={year} className="flex items-center justify-between p-4 bg-white rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-600">{year}y</span>
                </div>
                <span className="text-gray-700">After {year} year{year > 1 ? 's' : ''}</span>
              </div>
              <span className="text-xl font-bold text-gray-900">${amount.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl">
        <p className="text-gray-800 text-center">
          <span className="text-4xl font-bold text-emerald-600">${projections[4].amount.toFixed(0)}</span>
          <br />
          <span className="text-gray-600">That's what you'll have in 5 years by staying consistent!</span>
        </p>
      </div>

      <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-500">
        <p className="text-sm text-gray-700 italic">
          "Someone is sitting in the shade today because someone planted a tree a long time ago." - Warren Buffett
        </p>
      </div>
    </div>
  );
}
