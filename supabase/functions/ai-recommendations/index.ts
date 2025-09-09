import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { type, genres = [], currentBooks = [], preferences = {} } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get user's reading history and preferences
    const { data: userBooks } = await supabaseClient
      .from('user_books')
      .select('books(title, authors, genres, booktok_tags)')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .limit(10);

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('favorite_genres, subscription_tier')
      .eq('user_id', user.id)
      .single();

    const readBooks = userBooks?.map(ub => ub.books).filter(Boolean) || [];
    const favoriteGenres = profile?.favorite_genres || [];
    const isPremi = profile?.subscription_tier === 'premium';

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case 'books':
        systemPrompt = `You are a book recommendation expert specializing in romance and fantasy genres, particularly popular on BookTok. Focus on trending books with themes like enemies-to-lovers, dragons, fae, love triangles, and spicy romance. Provide personalized recommendations based on user's reading history.`;
        
        userPrompt = `Based on this reading profile, recommend 5 books:
        
Reading History: ${readBooks.map(b => `"${b.title}" by ${b.authors?.join(', ')} (${b.genres?.join(', ')})`).join('; ')}
Favorite Genres: ${favoriteGenres.join(', ')}
Current Interests: ${genres.join(', ')}
Current Reading: ${currentBooks.join(', ')}

Focus on:
- Romance books with enemies-to-lovers, fake dating, second chance themes
- Fantasy books with dragons, fae, magic systems, epic quests
- Popular BookTok trends and viral books
- Books similar to ACOTAR, Fourth Wing, The Seven Husbands of Evelyn Hugo

Format as JSON array with: title, author, genre, reason, booktok_appeal, spice_level (1-5)`;
        break;

      case 'reading_plan':
        systemPrompt = `You are a reading coach specializing in romance and fantasy genres. Create engaging 30-day reading plans that incorporate popular BookTok trends and challenge themes.`;
        
        userPrompt = `Create a 30-day reading plan for:
        
User Profile:
- Favorite Genres: ${favoriteGenres.join(', ')}
- Preferred Themes: ${genres.join(', ')}
- Reading Goal: ${preferences.dailyGoal || 30} pages/day
- Experience Level: ${preferences.level || 'intermediate'}

Plan Requirements:
- Include romance and fantasy books
- Mix of popular BookTok titles and classics
- Include challenges like "enemies-to-lovers week" or "dragon fantasy marathon"
- Provide daily motivation and mini-goals
- Consider spice levels and content warnings

Format as JSON with: week_themes, daily_goals, book_suggestions, challenges, motivation_tips`;
        break;

      case 'challenge':
        systemPrompt = `You are a gamification expert for reading challenges. Create engaging, genre-specific challenges that motivate readers to explore romance and fantasy books.`;
        
        userPrompt = `Create a reading challenge based on:
        
Preferences: ${genres.join(', ')}
Duration: ${preferences.duration || 'monthly'}
Difficulty: ${preferences.difficulty || 'medium'}
Focus: Romance and Fantasy genres

Requirements:
- Specific page/book targets
- Genre-specific themes (dragons, enemies-to-lovers, etc.)
- Bonus objectives for extra points
- BookTok integration opportunities
- Social sharing elements

Format as JSON with: title, description, requirements, bonus_objectives, estimated_difficulty, genre_focus`;
        break;

      default:
        throw new Error('Invalid recommendation type');
    }

    console.log('Making OpenAI request for type:', type);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: isPremi ? 2000 : 1000,
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${aiData.error?.message || 'Unknown error'}`);
    }

    const recommendation = aiData.choices[0].message.content;
    
    // Try to parse as JSON, fall back to text if it fails
    let parsedRecommendation;
    try {
      parsedRecommendation = JSON.parse(recommendation);
    } catch {
      parsedRecommendation = { text: recommendation };
    }

    // Track usage for free tier limits
    if (!isPremi) {
      // Could implement usage tracking here
      console.log('Free tier user generated recommendation');
    }

    return new Response(JSON.stringify({
      recommendation: parsedRecommendation,
      type,
      generated_at: new Date().toISOString(),
      is_premium: isPremi
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-recommendations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});