import { Routes, Route } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, TrendingUp, Users, Search, Plus, Heart, Zap } from 'lucide-react';
import { BookSearch } from '@/components/books/BookSearch';
import { ChallengesHub } from '@/components/challenges/ChallengesHub';
import { Leaderboards } from '@/components/leaderboards/Leaderboards';
import { SocialFeed } from '@/components/social/SocialFeed';
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

const navigationItems: NavigationItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: TrendingUp,
    component: EnhancedDashboard,
  },
  {
    path: '/books',
    label: 'Books',
    icon: BookOpen,
    component: BookSearch,
  },
  {
    path: '/challenges',
    label: 'Challenges',
    icon: Trophy,
    component: ChallengesHub,
  },
  {
    path: '/leaderboards',
    label: 'Leaderboards',
    icon: TrendingUp,
    component: Leaderboards,
  },
  {
    path: '/community',
    label: 'Community',
    icon: Users,
    component: SocialFeed,
  },
];

export function MainContent() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <Routes>
          {navigationItems.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Routes>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 p-6 border-l bg-muted/20 space-y-6">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Search className="h-4 w-4" />
              Search Books
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              Join Challenge
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Users className="h-4 w-4" />
              Find Friends
            </Button>
          </div>
        </div>

        {/* Trending Genres */}
        <div className="space-y-4">
          <h3 className="font-semibold">Trending Genres</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-2 text-left">
              <Heart className="h-4 w-4 text-secondary" />
              <div>
                <div className="font-medium">Romance</div>
                <div className="text-xs text-muted-foreground">2.3k active readers</div>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 text-left">
              <Zap className="h-4 w-4 text-accent" />
              <div>
                <div className="font-medium">Fantasy</div>
                <div className="text-xs text-muted-foreground">1.8k active readers</div>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 text-left">
              <BookOpen className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium">BookTok Viral</div>
                <div className="text-xs text-muted-foreground">987 active readers</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Reading Stats */}
        <div className="space-y-4">
          <h3 className="font-semibold">Community Stats</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Readers</span>
              <span className="font-medium">47,392</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Books Read Today</span>
              <span className="font-medium">1,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Challenges</span>
              <span className="font-medium">156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Romance Leaders</span>
              <span className="font-medium">2,891</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fantasy Leaders</span>
              <span className="font-medium">2,156</span>
            </div>
          </div>
        </div>

        {/* Premium Upgrade */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border">
          <div className="space-y-3">
            <h4 className="font-semibold">Unlock Premium Features</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Global leaderboards</div>
              <div>• Custom challenges</div>
              <div>• Advanced analytics</div>
              <div>• Ad-free experience</div>
            </div>
            <Button size="sm" className="w-full">
              Upgrade Now - $3.99/mo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}