import { useState } from 'react';
import { Plus, Target, TrendingUp, Trash2 } from 'lucide-react';
import { useSavingsGoals } from '../hooks/useSavingsGoals';

const EMOJI_OPTIONS = ['🎮', '🎯', '✈️', '🏠', '🚗', '💻', '📱', '🎓', '💍', '🎸'];

export function SavingsGoals() {
  const { goals, addGoal, addProgress, deleteGoal } = useSavingsGoals();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    deadline: '',
    emoji: '🎯',
  });
  const [progressAmount, setProgressAmount] = useState('');

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    await addGoal({
      title: newGoal.title,
      target_amount: parseFloat(newGoal.target_amount),
      deadline: newGoal.deadline || undefined,
      emoji: newGoal.emoji,
    });
    setNewGoal({ title: '', target_amount: '', deadline: '', emoji: '🎯' });
    setShowAddModal(false);
  };

  const handleAddProgress = async (goalId: string) => {
    if (!progressAmount) return;
    await addProgress(goalId, parseFloat(progressAmount));
    setProgressAmount('');
    setShowProgressModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Goal</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Set your first goal</h3>
          <p className="text-gray-600 mb-4">Start saving for something special!</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition"
          >
            <Plus className="w-5 h-5" />
            Add Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition ${
                  goal.is_completed ? 'border-emerald-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{goal.emoji}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{goal.title}</h3>
                      {daysLeft !== null && daysLeft > 0 && (
                        <p className="text-sm text-gray-500">{daysLeft} days left</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ${goal.current_amount.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">of ${goal.target_amount.toFixed(2)}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{progress.toFixed(0)}% complete</p>
                </div>

                {!goal.is_completed && (
                  <button
                    onClick={() => setShowProgressModal(goal.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-100 transition"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Add Progress
                  </button>
                )}
                {goal.is_completed && (
                  <div className="text-center py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-xl">
                    Goal Completed!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">New Savings Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose an emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewGoal({ ...newGoal, emoji })}
                      className={`text-3xl p-2 rounded-xl border-2 transition ${
                        newGoal.emoji === emoji ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., New Laptop"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (Optional)</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Add Progress</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Add</label>
                <input
                  type="number"
                  step="0.01"
                  value={progressAmount}
                  onChange={(e) => setProgressAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowProgressModal(null);
                    setProgressAmount('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddProgress(showProgressModal)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
