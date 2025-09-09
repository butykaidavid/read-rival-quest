import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Target, 
  Flame, 
  Trophy, 
  Star,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  Crown,
  Heart,
  Users,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Confetti from 'react-confetti';

interface DashboardStats {
  totalBooksRead: number;
  totalPagesRead: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  currentlyReading: number;
  completedThisWeek: number;
  completedThisMonth: number;
  averageRating: number;
  favoriteGenres: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  badge_icon: string;
  badge_color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at?: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  target_value: number;
  progress_value: number;
  reward_points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  expires_at: string;
  completed: boolean;
}

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState('');

  // Fetch user profile and stats
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error('No user');
      
      // Get basic stats from profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('total_books_read, total_pages_read, current_streak, longest_streak, total_points, favorite_genres')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get reading progress
      const { data: currentlyReading } = await supabase
        .from('user_books')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'currently_reading');

      // Get completed books this week/month
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { data: completedWeek } = await supabase
        .from('user_books')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('end_date', oneWeekAgo.toISOString().split('T')[0]);

      const { data: completedMonth } = await supabase
        .from('user_books')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('end_date', oneMonthAgo.toISOString().split('T')[0]);

      // Calculate average rating
      const { data: ratings } = await supabase
        .from('user_books')
        .select('personal_rating')
        .eq('user_id', user.id)
        .not('personal_rating', 'is', null);

      const avgRating = ratings && ratings.length > 0 
        ? ratings.reduce((acc, book) => acc + (book.personal_rating || 0), 0) / ratings.length
        : 0;

      return {
        totalBooksRead: profileData?.total_books_read || 0,
        totalPagesRead: profileData?.total_pages_read || 0,
        currentStreak: profileData?.current_streak || 0,
        longestStreak: profileData?.longest_streak || 0,
        totalPoints: profileData?.total_points || 0,
        currentlyReading: currentlyReading?.length || 0,
        completedThisWeek: completedWeek?.length || 0,
        completedThisMonth: completedMonth?.length || 0,
        averageRating: Math.round(avgRating * 10) / 10,
        favoriteGenres: profileData?.favorite_genres || [],
      };
    },
    enabled: !!user,
  });

  // Fetch recent achievements
  const { data: recentAchievements = [] } = useQuery({
    queryKey: ['recent-achievements', user?.id],
    queryFn: async (): Promise<Achievement[]> => {
      if (!user) return [];
      
      // For now, return mock data since we need to set up the relationship
      return [
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first book',
          badge_icon: 'trophy',
          badge_color: '#FFD700',
          rarity: 'common' as const,
          earned_at: new Date().toISOString(),
        }
      ];
    },
    enabled: !!user,
  });

  // Fetch daily quests  
  const { data: dailyQuests = [] } = useQuery({
    queryKey: ['daily-quests', user?.id],
    queryFn: async (): Promise<Quest[]> => {
      if (!user) return [];
      
      // Mock daily quests for now
      return [
        {
          id: '1',
          title: 'Daily Reading Goal',
          description: 'Read 30 pages today',
          target_value: 30,
          progress_value: 12,
          reward_points: 10,
          difficulty: 'easy' as const,
          expires_at: new Date().toISOString(),
          completed: false,
        },
        {
          id: '2',
          title: 'Romance Reader',
          description: 'Start a romance book today',
          target_value: 1,
          progress_value: 0,
          reward_points: 15,
          difficulty: 'medium' as const,
          expires_at: new Date().toISOString(),
          completed: false,
        }
      ];
    },
    enabled: !!user,
  });

  // Fetch motivational quote
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('https://api.quotable.io/random?tags=motivational|inspirational&minLength=50&maxLength=150');
        const data = await response.json();
        setMotivationalQuote(`"${data.content}" - ${data.author}`);
      } catch (error) {
        setMotivationalQuote('"A reader lives a thousand lives before he dies. The man who never reads lives only one." - George R.R. Martin');
      }
    };
    
    fetchQuote();
  }, []);

  const completeQuest = async (questId: string) => {
    if (!user) return;
    
    try {
      // For now, just show celebration - implement database logic later
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      toast({
        title: "Quest Completed! 🎉",
        description: "You've earned points and are one step closer to your reading goals!",
      });
      
    } catch (error) {
      console.error('Error completing quest:', error);
      toast({
        title: "Error",
        description: "Failed to complete quest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-slate-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Welcome Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3">
          <Avatar className="h-16 w-16 border-4 border-primary/20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
              {profile?.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome back, {profile?.display_name || 'Reader'}!
            </h1>
            {profile?.subscription_tier === 'premium' && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
                <Crown className="h-3 w-3 mr-1" />
                Premium Member
              </Badge>
            )}
          </div>
        </div>
        
        {motivationalQuote && (
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground italic">{motivationalQuote}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Books Read</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.totalBooksRead || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-full">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pages Read</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.totalPagesRead || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-full">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.currentStreak || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-full">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.totalPoints || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Quests */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Daily Quests
            </CardTitle>
            <CardDescription>Complete quests to earn points and maintain your streak!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dailyQuests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No active quests for today. Check back tomorrow!</p>
            ) : (
              dailyQuests.map((quest) => (
                <div key={quest.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{quest.title}</h3>
                        <Badge className={getDifficultyColor(quest.difficulty)}>
                          {quest.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{quest.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{quest.reward_points} pts</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{quest.progress_value}/{quest.target_value}</span>
                    </div>
                    <Progress 
                      value={(quest.progress_value / quest.target_value) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  {quest.completed ? (
                    <Badge className="bg-green-500 text-white">
                      <Trophy className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  ) : quest.progress_value >= quest.target_value ? (
                    <Button 
                      size="sm" 
                      onClick={() => completeQuest(quest.id)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      <Trophy className="h-4 w-4 mr-1" />
                      Claim Reward
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      In Progress
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Achievements & Quick Stats */}
        <div className="space-y-6">
          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAchievements.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No achievements yet. Keep reading to unlock them!</p>
              ) : (
                recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-background to-primary/5">
                    <div className={`p-2 rounded-full ${getRarityColor(achievement.rarity)}`}>
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {achievement.rarity}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Books Completed</span>
                <span className="font-bold">{stats?.completedThisMonth || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Currently Reading</span>
                <span className="font-bold">{stats?.currentlyReading || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Rating</span>
                <span className="font-bold flex items-center gap-1">
                  {stats?.averageRating || 0}
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </span>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Favorite Genres</p>
                <div className="flex flex-wrap gap-1">
                  {stats?.favoriteGenres?.slice(0, 3).map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  )) || <span className="text-xs text-muted-foreground">None yet</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Prompt for Free Users */}
          {profile?.subscription_tier === 'free' && (
            <Card className="border-gradient-to-r from-yellow-200 to-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-1">Upgrade to Premium</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Unlock unlimited books, advanced analytics, and exclusive features!
                </p>
                <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white">
                  <Crown className="h-4 w-4 mr-1" />
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;