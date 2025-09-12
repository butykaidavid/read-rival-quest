import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Users, 
  Clock, 
  Flame,
  Heart,
  Zap,
  Star,
  TrendingUp,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RealDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });

  // Fetch user books
  const { data: userBooks = [] } = useQuery({
    queryKey: ['user-books', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_books')
        .select(`
          *,
          books!inner(*)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching user books:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  // Fetch active challenges
  const { data: activeChallenges = [] } = useQuery({
    queryKey: ['active-challenges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          challenges!inner(*)
        `)
        .eq('user_id', user.id)
        .eq('completed', false)
        .limit(3);

      if (error) {
        console.error('Error fetching challenges:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  // Calculate stats from real data
  const stats = {
    booksRead: profile?.total_books_read || 0,
    pagesRead: profile?.total_pages_read || 0,
    currentStreak: profile?.current_streak || 0,
    totalPoints: profile?.total_points || 0,
    readingGoal: profile?.reading_goal_weekly ? profile.reading_goal_weekly * 52 / 7 : 50, // Convert weekly to yearly
    weeklyPages: profile?.reading_goal_weekly || 210
  };

  // Get currently reading books
  const currentlyReading = userBooks
    .filter(ub => ub.status === 'currently_reading')
    .slice(0, 3);

  // Get completed books
  const completedBooks = userBooks.filter(ub => ub.status === 'completed');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.display_name || user?.user_metadata?.display_name || 'Reader'}! 📚
        </h1>
        <p className="text-muted-foreground">
          Ready to dominate today's reading challenges?
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <div className="text-2xl font-bold">{stats.booksRead}</div>
              <p className="text-sm text-muted-foreground">Books Read</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-2">
              <Flame className="h-8 w-8 text-accent" />
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-2">
              <Star className="h-8 w-8 text-warning" />
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-8 w-8 text-success" />
              <div className="text-2xl font-bold">{stats.pagesRead}</div>
              <p className="text-sm text-muted-foreground">Pages Read</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Reading Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Annual Reading Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                2025 Reading Goal
              </CardTitle>
              <CardDescription>
                {stats.booksRead} of {stats.readingGoal} books completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round((stats.booksRead / stats.readingGoal) * 100)}%</span>
                </div>
                <Progress value={(stats.booksRead / stats.readingGoal) * 100} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  You're {stats.booksRead >= stats.readingGoal / 12 ? 'ahead of' : 'behind'} schedule! 
                  Keep up the great work! 🎉
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Currently Reading */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Currently Reading
                </CardTitle>
                <CardDescription>Your active books</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => navigate('/books')}
              >
                <Plus className="h-4 w-4" />
                Add Book
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentlyReading.length > 0 ? (
                  currentlyReading.map((userBook: any) => (
                    <div key={userBook.id} className="flex items-center space-x-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">{userBook.books?.title || 'Unknown Title'}</p>
                          {userBook.books?.genres?.includes('Romance') && (
                            <Badge variant="secondary" className="text-xs">
                              <Heart className="h-3 w-3 mr-1" />
                              Romance
                            </Badge>
                          )}
                          {userBook.books?.genres?.includes('Fantasy') && (
                            <Badge variant="default" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Fantasy
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {userBook.books?.authors?.join(', ') || 'Unknown Author'}
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress value={userBook.progress_percentage || 0} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(userBook.progress_percentage || 0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No books currently being read</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => navigate('/books')}
                    >
                      Find Books to Read
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Active Challenges
              </CardTitle>
              <CardDescription>Compete and earn rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeChallenges.length > 0 ? (
                  activeChallenges.map((participation: any) => {
                    const challenge = participation.challenges;
                    const daysLeft = challenge?.end_date ? Math.ceil(
                      (new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    ) : 0;
                    
                    return (
                      <div key={participation.id} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium">{challenge?.title || 'Unknown Challenge'}</h4>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {daysLeft}d
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{challenge?.description || 'No description'}</p>
                        <Progress value={participation.progress_percentage || 0} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {Math.round(participation.progress_percentage || 0)}% complete
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No active challenges</p>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/challenges')}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  View All Challenges
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start gap-2" 
                variant="outline"
                onClick={() => navigate('/community')}
              >
                <Users className="h-4 w-4" />
                Join Book Club
              </Button>
              <Button 
                className="w-full justify-start gap-2" 
                variant="outline"
                onClick={() => navigate('/leaderboards')}
              >
                <Trophy className="h-4 w-4" />
                View Leaderboards
              </Button>
              <Button 
                className="w-full justify-start gap-2" 
                variant="outline"
                onClick={() => navigate('/challenges')}
              >
                <Target className="h-4 w-4" />
                Daily Quest
              </Button>
              <Button className="w-full justify-start gap-2" variant="secondary">
                <Star className="h-4 w-4" />
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}