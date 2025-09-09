import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    averageRating?: number;
    ratingsCount?: number;
    previewLink?: string;
    language?: string;
  };
}

const mapBookToSchema = (book: GoogleBook) => {
  const { volumeInfo } = book;
  const isbn13 = volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier;
  const isbn10 = volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_10")?.identifier;
  
  // Enhanced genre mapping for romance and fantasy focus
  const genreMapping = (categories: string[] = []) => {
    const genres: string[] = [];
    const booktokTags: string[] = [];
    
    categories.forEach(category => {
      const lowerCategory = category.toLowerCase();
      
      // Romance detection
      if (lowerCategory.includes('romance')) {
        genres.push('Romance');
        if (lowerCategory.includes('historical')) booktokTags.push('historical-romance');
        if (lowerCategory.includes('contemporary')) booktokTags.push('contemporary-romance');
        booktokTags.push('love-story', 'romantic');
      }
      
      // Fantasy detection
      if (lowerCategory.includes('fantasy')) {
        genres.push('Fantasy');
        if (lowerCategory.includes('urban')) booktokTags.push('urban-fantasy');
        if (lowerCategory.includes('epic')) booktokTags.push('epic-fantasy');
        booktokTags.push('magic', 'fantasy-world');
      }
      
      // Popular booktok genres
      if (lowerCategory.includes('young adult')) {
        genres.push('Young Adult');
        booktokTags.push('ya', 'booktok');
      }
      
      if (lowerCategory.includes('science fiction')) {
        genres.push('Science Fiction');
        booktokTags.push('sci-fi');
      }
      
      // Add original category if not mapped
      if (!genres.includes(category)) {
        genres.push(category);
      }
    });
    
    // Add trending booktok tags based on title/description patterns
    const titleDesc = (volumeInfo.title + ' ' + (volumeInfo.description || '')).toLowerCase();
    
    if (titleDesc.includes('dragon')) booktokTags.push('dragons', 'dragon-riders');
    if (titleDesc.includes('vampire')) booktokTags.push('vampires', 'paranormal');
    if (titleDesc.includes('enemies to lovers') || titleDesc.includes('enemy')) booktokTags.push('enemies-to-lovers');
    if (titleDesc.includes('fake dating') || titleDesc.includes('fake relationship')) booktokTags.push('fake-dating');
    if (titleDesc.includes('second chance')) booktokTags.push('second-chance');
    if (titleDesc.includes('love triangle')) booktokTags.push('love-triangle');
    if (titleDesc.includes('spicy') || titleDesc.includes('steamy')) booktokTags.push('spicy', 'steamy');
    if (titleDesc.includes('fae') || titleDesc.includes('faerie')) booktokTags.push('fae', 'faerie');
    
    return { genres: [...new Set(genres)], booktokTags: [...new Set(booktokTags)] };
  };
  
  const { genres, booktokTags } = genreMapping(volumeInfo.categories);
  
  return {
    google_books_id: book.id,
    title: volumeInfo.title,
    authors: volumeInfo.authors || ['Unknown Author'],
    description: volumeInfo.description,
    published_date: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).toISOString().split('T')[0] : null,
    page_count: volumeInfo.pageCount,
    genres,
    booktok_tags: booktokTags,
    cover_url: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://'),
    isbn_13: isbn13,
    isbn_10: isbn10,
    average_rating: volumeInfo.averageRating || 0,
    ratings_count: volumeInfo.ratingsCount || 0,
    preview_link: volumeInfo.previewLink,
    language: volumeInfo.language || 'en',
    is_trending: booktokTags.length > 2, // Mark as trending if it has multiple booktok tags
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 20, startIndex = 0, filter = 'all' } = await req.json();
    
    if (!query) {
      throw new Error("Search query is required");
    }

    const googleBooksApiKey = Deno.env.get("GOOGLE_BOOKS_API_KEY");
    if (!googleBooksApiKey) {
      throw new Error("Google Books API key not configured");
    }

    // Enhanced search for romance/fantasy focus
    let searchQuery = query;
    
    // Add genre filters for better results
    if (filter === 'romance') {
      searchQuery += ' subject:romance OR subject:love';
    } else if (filter === 'fantasy') {
      searchQuery += ' subject:fantasy OR subject:magic';
    } else if (filter === 'booktok') {
      searchQuery += ' (subject:romance OR subject:fantasy) AND (young adult OR YA)';
    }

    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", searchQuery);
    url.searchParams.set("maxResults", maxResults.toString());
    url.searchParams.set("startIndex", startIndex.toString());
    url.searchParams.set("key", googleBooksApiKey);
    url.searchParams.set("printType", "books");
    url.searchParams.set("orderBy", "relevance");

    console.log("Searching Google Books with query:", searchQuery);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Google Books API error");
    }

    const books = (data.items || []).map(mapBookToSchema);
    
    // Store books in our database for future reference
    if (books.length > 0) {
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Upsert books (insert if new, update if exists)
      for (const book of books) {
        try {
          await supabaseService.from("books").upsert(book, {
            onConflict: "google_books_id",
            ignoreDuplicates: false
          });
        } catch (error) {
          console.error("Error storing book:", error);
          // Continue with other books even if one fails
        }
      }
    }

    return new Response(JSON.stringify({
      books,
      totalItems: data.totalItems || 0,
      hasMore: (startIndex + maxResults) < (data.totalItems || 0)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in google-books-search:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});