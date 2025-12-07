import { useMemo } from 'react';
import { TrendingDown, Calendar, PieChart, Target } from 'lucide-react';
import { useExpenses, Category } from '../hooks/useExpenses';

export function DashboardStats() {
  const { expenses, categories } = useExpenses();

  const stats = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    const thisWeek = getWeekNumber(today);

    const monthExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
    });

    const weekExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return getWeekNumber(expenseDate) === thisWeek && expenseDate.getFullYear() === thisYear;
    });

    const todayExpenses = expenses.filter(e => e.date === today.toISOString().split('T')[0]);

    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const weekTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = categories.map(cat => {
      const catExpenses = monthExpenses.filter(e => e.category_id === cat.id);
      const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
      return { ...cat, total, percentage: monthTotal > 0 ? (total / monthTotal) * 100 : 0 };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

    return {
      monthTotal,
      weekTotal,
      todayTotal,
      expenseCount: expenses.length,
      categoryBreakdown,
    };
  }, [expenses, categories]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
          label="Today"
          value={`$${stats.todayTotal.toFixed(2)}`}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<TrendingDown className="w-6 h-6 text-purple-600" />}
          label="This Week"
          value={`$${stats.weekTotal.toFixed(2)}`}
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={<Target className="w-6 h-6 text-pink-600" />}
          label="This Month"
          value={`$${stats.monthTotal.toFixed(2)}`}
          bgColor="bg-pink-50"
        />
      </div>

      {stats.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-bold text-gray-900">Spending by Category</h3>
            <span className="text-sm text-gray-500 ml-auto">This Month</span>
          </div>

          <div className="space-y-3">
            {stats.categoryBreakdown.slice(0, 5).map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">${cat.total.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 ml-2">{cat.percentage.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bgColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-2xl p-6`}>
      <div className="flex items-center gap-3">
        <div className="p-3 bg-white rounded-xl shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
