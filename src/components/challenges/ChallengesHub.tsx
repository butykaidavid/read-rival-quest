import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Users, 
  Clock, 
  Target, 
  Flame,
  BookOpen,
  Heart,
  Zap,
  Star,
  Calendar,
  Plus,
  Check
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Confetti from 'react-confetti';

interface Challenge {
  id: string;
  title: string;
  description?: string;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  reward_points: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  genres: string[];
  booktok_themed: boolean;
  is_featured: boolean;
  is_public: boolean;
  max_participants?: number;
  created_by?: string;
  created_at: string;
  participant_count?: number;
  user_participation?: {
    progress_value: number;
    progress_percentage: number;
    completed: boolean;
    completion_date?: string;
  };
}

export function ChallengesHub() {
  const [filter, setFilter] = useState<'all' | 'featured' | 'romance' | 'fantasy'>('all');
  const [showConfetti, setShowConfetti] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['challenges', filter],
    queryFn: async () => {
      let query = supabase
        .from('challenges')
        .select('*')
        .eq('is_public', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (filter === 'featured') {
        query = query.eq('is_featured', true);
      } else if (filter === 'romance') {
        query = query.contains('genres', ['romance']);
      } else if (filter === 'fantasy') {
        query = query.contains('genres', ['fantasy']);
      }

      const { data: challengesData, error } = await query;
      if (error) {
        console.error('Error fetching challenges:', error);
        throw error;
      }

      // Get user participation data separately if user is logged in
      let participationData: any[] = [];
      if (user && challengesData) {
        const { data: participations } = await supabase
          .from('challenge_participants')
          .select('*')
          .eq('user_id', user.id)
          .in('challenge_id', challengesData.map(c => c.id));
        
        participationData = participations || [];
      }

      return challengesData?.map(challenge => ({
        ...challenge,
        participant_count: Math.floor(Math.random() * 2000) + 100, // Mock for now
        user_participation: participationData.find((p: any) => p.challenge_id === challenge.id)
      })) || [];
    }
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // Check if already participating
      const { data: existing } = await supabase
        .from('challenge_participants')
        .select('id')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        throw new Error('Already participating in this challenge');
      }
      
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          progress_value: 0,
          progress_percentage: 0,
          completed: false,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      toast({
        title: "Challenge joined! 🎉",
        description: "You've successfully joined the challenge. Good luck!",
      });
      
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to join challenge",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getDifficultyBadgeVariant = (level: string) => {
    switch (level) {
      case 'easy': return 'secondary';
      case 'medium': return 'outline';
      case 'hard': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-warning" />
          Reading Challenges
        </h2>
        <p className="text-muted-foreground">
          Compete with thousands of readers worldwide in genre-specific challenges
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { key: 'all', label: 'All Challenges', icon: Target },
          { key: 'featured', label: 'Featured', icon: Star },
          { key: 'romance', label: 'Romance', icon: Heart },
          { key: 'fantasy', label: 'Fantasy', icon: Zap },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as any)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Challenges Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges?.map((challenge) => {
            const daysLeft = getDaysLeft(challenge.end_date);
            const isParticipating = !!challenge.user_participation;
            const isCompleted = challenge.user_participation?.completed;
            
            return (
              <Card key={challenge.id} className={`overflow-hidden ${isCompleted ? 'ring-2 ring-success' : ''}`}>
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
                        {challenge.title}
                        {challenge.is_featured && (
                          <Star className="h-4 w-4 text-warning fill-current" />
                        )}
                        {isCompleted && (
                          <Check className="h-4 w-4 text-success" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={getDifficultyBadgeVariant(challenge.difficulty_level) as any}>
                          {challenge.difficulty_level}
                        </Badge>
                        {challenge.booktok_themed && (
                          <Badge variant="secondary">BookTok</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardDescription className="line-clamp-3">
                    {challenge.description}
                  </CardDescription>

                  {/* Challenge Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Target className="h-4 w-4" />
                        Goal: {challenge.target_value} {challenge.target_unit}
                      </div>
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="h-4 w-4" />
                        {challenge.reward_points} pts
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {challenge.participant_count} joined
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {daysLeft} days left
                      </div>
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1">
                    {challenge.genres.map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs">
                        {genre === 'romance' && <Heart className="h-3 w-3 mr-1" />}
                        {genre === 'fantasy' && <Zap className="h-3 w-3 mr-1" />}
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress (if participating) */}
                  {isParticipating && challenge.user_participation && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Your Progress</span>
                        <span>{challenge.user_participation.progress_percentage}%</span>
                      </div>
                      <Progress value={challenge.user_participation.progress_percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {challenge.user_participation.progress_value} / {challenge.target_value} {challenge.target_unit}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    {isCompleted ? (
                      <Button className="w-full" disabled>
                        <Check className="h-4 w-4 mr-2" />
                        Completed! 🎉
                      </Button>
                    ) : isParticipating ? (
                      <Button variant="outline" className="w-full">
                        <Flame className="h-4 w-4 mr-2" />
                        Continue Challenge
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          if (!user) {
                            toast({
                              title: "Sign in required",
                              description: "Please sign in to join challenges.",
                              variant: "destructive",
                            });
                            return;
                          }
                          joinChallengeMutation.mutate(challenge.id);
                        }}
                        disabled={joinChallengeMutation.isPending}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Join Challenge
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Custom Challenge CTA */}
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Want to create your own challenge?</h3>
              <p className="text-sm text-muted-foreground">
                Premium users can create custom challenges for friends and book clubs
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}