-- Enhanced ReadRival Database Schema
-- Drop existing tables that need updates
DROP TABLE IF EXISTS user_quest_progress CASCADE;
DROP TABLE IF EXISTS daily_quests CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS challenge_participants CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS social_posts CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS leaderboards CASCADE;
DROP TABLE IF EXISTS user_books CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS book_club_members CASCADE;
DROP TABLE IF EXISTS book_clubs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create updated profiles table with enhanced features
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  favorite_genres TEXT[] DEFAULT '{}',
  is_profile_public BOOLEAN DEFAULT true,
  theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'sepia')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_end TIMESTAMPTZ,
  total_books_read INTEGER DEFAULT 0,
  total_pages_read INTEGER DEFAULT 0,
  reading_goal_daily INTEGER DEFAULT 30,
  reading_goal_weekly INTEGER DEFAULT 210,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  last_reading_date DATE,
  referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  referred_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create books table with enhanced metadata
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  isbn_10 TEXT,
  isbn_13 TEXT,
  google_books_id TEXT,
  goodreads_id TEXT,
  description TEXT,
  cover_url TEXT,
  page_count INTEGER,
  published_date DATE,
  language TEXT DEFAULT 'en',
  genres TEXT[] DEFAULT '{}',
  booktok_tags TEXT[] DEFAULT '{}',
  average_rating DECIMAL(3,2) DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT false,
  amazon_url TEXT,
  audible_url TEXT,
  preview_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_books table for reading tracking
CREATE TABLE public.user_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  book_id UUID NOT NULL,
  status TEXT DEFAULT 'want_to_read' CHECK (status IN ('want_to_read', 'currently_reading', 'completed', 'dnf')),
  current_page INTEGER DEFAULT 0,
  total_pages INTEGER,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  reading_time_minutes INTEGER DEFAULT 0,
  audiobook_minutes_listened INTEGER DEFAULT 0,
  is_audiobook BOOLEAN DEFAULT false,
  personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
  personal_review TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('reading', 'social', 'streak', 'challenge', 'genre')),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('pages_read', 'books_completed', 'streak_days', 'points_earned', 'reviews_written', 'challenges_completed')),
  requirement_value INTEGER,
  genres TEXT[] DEFAULT '{}',
  points_reward INTEGER DEFAULT 50,
  badge_icon TEXT DEFAULT 'trophy',
  badge_color TEXT DEFAULT '#FFD700',
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_premium_only BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('pages', 'books', 'streak', 'time', 'genre')),
  target_value INTEGER NOT NULL,
  target_unit TEXT NOT NULL CHECK (target_unit IN ('pages', 'books', 'days', 'minutes')),
  genres TEXT[] DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  booktok_themed BOOLEAN DEFAULT false,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'legendary')),
  reward_points INTEGER DEFAULT 0,
  max_participants INTEGER,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create challenge_participants table
CREATE TABLE public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL,
  user_id UUID NOT NULL,
  progress_value INTEGER DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create daily_quests table
CREATE TABLE public.daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('pages', 'time', 'review', 'social', 'audiobook')),
  target_value INTEGER NOT NULL,
  reward_points INTEGER DEFAULT 10,
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  genres TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  expires_at DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_quest_progress table
CREATE TABLE public.user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL,
  user_id UUID NOT NULL,
  quest_date DATE DEFAULT CURRENT_DATE,
  progress_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(quest_id, user_id, quest_date)
);

-- Create social_posts table
CREATE TABLE public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('review', 'progress', 'achievement', 'general', 'challenge')),
  content TEXT NOT NULL,
  book_id UUID,
  challenge_id UUID,
  achievement_id UUID,
  hashtags TEXT[] DEFAULT '{}',
  image_url TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  is_anonymous BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create post_likes table
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_comment_id UUID,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create follows table
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create book_clubs table
CREATE TABLE public.book_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  club_type TEXT DEFAULT 'public' CHECK (club_type IN ('public', 'private', 'premium')),
  primary_genres TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  reading_schedule TEXT,
  member_limit INTEGER DEFAULT 50,
  current_member_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create book_club_members table
CREATE TABLE public.book_club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(club_id, user_id)
);

