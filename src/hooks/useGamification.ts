import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from './useUserProfile';

export function useGamification() {
  const { user } = useAuth();
  const { profile, updateProfile } = useUserProfile();

  const calculateLevel = (points: number): number => {
    return Math.floor(points / 100) + 1;
  };

  const getPointsForNextLevel = (currentLevel: number): number => {
    return currentLevel * 100;
  };

  const getPointsInCurrentLevel = (totalPoints: number): number => {
    return totalPoints % 100;
  };

  const addPoints = async (points: number, reason: string) => {
    if (!user || !profile) return;

    const newTotalPoints = profile.total_points + points;
    const newLevel = calculateLevel(newTotalPoints);

    await updateProfile({
      total_points: newTotalPoints,
      current_level: newLevel,
    });

    return { newTotalPoints, newLevel, leveledUp: newLevel > profile.current_level };
  };

  const updateStreak = async () => {
    if (!user || !profile) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = profile.last_activity_date;

    if (lastActivity === today) {
      return { streakIncreased: false, currentStreak: profile.current_streak };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = profile.current_streak;
    let streakIncreased = false;

    if (lastActivity === yesterdayStr) {
      newStreak = profile.current_streak + 1;
      streakIncreased = true;
    } else if (lastActivity !== today) {
      newStreak = 1;
    }

    const newBestStreak = Math.max(newStreak, profile.best_streak);

    await updateProfile({
      current_streak: newStreak,
      best_streak: newBestStreak,
      last_activity_date: today,
    });

    if (streakIncreased && newStreak > 1) {
      await addPoints(10, `${newStreak} day streak!`);
    }

    return { streakIncreased, currentStreak: newStreak };
  };

  const checkAndAwardAchievements = async (expenseCount: number, goalCount: number) => {
    if (!user) return;

    const { data: achievements } = await supabase
      .from('achievements')
      .select('*');

    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
    const newAchievements = [];

    for (const achievement of achievements || []) {
      if (earnedIds.has(achievement.id)) continue;

      let shouldAward = false;

      if (achievement.requirement_type === 'expenses_logged' && expenseCount >= achievement.requirement_value) {
        shouldAward = true;
      } else if (achievement.requirement_type === 'streak' && profile && profile.current_streak >= achievement.requirement_value) {
        shouldAward = true;
      } else if (achievement.requirement_type === 'goals_created' && goalCount >= achievement.requirement_value) {
        shouldAward = true;
      }

      if (shouldAward) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
          });

        await addPoints(achievement.points_reward, `Achievement unlocked: ${achievement.name}`);
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  };

  return {
    profile,
    calculateLevel,
    getPointsForNextLevel,
    getPointsInCurrentLevel,
    addPoints,
    updateStreak,
    checkAndAwardAchievements,
  };
}
