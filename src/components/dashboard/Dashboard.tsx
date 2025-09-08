import { useAuth } from '@/hooks/useAuth';
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

export function Dashboard() {
  const { user } = useAuth();

  // Mock data for now - this will come from Supabase later
  const stats = {
    booksRead: 12,
    pagesRead: 3420,
    currentStreak: 7,
    totalPoints: 2850,
    readingGoal: 50,
    weeklyPages: 285
  };

  const recentBooks = [
    { title: "Fourth Wing", author: "Rebecca Yarros", progress: 75, genre: "Fantasy" },
    { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", progress: 100, genre: "Romance" },
    { title: "Iron Flame", author: "Rebecca Yarros", progress: 45, genre: "Fantasy" }
  ];

  const activeChallenges = [
    { title: "Dragon Fantasy Marathon", progress: 60, target: "Read 5 dragon-themed books", daysLeft: 12 },
    { title: "Romance Reading Sprint", progress: 80, target: "1000 pages in 30 days", daysLeft: 8 },
    { title: "BookTok Trending", progress: 25, target: "Complete 3 viral books", daysLeft: 20 }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.user_metadata?.display_name || 'Reader'}! 📚
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
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Book
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBooks.map((book, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">{book.title}</p>
                        <Badge variant={book.genre === 'Romance' ? 'secondary' : 'default'} className="text-xs">
                          {book.genre === 'Romance' && <Heart className="h-3 w-3 mr-1" />}
                          {book.genre === 'Fantasy' && <Zap className="h-3 w-3 mr-1" />}
                          {book.genre}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={book.progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground">{book.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
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
                {activeChallenges.map((challenge, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{challenge.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {challenge.daysLeft}d
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{challenge.target}</p>
                    <Progress value={challenge.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{challenge.progress}% complete</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
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
              <Button className="w-full justify-start gap-2" variant="outline">
                <Users className="h-4 w-4" />
                Join Book Club
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <Trophy className="h-4 w-4" />
                View Leaderboards
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
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