-- Create leaderboards table
CREATE TABLE public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('pages', 'books', 'points', 'streak')),
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly', 'all_time')),
  period_start DATE,
  period_end DATE,
  value INTEGER NOT NULL,
  rank_position INTEGER,
  genre_filter TEXT,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Create reading_sessions table for detailed tracking
CREATE TABLE public.reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  book_id UUID NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  pages_read INTEGER DEFAULT 0,
  minutes_read INTEGER DEFAULT 0,
  session_type TEXT DEFAULT 'reading' CHECK (session_type IN ('reading', 'audiobook')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('achievement', 'challenge', 'social', 'leaderboard', 'reminder')),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscriptions table for Stripe integration
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly', 'lifetime')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view public profiles" ON public.profiles
  FOR SELECT USING ((is_profile_public = true) OR (user_id = auth.uid()));

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Books policies
CREATE POLICY "Anyone can view books" ON public.books
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert books" ON public.books
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update books" ON public.books
  FOR UPDATE USING (auth.role() = 'authenticated');

-- User books policies
CREATE POLICY "Users can manage their own books" ON public.user_books
  FOR ALL USING (user_id = auth.uid());

-- Achievements policies
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert user achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- Challenges policies
CREATE POLICY "Anyone can view public challenges" ON public.challenges
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create challenges" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Challenge creators can update their challenges" ON public.challenges
  FOR UPDATE USING (created_by = auth.uid());

-- Challenge participants policies
CREATE POLICY "Users can view challenge participants" ON public.challenge_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join challenges" ON public.challenge_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" ON public.challenge_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Daily quests policies
CREATE POLICY "Anyone can view active quests" ON public.daily_quests
  FOR SELECT USING (is_active = true);

-- User quest progress policies
CREATE POLICY "Users can manage their own quest progress" ON public.user_quest_progress
  FOR ALL USING (user_id = auth.uid());

-- Social posts policies
CREATE POLICY "Users can view public posts" ON public.social_posts
  FOR SELECT USING ((visibility = 'public') OR (user_id = auth.uid()));

CREATE POLICY "Users can manage their own posts" ON public.social_posts
  FOR ALL USING (user_id = auth.uid());

-- Post likes policies
CREATE POLICY "Users can view post likes" ON public.post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON public.post_likes
  FOR ALL USING (user_id = auth.uid());

-- Post comments policies
CREATE POLICY "Users can view comments on visible posts" ON public.post_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comments" ON public.post_comments
  FOR ALL USING (user_id = auth.uid());

-- Follows policies
CREATE POLICY "Users can view follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON public.follows
  FOR ALL USING (follower_id = auth.uid());

-- Book clubs policies
CREATE POLICY "Anyone can view public book clubs" ON public.book_clubs
  FOR SELECT USING ((club_type = 'public') OR (created_by = auth.uid()));

CREATE POLICY "Users can create book clubs" ON public.book_clubs
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Club owners can update their clubs" ON public.book_clubs
  FOR UPDATE USING (created_by = auth.uid());

-- Book club members policies
CREATE POLICY "Users can view club members" ON public.book_club_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join/leave clubs" ON public.book_club_members
  FOR ALL USING (user_id = auth.uid());

-- Leaderboards policies
CREATE POLICY "Anyone can view leaderboards" ON public.leaderboards
  FOR SELECT USING (true);

CREATE POLICY "System can manage leaderboards" ON public.leaderboards
  FOR ALL USING (true);

-- Reading sessions policies
CREATE POLICY "Users can manage their own reading sessions" ON public.reading_sessions
  FOR ALL USING (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage subscriptions" ON public.subscriptions
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_books_user_id ON public.user_books(user_id);
CREATE INDEX idx_user_books_book_id ON public.user_books(book_id);
CREATE INDEX idx_user_books_status ON public.user_books(status);
CREATE INDEX idx_books_genres ON public.books USING GIN(genres);
CREATE INDEX idx_books_booktok_tags ON public.books USING GIN(booktok_tags);
CREATE INDEX idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX idx_challenges_genres ON public.challenges USING GIN(genres);
CREATE INDEX idx_leaderboards_type_period ON public.leaderboards(leaderboard_type, period_type);
CREATE INDEX idx_notifications_user_id_read ON public.notifications(user_id, is_read);

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_books_updated_at
  BEFORE UPDATE ON public.user_books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_clubs_updated_at
  BEFORE UPDATE ON public.book_clubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();