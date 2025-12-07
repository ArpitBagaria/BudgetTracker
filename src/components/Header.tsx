import { LogOut, Flame, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../hooks/useGamification';

export function Header() {
  const { signOut } = useAuth();
  const { profile, getPointsForNextLevel, getPointsInCurrentLevel } = useGamification();

  if (!profile) return null;

  const pointsInLevel = getPointsInCurrentLevel(profile.total_points);
  const pointsNeeded = getPointsForNextLevel(profile.current_level);
  const progress = (pointsInLevel / pointsNeeded) * 100;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{profile.display_name}</h2>
              <p className="text-sm text-gray-500">@{profile.username}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-orange-600 font-medium">Streak</p>
                <p className="text-lg font-bold text-orange-600">{profile.current_streak} days</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl">
              <Award className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-700 font-medium">Level {profile.current_level}</p>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-emerald-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold">{pointsInLevel}/{pointsNeeded}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-cyan-50 px-4 py-2 rounded-xl">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              <div>
                <p className="text-xs text-cyan-600 font-medium">Total Points</p>
                <p className="text-lg font-bold text-cyan-600">{profile.total_points.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        <div className="md:hidden mt-4 grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-xl">
            <Flame className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-xs text-orange-600 font-medium">Streak</p>
              <p className="text-sm font-bold text-orange-600">{profile.current_streak}d</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl">
            <Award className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-xs text-emerald-700 font-medium">Level</p>
              <p className="text-sm font-bold text-emerald-600">{profile.current_level}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-cyan-50 px-3 py-2 rounded-xl">
            <TrendingUp className="w-4 h-4 text-cyan-600" />
            <div>
              <p className="text-xs text-cyan-600 font-medium">Points</p>
              <p className="text-sm font-bold text-cyan-600">{profile.total_points}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
