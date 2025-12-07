import { useMemo } from 'react';
import { Trash2, Sparkles } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';

export function ExpenseList() {
  const { expenses, categories, deleteExpense } = useExpenses();

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, typeof expenses> = {};

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const key = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(expense);
    });

    return Object.entries(groups).map(([date, expenses]) => ({
      date,
      expenses,
      total: expenses.reduce((sum, e) => sum + e.amount, 0),
    }));
  }, [expenses]);

  const getCategoryById = (id: string) => {
    return categories.find(c => c.id === id);
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-gray-600">Start tracking your spending to see insights and earn rewards!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedExpenses.map(group => (
        <div key={group.date} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{group.date}</h3>
            <span className="text-sm font-bold text-gray-900">${group.total.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            {group.expenses.map(expense => {
              const category = getCategoryById(expense.category_id);
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${category?.color}20` }}
                  >
                    {category?.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                      {expense.is_ai_categorized && (
                        <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{category?.name}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
