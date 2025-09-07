export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          badge_color: string | null
          badge_icon: string | null
          created_at: string
          description: string | null
          genres: string[] | null
          id: string
          is_premium_only: boolean | null
          points_reward: number | null
          rarity: string | null
          requirement_type: string
          requirement_value: number | null
          title: string
        }
        Insert: {
          achievement_type: string
          badge_color?: string | null
          badge_icon?: string | null
          created_at?: string
          description?: string | null
          genres?: string[] | null
          id?: string
          is_premium_only?: boolean | null
          points_reward?: number | null
          rarity?: string | null
          requirement_type: string
          requirement_value?: number | null
          title: string
        }
        Update: {
          achievement_type?: string
          badge_color?: string | null
          badge_icon?: string | null
          created_at?: string
          description?: string | null
          genres?: string[] | null
          id?: string
          is_premium_only?: boolean | null
          points_reward?: number | null
          rarity?: string | null
          requirement_type?: string
          requirement_value?: number | null
          title?: string
        }
        Relationships: []
      }
      book_club_members: {
        Row: {
          club_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "book_clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      book_clubs: {
        Row: {
          club_type: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string
          current_member_count: number | null
          description: string | null
          id: string
          is_active: boolean | null
          member_limit: number | null
          name: string
          primary_genres: string[] | null
          reading_schedule: string | null
          updated_at: string
        }
        Insert: {
          club_type?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          current_member_count?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          member_limit?: number | null
          name: string
          primary_genres?: string[] | null
          reading_schedule?: string | null
          updated_at?: string
        }
        Update: {
          club_type?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          current_member_count?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          member_limit?: number | null
          name?: string
          primary_genres?: string[] | null
          reading_schedule?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          authors: string[]
          average_rating: number | null
          booktok_tags: string[] | null
          cover_url: string | null
          created_at: string
          description: string | null
          genres: string[] | null
          goodreads_id: string | null
          google_books_id: string | null
          id: string
          is_trending: boolean | null
          isbn_10: string | null
          isbn_13: string | null
          language: string | null
          page_count: number | null
          published_date: string | null
          ratings_count: number | null
          title: string
          updated_at: string
        }
        Insert: {
          authors: string[]
          average_rating?: number | null
          booktok_tags?: string[] | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          genres?: string[] | null
          goodreads_id?: string | null
          google_books_id?: string | null
          id?: string
          is_trending?: boolean | null
          isbn_10?: string | null
          isbn_13?: string | null
          language?: string | null
          page_count?: number | null
          published_date?: string | null
          ratings_count?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          authors?: string[]
          average_rating?: number | null
          booktok_tags?: string[] | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          genres?: string[] | null
          goodreads_id?: string | null
          google_books_id?: string | null
          id?: string
          is_trending?: boolean | null
          isbn_10?: string | null
          isbn_13?: string | null
          language?: string | null
          page_count?: number | null
          published_date?: string | null
          ratings_count?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completion_date: string | null
          id: string
          joined_at: string
          progress_percentage: number | null
          progress_value: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completion_date?: string | null
          id?: string
          joined_at?: string
          progress_percentage?: number | null
          progress_value?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completion_date?: string | null
          id?: string
          joined_at?: string
          progress_percentage?: number | null
          progress_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          booktok_themed: boolean | null
          challenge_type: string
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          end_date: string
          genres: string[] | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          max_participants: number | null
          reward_points: number | null
          start_date: string
          target_unit: string
          target_value: number
          title: string
          updated_at: string
        }
        Insert: {
          booktok_themed?: boolean | null
          challenge_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          end_date: string
          genres?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          max_participants?: number | null
          reward_points?: number | null
          start_date: string
          target_unit: string
          target_value: number
          title: string
          updated_at?: string
        }
        Update: {
          booktok_themed?: boolean | null
          challenge_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          end_date?: string
          genres?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          max_participants?: number | null
          reward_points?: number | null
          start_date?: string
          target_unit?: string
          target_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_quests: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          expires_at: string | null
          genres: string[] | null
          id: string
          is_active: boolean | null
          quest_type: string
          reward_points: number | null
          target_value: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          expires_at?: string | null
          genres?: string[] | null
          id?: string
          is_active?: boolean | null
          quest_type: string
          reward_points?: number | null
          target_value: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          expires_at?: string | null
          genres?: string[] | null
          id?: string
          is_active?: boolean | null
          quest_type?: string
          reward_points?: number | null
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          calculated_at: string
          genre_filter: string | null
          id: string
          leaderboard_type: string
          period_end: string | null
          period_start: string | null
          period_type: string
          rank_position: number | null
          user_id: string
          value: number
        }
        Insert: {
          calculated_at?: string
          genre_filter?: string | null
          id?: string
          leaderboard_type: string
          period_end?: string | null
          period_start?: string | null
          period_type: string
          rank_position?: number | null
          user_id: string
          value: number
        }
        Update: {
          calculated_at?: string
          genre_filter?: string | null
          id?: string
          leaderboard_type?: string
          period_end?: string | null
          period_start?: string | null
          period_type?: string
          rank_position?: number | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number | null
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_streak: number | null
          display_name: string | null
          favorite_genres: string[] | null
          id: string
          is_profile_public: boolean | null
          last_reading_date: string | null
          longest_streak: number | null
          reading_goal_daily: number | null
          reading_goal_weekly: number | null
          subscription_end: string | null
          subscription_tier: string | null
          theme_preference: string | null
          total_books_read: number | null
          total_pages_read: number | null
          total_points: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_streak?: number | null
          display_name?: string | null
          favorite_genres?: string[] | null
          id?: string
          is_profile_public?: boolean | null
          last_reading_date?: string | null
          longest_streak?: number | null
          reading_goal_daily?: number | null
          reading_goal_weekly?: number | null
          subscription_end?: string | null
          subscription_tier?: string | null
          theme_preference?: string | null
          total_books_read?: number | null
          total_pages_read?: number | null
          total_points?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_streak?: number | null
          display_name?: string | null
          favorite_genres?: string[] | null
          id?: string
          is_profile_public?: boolean | null
          last_reading_date?: string | null
          longest_streak?: number | null
          reading_goal_daily?: number | null
          reading_goal_weekly?: number | null
          subscription_end?: string | null
          subscription_tier?: string | null
          theme_preference?: string | null
          total_books_read?: number | null
          total_pages_read?: number | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          achievement_id: string | null
          book_id: string | null
          challenge_id: string | null
          comments_count: number | null
          content: string
          created_at: string
          hashtags: string[] | null
          id: string
          image_url: string | null
          is_anonymous: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          post_type: string
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          achievement_id?: string | null
          book_id?: string | null
          challenge_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          is_anonymous?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          post_type: string
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          achievement_id?: string | null
          book_id?: string | null
          challenge_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          is_anonymous?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          post_type?: string
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_books: {
        Row: {
          audiobook_minutes_listened: number | null
          book_id: string
          created_at: string
          current_page: number | null
          end_date: string | null
          id: string
          is_audiobook: boolean | null
          notes: string | null
          personal_rating: number | null
          personal_review: string | null
          progress_percentage: number | null
          reading_time_minutes: number | null
          start_date: string | null
          status: string
          total_pages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audiobook_minutes_listened?: number | null
          book_id: string
          created_at?: string
          current_page?: number | null
          end_date?: string | null
          id?: string
          is_audiobook?: boolean | null
          notes?: string | null
          personal_rating?: number | null
          personal_review?: string | null
          progress_percentage?: number | null
          reading_time_minutes?: number | null
          start_date?: string | null
          status?: string
          total_pages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audiobook_minutes_listened?: number | null
          book_id?: string
          created_at?: string
          current_page?: number | null
          end_date?: string | null
          id?: string
          is_audiobook?: boolean | null
          notes?: string | null
          personal_rating?: number | null
          personal_review?: string | null
          progress_percentage?: number | null
          reading_time_minutes?: number | null
          start_date?: string | null
          status?: string
          total_pages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_books_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quest_progress: {
        Row: {
          completed: boolean | null
          completion_date: string | null
          created_at: string
          id: string
          progress_value: number | null
          quest_date: string
          quest_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completion_date?: string | null
          created_at?: string
          id?: string
          progress_value?: number | null
          quest_date?: string
          quest_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completion_date?: string | null
          created_at?: string
          id?: string
          progress_value?: number | null
          quest_date?: string
          quest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quest_progress_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "daily_quests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
