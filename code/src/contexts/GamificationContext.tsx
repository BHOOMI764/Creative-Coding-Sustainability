import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'project' | 'social' | 'achievement' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: Date;
  requirements: {
    type: string;
    value: number;
    description: string;
  }[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  category: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  badges: number;
  projects: number;
  avatar?: string;
}

interface GamificationContextType {
  badges: Badge[];
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  userPoints: number;
  userLevel: number;
  nextLevelPoints: number;
  unlockedBadges: string[];
  unlockedAchievements: string[];
  checkAchievements: (action: string, value: number) => void;
  addPoints: (points: number) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [nextLevelPoints, setNextLevelPoints] = useState(100);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  useEffect(() => {
    // Initialize badges
    const initialBadges: Badge[] = [
      {
        id: 'first-project',
        name: 'First Steps',
        description: 'Created your first project',
        icon: '🎯',
        color: '#3B82F6',
        category: 'project',
        rarity: 'common',
        points: 10,
        requirements: [
          { type: 'projects_created', value: 1, description: 'Create 1 project' }
        ]
      },
      {
        id: 'social-butterfly',
        name: 'Social Butterfly',
        description: 'Received 10 likes on your projects',
        icon: '🦋',
        color: '#10B981',
        category: 'social',
        rarity: 'rare',
        points: 25,
        requirements: [
          { type: 'likes_received', value: 10, description: 'Receive 10 likes' }
        ]
      },
      {
        id: 'sdg-champion',
        name: 'SDG Champion',
        description: 'Contributed to all 17 SDGs',
        icon: '🌍',
        color: '#F59E0B',
        category: 'achievement',
        rarity: 'legendary',
        points: 100,
        requirements: [
          { type: 'sdgs_contributed', value: 17, description: 'Contribute to all 17 SDGs' }
        ]
      },
      {
        id: 'feedback-master',
        name: 'Feedback Master',
        description: 'Provided 50 pieces of feedback',
        icon: '💬',
        color: '#8B5CF6',
        category: 'social',
        rarity: 'epic',
        points: 50,
        requirements: [
          { type: 'feedback_provided', value: 50, description: 'Provide 50 feedback' }
        ]
      }
    ];

    // Initialize achievements
    const initialAchievements: Achievement[] = [
      {
        id: 'project-milestone-1',
        name: 'Project Pioneer',
        description: 'Create 5 projects',
        icon: '🚀',
        points: 50,
        progress: 0,
        maxProgress: 5,
        category: 'project'
      },
      {
        id: 'community-helper',
        name: 'Community Helper',
        description: 'Help 20 community members',
        icon: '🤝',
        points: 75,
        progress: 0,
        maxProgress: 20,
        category: 'social'
      },
      {
        id: 'sustainability-expert',
        name: 'Sustainability Expert',
        description: 'Complete 10 sustainability challenges',
        icon: '🌱',
        points: 100,
        progress: 0,
        maxProgress: 10,
        category: 'achievement'
      }
    ];

    setBadges(initialBadges);
    setAchievements(initialAchievements);

    // Initialize leaderboard
    const initialLeaderboard: LeaderboardEntry[] = [
      { rank: 1, username: 'EcoWarrior', points: 1250, badges: 12, projects: 8 },
      { rank: 2, username: 'GreenTech', points: 1100, badges: 10, projects: 6 },
      { rank: 3, username: 'SustainableDev', points: 950, badges: 8, projects: 5 },
      { rank: 4, username: 'ClimateHero', points: 800, badges: 7, projects: 4 },
      { rank: 5, username: 'FutureBuilder', points: 750, badges: 6, projects: 3 },
    ];

    setLeaderboard(initialLeaderboard);
  }, []);

  const calculateLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };

  const calculateNextLevelPoints = (level: number) => {
    return level * 100;
  };

  const addPoints = (points: number) => {
    setUserPoints(prev => {
      const newPoints = prev + points;
      const newLevel = calculateLevel(newPoints);
      setUserLevel(newLevel);
      setNextLevelPoints(calculateNextLevelPoints(newLevel));
      return newPoints;
    });
  };

  const checkAchievements = (action: string, value: number) => {
    // Check badge requirements
    badges.forEach(badge => {
      if (unlockedBadges.includes(badge.id)) return;

      const requirement = badge.requirements.find(req => req.type === action);
      if (requirement && value >= requirement.value) {
        setUnlockedBadges(prev => [...prev, badge.id]);
        addPoints(badge.points);
      }
    });

    // Check achievement progress
    setAchievements(prev => 
      prev.map(achievement => {
        if (unlockedAchievements.includes(achievement.id)) return achievement;

        let newProgress = achievement.progress;
        if (achievement.category === 'project' && action === 'projects_created') {
          newProgress = Math.min(achievement.progress + 1, achievement.maxProgress);
        } else if (achievement.category === 'social' && action === 'help_provided') {
          newProgress = Math.min(achievement.progress + 1, achievement.maxProgress);
        }

        if (newProgress >= achievement.maxProgress) {
          setUnlockedAchievements(prev => [...prev, achievement.id]);
          addPoints(achievement.points);
        }

        return { ...achievement, progress: newProgress };
      })
    );
  };

  return (
    <GamificationContext.Provider
      value={{
        badges,
        achievements,
        leaderboard,
        userPoints,
        userLevel,
        nextLevelPoints,
        unlockedBadges,
        unlockedAchievements,
        checkAchievements,
        addPoints,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
