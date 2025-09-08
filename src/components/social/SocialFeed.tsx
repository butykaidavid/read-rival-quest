import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  BookOpen,
  Trophy,
  Star,
  Zap,
  Pin,
  MoreHorizontal,
  Send,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface SocialPost {
  id: string;
  user_id: string;
  post_type: 'review' | 'achievement' | 'progress' | 'challenge_completion';
  content: string;
  image_url?: string;
  book_id?: string;
  achievement_id?: string;
  challenge_id?: string;
  hashtags: string[];
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  visibility: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
  user_profile?: {
    username: string;
    display_name: string;
    avatar_url?: string;
    current_streak: number;
    total_points: number;
  };
  book?: {
    title: string;
    authors: string[];
    cover_url?: string;
    genres: string[];
  };
  user_liked?: boolean;
  recent_comments?: Array<{
    id: string;
    content: string;
    user_profile: {
      username: string;
      display_name: string;
      avatar_url?: string;
    };
    created_at: string;
  }>;
}

const mockPosts: SocialPost[] = [
  {
    id: '1',
    user_id: '1',
    post_type: 'achievement',
    content: 'Just completed the Dragon Fantasy Marathon! 🐉 Five amazing books in one month - totally worth it! #DragonFantasy #ReadingGoals',
    hashtags: ['DragonFantasy', 'ReadingGoals', 'BookTok'],
    likes_count: 42,
    comments_count: 8,
    is_pinned: false,
    visibility: 'public',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user_profile: {
      username: 'bookworm_queen',
      display_name: 'Emma Johnson',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b2e66e1a?w=150&h=150&fit=crop&crop=face',
      current_streak: 15,
      total_points: 12450
    },
    user_liked: false,
    recent_comments: [
      {
        id: '1',
        content: 'Amazing! Which book was your favorite?',
        user_profile: {
          username: 'dragon_rider_sam',
          display_name: 'Sam Chen',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        },
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: '2',
    user_id: '2',
    post_type: 'review',
    content: 'OBSESSED with Fourth Wing! 😍 The dragon bond system is everything. Violet and Xaden have me in a chokehold. Starting Iron Flame tonight! #FourthWing #RebeccaYarros #DragonRiders',
    book_id: '1',
    hashtags: ['FourthWing', 'RebeccaYarros', 'DragonRiders', 'BookTok', 'Romance'],
    likes_count: 156,
    comments_count: 23,
    is_pinned: true,
    visibility: 'public',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    user_profile: {
      username: 'romance_lover',
      display_name: 'Alice Williams',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      current_streak: 8,
      total_points: 8900
    },
    book: {
      title: 'Fourth Wing',
      authors: ['Rebecca Yarros'],
      cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=450&fit=crop',
      genres: ['Fantasy', 'Romance', 'Dragons']
    },
    user_liked: true,
    recent_comments: []
  },
  {
    id: '3',
    user_id: '3',
    post_type: 'progress',
    content: 'Week 3 of my romance reading sprint and I\'m ahead of schedule! 📚💕 Currently devouring "The Spanish Love Deception" and it\'s giving me all the enemies-to-lovers feels! #RomanceReads #BookProgress',
    hashtags: ['RomanceReads', 'BookProgress', 'EnemiesToLovers'],
    likes_count: 67,
    comments_count: 12,
    is_pinned: false,
    visibility: 'public',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    user_profile: {
      username: 'booktok_star',
      display_name: 'Maya Patel',
      current_streak: 5,
      total_points: 7800
    },
    user_liked: false,
    recent_comments: []
  }
];

export function SocialFeed() {
  const [filter, setFilter] = useState<'all' | 'romance' | 'fantasy' | 'following'>('all');
  const [newPostContent, setNewPostContent] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['social-feed', filter],
    queryFn: async () => {
      // For demo, return mock data
      // In real app, this would fetch from Supabase social_posts table
      let filtered = mockPosts;
      
      if (filter === 'romance') {
        filtered = filtered.filter(post => 
          post.hashtags.some(tag => tag.toLowerCase().includes('romance')) ||
          post.book?.genres.includes('Romance')
        );
      } else if (filter === 'fantasy') {
        filtered = filtered.filter(post => 
          post.hashtags.some(tag => 
            tag.toLowerCase().includes('fantasy') || 
            tag.toLowerCase().includes('dragon')
          ) ||
          post.book?.genres.includes('Fantasy')
        );
      }
      
      return filtered;
    }
  });

  const likePostMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error('User not authenticated');
      
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const hashtags = content.match(/#\w+/g)?.map(tag => tag.slice(1)) || [];
      
      const { error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          post_type: 'progress',
          content,
          hashtags,
          visibility: 'public',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewPostContent('');
      toast({
        title: "Post shared!",
        description: "Your post has been shared with the community.",
      });
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-warning" />;
      case 'review': return <Star className="h-4 w-4 text-primary" />;
      case 'progress': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'challenge_completion': return <Trophy className="h-4 w-4 text-accent" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'achievement': return 'Achievement Unlocked';
      case 'review': return 'Book Review';
      case 'progress': return 'Reading Progress';
      case 'challenge_completion': return 'Challenge Completed';
      default: return 'Update';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Community Feed</h2>
        <p className="text-muted-foreground">
          Share your reading journey and connect with fellow book lovers
        </p>
      </div>

      {/* Create Post */}
      {user && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user.user_metadata?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your reading progress, review a book, or celebrate an achievement... #BookTok #Romance #Fantasy"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Use hashtags to connect with other readers: #Romance #Fantasy #BookTok
                </div>
                <Button 
                  onClick={() => createPostMutation.mutate(newPostContent)}
                  disabled={!newPostContent.trim() || createPostMutation.isPending}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { key: 'all', label: 'All Posts', icon: TrendingUp },
          { key: 'romance', label: 'Romance', icon: Heart },
          { key: 'fantasy', label: 'Fantasy', icon: Zap },
          { key: 'following', label: 'Following', icon: MessageCircle },
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

      {/* Posts Feed */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community posts...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts?.map((post) => (
            <Card key={post.id} className={post.is_pinned ? 'ring-2 ring-warning/20' : ''}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Post Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={post.user_profile?.avatar_url} />
                        <AvatarFallback>
                          {post.user_profile?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">
                            {post.user_profile?.display_name}
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            @{post.user_profile?.username}
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </span>
                          {post.is_pinned && (
                            <Pin className="h-4 w-4 text-warning" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getPostTypeIcon(post.post_type)}
                          <span className="text-sm text-muted-foreground">
                            {getPostTypeLabel(post.post_type)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Book Reference */}
                  {post.book && (
                    <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <img
                        src={post.book.cover_url || '/placeholder.svg'}
                        alt={post.book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div>
                        <h5 className="font-semibold">{post.book.title}</h5>
                        <p className="text-sm text-muted-foreground">
                          {post.book.authors.join(', ')}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {post.book.genres.slice(0, 2).map((genre) => (
                            <Badge key={genre} variant="secondary" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed">{post.content}</p>
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.map((tag) => (
                          <Button
                            key={tag}
                            variant="link"
                            size="sm"
                            className="text-primary p-0 h-auto text-sm"
                          >
                            #{tag}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Post Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likePostMutation.mutate({ 
                          postId: post.id, 
                          isLiked: post.user_liked || false 
                        })}
                        className={`gap-2 ${post.user_liked ? 'text-red-500' : ''}`}
                      >
                        <Heart className={`h-4 w-4 ${post.user_liked ? 'fill-current' : ''}`} />
                        {post.likes_count}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments_count}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Recent Comments */}
                  {post.recent_comments && post.recent_comments.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-muted">
                      {post.recent_comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={comment.user_profile.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {comment.user_profile.display_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm">
                              <span className="font-semibold">
                                {comment.user_profile.display_name}
                              </span>{' '}
                              {comment.content}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}