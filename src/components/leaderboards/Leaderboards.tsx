import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Crown,
  TrendingUp,
  Users,
  Filter,
  RefreshCw,
  BookOpen,
  Heart,
  Zap,
  Star,
  Flame
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  rank_position: number;
  user_id: string;
  value: number;
  leaderboard_type: string;
  period_type: string;
  genre_filter?: string;
  calculated_at: string;
  user_profile?: {
    username: string;
    display_name: string;
    avatar_url?: string;
    current_streak: number;
    total_points: number;
  };
}

const mockLeaderboardData: LeaderboardEntry[] = [
  {
    rank_position: 1,
    user_id: '1',
    value: 2450,
    leaderboard_type: 'pages_read',
    period_type: 'weekly',
    calculated_at: new Date().toISOString(),
    user_profile: {
      username: 'bookworm_queen',
      display_name: 'Emma Johnson',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b2e66e1a?w=150&h=150&fit=crop&crop=face',
      current_streak: 15,
      total_points: 12450
    }
  },
  {
    rank_position: 2,
    user_id: '2',
    value: 2200,
    leaderboard_type: 'pages_read',
    period_type: 'weekly',
    calculated_at: new Date().toISOString(),
    user_profile: {
      username: 'dragon_rider_sam',
      display_name: 'Sam Chen',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      current_streak: 12,
      total_points: 10200
    }
  },
  {
    rank_position: 3,
    user_id: '3',
    value: 1980,
    leaderboard_type: 'pages_read',
    period_type: 'weekly',
    calculated_at: new Date().toISOString(),
    user_profile: {
      username: 'romance_lover',
      display_name: 'Alice Williams',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      current_streak: 8,
      total_points: 8900
    }
  },
  {
    rank_position: 4,
    user_id: '4',
    value: 1850,
    leaderboard_type: 'pages_read',
    period_type: 'weekly',
    calculated_at: new Date().toISOString(),
    user_profile: {
      username: 'fantasy_fanatic',
      display_name: 'Mike Davis',
      current_streak: 22,
      total_points: 15600
    }
  },
  {
    rank_position: 5,
    user_id: '5',
    value: 1720,
    leaderboard_type: 'pages_read',
    period_type: 'weekly',
    calculated_at: new Date().toISOString(),
    user_profile: {
      username: 'booktok_star',
      display_name: 'Maya Patel',
      current_streak: 5,
      total_points: 7800
    }
  }
];

export function Leaderboards() {
  const [activeTab, setActiveTab] = useState('pages');
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');
  const [genreFilter, setGenreFilter] = useState<'all' | 'romance' | 'fantasy'>('all');
  const { user } = useAuth();

  const { data: leaderboard, isLoading, refetch } = useQuery({
    queryKey: ['leaderboard', activeTab, timePeriod, genreFilter],
    queryFn: async () => {
      // For demo, return mock data
      // In real app, this would fetch from Supabase leaderboards table
      return mockLeaderboardData.map((entry, index) => ({
        ...entry,
        rank_position: index + 1,
        // Simulate different values for different metrics
        value: activeTab === 'pages' ? entry.value : 
               activeTab === 'books' ? Math.floor(entry.value / 200) :
               activeTab === 'streaks' ? entry.user_profile?.current_streak || 0 :
               entry.user_profile?.total_points || 0
      }));
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const getCurrentUserRank = () => {
    if (!user || !leaderboard) return null;
    return leaderboard.find(entry => entry.user_id === user.id);
  };

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="h-5 w-5 text-warning" />;
    if (position === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (position === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
  };

  const getMetricLabel = (type: string) => {
    switch (type) {
      case 'pages': return 'Pages Read';
      case 'books': return 'Books Completed';
      case 'streaks': return 'Reading Streak';
      case 'points': return 'Total Points';
      default: return 'Score';
    }
  };

  const getMetricSuffix = (type: string) => {
    switch (type) {
      case 'pages': return 'pages';
      case 'books': return 'books';
      case 'streaks': return 'days';
      case 'points': return 'pts';
      default: return '';
    }
  };

  const userRank = getCurrentUserRank();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-warning" />
          Leaderboards
        </h2>
        <p className="text-muted-foreground">
          Compete with readers worldwide and climb the rankings
        </p>
      </div>

      {/* User's Current Rank */}
      {user && userRank && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={userRank.user_profile?.avatar_url} />
                  <AvatarFallback>
                    {userRank.user_profile?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Your Ranking</h3>
                  <p className="text-sm text-muted-foreground">
                    {userRank.user_profile?.display_name || 'You'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {getRankIcon(userRank.rank_position)}
                  <span className="text-lg font-bold">
                    {userRank.value.toLocaleString()} {getMetricSuffix(activeTab)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Rank #{userRank.rank_position}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Time Period Filter */}
        <div className="flex gap-2">
          {[
            { key: 'weekly', label: 'This Week' },
            { key: 'monthly', label: 'This Month' },
            { key: 'all-time', label: 'All Time' },
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={timePeriod === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod(key as any)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Genre Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { key: 'all', label: 'All Genres', icon: TrendingUp },
          { key: 'romance', label: 'Romance', icon: Heart },
          { key: 'fantasy', label: 'Fantasy', icon: Zap },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={genreFilter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGenreFilter(key as any)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pages" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="books" className="gap-2">
            <Trophy className="h-4 w-4" />
            Books
          </TabsTrigger>
          <TabsTrigger value="streaks" className="gap-2">
            <Flame className="h-4 w-4" />
            Streaks
          </TabsTrigger>
          <TabsTrigger value="points" className="gap-2">
            <Star className="h-4 w-4" />
            Points
          </TabsTrigger>
        </TabsList>

        {['pages', 'books', 'streaks', 'points'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{getMetricLabel(tab)} - {timePeriod.replace('-', ' ')}</span>
                  <Badge variant="secondary">
                    Live Updates
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Top readers competing in {genreFilter === 'all' ? 'all genres' : genreFilter}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading leaderboard...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard?.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          entry.user_id === user?.id ? 'bg-primary/10 border-primary/20' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(entry.rank_position)}
                          </div>
                          
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={entry.user_profile?.avatar_url} />
                            <AvatarFallback>
                              {entry.user_profile?.display_name?.charAt(0) || entry.user_profile?.username?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <h4 className="font-semibold">
                              {entry.user_profile?.display_name || entry.user_profile?.username}
                              {entry.user_id === user?.id && (
                                <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                              )}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>@{entry.user_profile?.username}</span>
                              {entry.user_profile?.current_streak && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Flame className="h-3 w-3" />
                                    {entry.user_profile.current_streak} day streak
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {entry.value.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getMetricSuffix(tab)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Premium CTA */}
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Want to compete globally?</h3>
              <p className="text-sm text-muted-foreground">
                Premium users get access to global leaderboards and exclusive competitions
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}