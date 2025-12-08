import { useState } from 'react';
import { X, Sparkles, DollarSign } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { useGamification } from '../hooks/useGamification';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../lib/supabase';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

export function AddExpenseModal({ isOpen, onClose, onExpenseAdded }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [useAI, setUseAI] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [roastMessage, setRoastMessage] = useState<{ message: string; type: string } | null>(null);
  const { categories, addExpense, categorizeWithAI, expenses } = useExpenses();
  const { addPoints, updateStreak } = useGamification();
  const { profile } = useUserProfile();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let categoryId = selectedCategory;
      let isAICategorized = false;
      let categoryName = 'Other';

      if (useAI && description) {
        categoryId = await categorizeWithAI(description);
        isAICategorized = true;
      }

      const category = categories.find(c => c.id === categoryId);
      categoryName = category?.name || 'Other';

      const { data: expenseData } = await addExpense({
        amount: parseFloat(amount),
        description,
        category_id: categoryId || categories[0]?.id,
        date,
        is_ai_categorized: isAICategorized,
      });

      await addPoints(5, 'Expense logged');
      await updateStreak();

      if (profile && expenseData) {
        const thisMonth = new Date().getMonth();
        const monthExpenses = expenses.filter(e => new Date(e.date).getMonth() === thisMonth);
        const monthlySpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0) + parseFloat(amount);

        const roastResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-roast`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: parseFloat(amount),
              description,
              category: categoryName,
              persona: profile.ai_persona,
              monthlyIncome: profile.monthly_income,
              monthlySpent,
            }),
          }
        );

        if (roastResponse.ok) {
          const roast = await roastResponse.json();
          setRoastMessage(roast);

          await supabase.from('ai_roasts').insert({
            user_id: profile.id,
            expense_id: expenseData.id,
            message: roast.message,
            type: roast.type,
          });

          setTimeout(() => {
            setRoastMessage(null);
            onExpenseAdded();
            setAmount('');
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
            setSelectedCategory('');
            onClose();
          }, 4000);
        } else {
          onExpenseAdded();
          setAmount('');
          setDescription('');
          setDate(new Date().toISOString().split('T')[0]);
          setSelectedCategory('');
          onClose();
        }
      } else {
        onExpenseAdded();
        setAmount('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setSelectedCategory('');
        onClose();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  };

  if (roastMessage) {
    const getBgColor = () => {
      switch (roastMessage.type) {
        case 'roast': return 'from-red-500 to-orange-500';
        case 'hype': return 'from-emerald-500 to-cyan-500';
        case 'warning': return 'from-yellow-500 to-orange-500';
        default: return 'from-purple-500 to-pink-500';
      }
    };

    const getEmoji = () => {
      switch (roastMessage.type) {
        case 'roast': return '🔥';
        case 'hype': return '🚀';
        case 'warning': return '⚠️';
        default: return '💭';
      }
    };

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-bounce-in">
          <div className={`text-6xl text-center mb-4`}>{getEmoji()}</div>
          <div className={`bg-gradient-to-r ${getBgColor()} p-6 rounded-2xl text-white text-center`}>
            <p className="text-lg font-semibold">{roastMessage.message}</p>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">Closing in a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What did you spend on?
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., Coffee at Starbucks"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <input
              type="checkbox"
              id="useAI"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <label htmlFor="useAI" className="flex items-center gap-2 text-sm font-medium text-purple-900 cursor-pointer">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Let AI categorize this for me
            </label>
          </div>

          {!useAI && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition ${
                      selectedCategory === category.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="text-sm font-medium truncate">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Expense (+5 pts)'}
          </button>
        </form>
      </div>
    </div>
  );
}
