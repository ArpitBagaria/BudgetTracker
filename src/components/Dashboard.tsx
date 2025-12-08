import { useState, useEffect, useMemo } from 'react';
import { Plus, Home, Target, Trophy, TrendingUp, Bot } from 'lucide-react';
import { Header } from './Header';
import { DashboardStats } from './DashboardStats';
import { ExpenseList } from './ExpenseList';
import { SavingsGoals } from './SavingsGoals';
import { Achievements } from './Achievements';
import { AddExpenseModal } from './AddExpenseModal';
import { MotivationalBanner } from './MotivationalBanner';
import { AICompanionSelector } from './AICompanionSelector';
import { useGamification } from '../hooks/useGamification';
import { useExpenses } from '../hooks/useExpenses';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { useUserProfile } from '../hooks/useUserProfile';

type Tab = 'home' | 'goals' | 'achievements' | 'companion';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const { checkAndAwardAchievements, profile } = useGamification();
  const { expenses, refetch: refetchExpenses } = useExpenses();
  const { goals } = useSavingsGoals();
  const { profile: userProfile } = useUserProfile();

  const quoteContext = useMemo(() => {
    if (!userProfile || !expenses.length) return 'saving_well';

    const thisMonth = new Date().getMonth();
    const monthExpenses = expenses.filter(e => new Date(e.date).getMonth() === thisMonth);
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (userProfile.monthly_budget && monthTotal > userProfile.monthly_budget * 1.1) {
      return 'overspending';
    }

    if (profile && profile.current_streak > 7) {
      return 'streak';
    }

    if (userProfile.target_savings && monthTotal < (userProfile.monthly_income || 0) - userProfile.target_savings) {
      return 'saving_well';
    }

    return 'expense_added';
  }, [expenses, userProfile, profile]);

  const handleExpenseAdded = async () => {
    await refetchExpenses();
    const newAchievements = await checkAndAwardAchievements(expenses.length + 1, goals.length);

    if (newAchievements && newAchievements.length > 0) {
      setTimeout(() => {
        setActiveTab('achievements');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
          <TabButton
            icon={<Home className="w-5 h-5" />}
            label="Dashboard"
            active={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
          />
          <TabButton
            icon={<Target className="w-5 h-5" />}
            label="Goals"
            active={activeTab === 'goals'}
            onClick={() => setActiveTab('goals')}
          />
          <TabButton
            icon={<Trophy className="w-5 h-5" />}
            label="Achievements"
            active={activeTab === 'achievements'}
            onClick={() => setActiveTab('achievements')}
          />
          <TabButton
            icon={<Bot className="w-5 h-5" />}
            label="Companion"
            active={activeTab === 'companion'}
            onClick={() => setActiveTab('companion')}
          />
        </div>

        {activeTab === 'home' && (
          <div className="space-y-8">
            <MotivationalBanner context={quoteContext} />
            <DashboardStats />

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Recent Expenses</h2>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Add Expense</span>
              </button>
            </div>

            <ExpenseList />
          </div>
        )}

        {activeTab === 'goals' && <SavingsGoals />}

        {activeTab === 'achievements' && <Achievements />}

        {activeTab === 'companion' && <AICompanionSelector />}
      </main>

      <button
        onClick={() => setShowAddExpense(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition flex items-center justify-center z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onExpenseAdded={handleExpenseAdded}
      />

      {showLevelUp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Level Up!</h2>
            <p className="text-xl text-gray-600 mb-6">
              You've reached Level {newLevel}
            </p>
            <button
              onClick={() => setShowLevelUp(false)}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap ${
        active
          ? 'bg-white text-emerald-600 shadow-md'
          : 'bg-white/60 text-gray-600 hover:bg-white/80'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
