import { useState, useEffect } from 'react';
import { Award, Trophy, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
  requirement_type: string;
  requirement_value: number;
  tier: string;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
}

export function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    const [achievementsRes, userAchievementsRes] = await Promise.all([
      supabase.from('achievements').select('*').order('points_reward'),
      supabase.from('user_achievements').select('*').eq('user_id', user!.id),
    ]);

    if (!achievementsRes.error) {
      setAchievements(achievementsRes.data || []);
    }

    if (!userAchievementsRes.error) {
      setUserAchievements(userAchievementsRes.data || []);
    }

    setLoading(false);
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-orange-400 to-orange-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-cyan-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTierBorder = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'border-orange-500';
      case 'silver': return 'border-gray-400';
      case 'gold': return 'border-yellow-500';
      case 'platinum': return 'border-cyan-500';
      default: return 'border-gray-400';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading achievements...</div>;
  }

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Achievements</h2>
            <p className="text-yellow-100">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <Trophy className="w-12 h-12" />
          </div>
        </div>
        <div className="mt-4 h-3 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(achievement => {
          const unlocked = isUnlocked(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`relative rounded-2xl p-6 border-2 transition transform hover:scale-105 ${
                unlocked
                  ? `bg-gradient-to-br ${getTierColor(achievement.tier)} text-white ${getTierBorder(achievement.tier)}`
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              {!unlocked && (
                <div className="absolute top-4 right-4">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
              )}

              <div className={`text-4xl mb-3 ${unlocked ? 'filter-none' : 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>

              <h3 className={`font-bold text-lg mb-2 ${unlocked ? 'text-white' : 'text-gray-900'}`}>
                {achievement.name}
              </h3>

              <p className={`text-sm mb-3 ${unlocked ? 'text-white/90' : 'text-gray-600'}`}>
                {achievement.description}
              </p>

              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1 ${unlocked ? 'text-white' : 'text-gray-700'}`}>
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-semibold">{achievement.points_reward} pts</span>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  unlocked ? 'bg-white/25' : 'bg-gray-200 text-gray-700'
                }`}>
                  {achievement.tier.toUpperCase()}
                </span>
              </div>

              {unlocked && (
                <div className="mt-3 pt-3 border-t border-white/30">
                  <p className="text-xs text-white/80">
                    Unlocked {new Date(
                      userAchievements.find(ua => ua.achievement_id === achievement.id)?.earned_at || ''
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
