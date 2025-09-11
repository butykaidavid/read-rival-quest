import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, BookOpen, Trophy, Users, Target } from 'lucide-react';

const navigationItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/books', label: 'Books', icon: BookOpen },
  { path: '/challenges', label: 'Challenges', icon: Target },
  { path: '/leaderboards', label: 'Leaderboards', icon: Trophy },
  { path: '/community', label: 'Community', icon: Users },
];

export const MobileNavigation = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || 
            (path === '/dashboard' && location.pathname === '/');
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center p-2 min-w-0 flex-1 text-xs transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 mb-1",
                isActive && "text-primary"
              )} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};