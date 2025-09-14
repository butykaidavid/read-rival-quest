import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Heart,
  Zap,
  Star,
  Filter,
  ExternalLink,
  Clock,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Book {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  cover_url?: string;
  page_count?: number;
  published_date?: string;
  genres?: string[];
  isbn_13?: string;
  isbn_10?: string;
  average_rating?: number;
  is_trending?: boolean;
}

interface UserBook {
  id: string;
  book_id: string;
  status: 'want_to_read' | 'currently_reading' | 'completed';
  current_page: number;
  total_pages?: number;
  progress_percentage: number;
  start_date?: string;
  end_date?: string;
  personal_rating?: number;
  personal_review?: string;
  notes?: string;
  reading_time_minutes: number;
  book: Book;
}

// Enhanced search function with fallback
const searchBooks = async (query: string, genre?: string): Promise<Book[]> => {
  try {
    // First try the Google Books API
    const { data, error } = await supabase.functions.invoke('google-books-search', {
      body: { 
        query,
        maxResults: 20,
        filter: genre 
      }
    });

    if (error) {
      console.error('Google Books API error:', error);
      throw new Error('Google Books API failed');
    }

    if (data?.books && data.books.length > 0) {
      return data.books.map((book: any) => ({
        id: book.google_books_id || book.id,
        title: book.title,
        authors: book.authors || ['Unknown Author'],
        description: book.description,
        cover_url: book.cover_url,
        page_count: book.page_count,
        published_date: book.published_date,
        genres: book.genres || [],
        isbn_13: book.isbn_13,
        isbn_10: book.isbn_10,
        average_rating: book.average_rating || 0,
        is_trending: book.is_trending || false,
      }));
    }

    throw new Error('No results from Google Books API');
  } catch (error) {
    console.error('Google Books API failed, using database fallback:', error);
    
    // Fallback to database search
    const { data: fallbackBooks } = await supabase
      .from('books')
      .select('*')
      .or(`title.ilike.%${query}%,authors.cs.{${query}}`)
      .limit(10);
    
    return fallbackBooks?.map(book => ({
      id: book.id,
      title: book.title,
      authors: book.authors || ['Unknown Author'],
      description: book.description,
      cover_url: book.cover_url,
      page_count: book.page_count,
      published_date: book.published_date,
      genres: book.genres || [],
      isbn_13: book.isbn_13,
      isbn_10: book.isbn_10,
      average_rating: book.average_rating || 0,
      is_trending: book.is_trending || false,
    })) || [];
  }
};

export function BookSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: searchResults, isLoading, refetch } = useQuery({
    queryKey: ['book-search', searchQuery, selectedGenre],
    queryFn: () => searchBooks(searchQuery, selectedGenre),
    enabled: false, // Manual trigger
    retry: 1,
  });

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
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user books:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  const { data: trendingBooks = [] } = useQuery({
    queryKey: ['trending-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_trending', true)
        .limit(6);

      if (error) {
        console.error('Error fetching trending books:', error);
        return [];
      }

      return data || [];
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a book title, author, or keyword to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      await refetch();
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to search for books. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addBookToLibrary = async (book: Book, status: UserBook['status'] = 'want_to_read') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add books to your library.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, ensure the book exists in our books table
      const { error: bookError } = await supabase
        .from('books')
        .upsert({
          id: book.id,
          title: book.title,
          authors: book.authors,
          description: book.description,
          cover_url: book.cover_url,
          page_count: book.page_count,
          published_date: book.published_date,
          genres: book.genres || [],
          isbn_13: book.isbn_13,
          isbn_10: book.isbn_10,
          average_rating: book.average_rating || 0,
          is_trending: book.is_trending || false,
        });

      if (bookError) throw bookError;

      // Then add to user's library
      const { error: userBookError } = await supabase
        .from('user_books')
        .insert({
          user_id: user.id,
          book_id: book.id,
          status,
          current_page: 0,
          total_pages: book.page_count,
          progress_percentage: 0,
          reading_time_minutes: 0,
        });

      if (userBookError) throw userBookError;

      toast({
        title: "Book added!",
        description: `${book.title} has been added to your library.`,
      });

      // Refetch user books to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error adding book:', error);
      toast({
        title: "Error",
        description: "Failed to add book to your library.",
        variant: "destructive",
      });
    }
  };

  const isBookInLibrary = (bookId: string) => {
    return userBooks?.some((ub: any) => ub.book_id === bookId);
  };

  const genres = ['Romance', 'Fantasy', 'Dragons', 'Fae', 'Historical Fiction', 'BookTok'];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Discover Your Next Great Read</h2>
        <p className="text-muted-foreground">
          Search romance, fantasy, and trending BookTok favorites
        </p>
      </div>

      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Books
          </CardTitle>
          <CardDescription>
            Find books by title, author, or ISBN. If the Google Books API is unavailable, we'll search our database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Search for books... (e.g. Fourth Wing, Sarah J. Maas)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading || isSearching}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Genre Filters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by Genre:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedGenre === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGenre('')}
              >
                All Genres
              </Button>
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGenre(genre)}
                  className="gap-1"
                >
                  {genre === 'Romance' && <Heart className="h-3 w-3" />}
                  {genre === 'Fantasy' && <Zap className="h-3 w-3" />}
                  {genre === 'Dragons' && <Zap className="h-3 w-3" />}
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {(isLoading || isSearching) && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching for amazing books...</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults && searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Search Results ({searchResults.length} books found)
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((book) => (
              <Card key={book.id} className="overflow-hidden">
                <div className="aspect-[3/4] relative">
                  <img
                    src={book.cover_url || '/placeholder.svg'}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  {book.is_trending && (
                    <Badge className="absolute top-2 right-2 bg-accent">
                      Trending
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold line-clamp-1">{book.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {book.authors.join(', ')}
                    </p>
                  </div>
                  
                  {book.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {book.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {book.genres?.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre === 'Romance' && <Heart className="h-3 w-3 mr-1" />}
                        {genre === 'Fantasy' && <Zap className="h-3 w-3 mr-1" />}
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {book.average_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-warning" />
                        {book.average_rating}
                      </div>
                    )}
                    {book.page_count && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {book.page_count} pages
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isBookInLibrary(book.id) ? (
                      <Button variant="outline" disabled className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        In Library
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => addBookToLibrary(book, 'want_to_read')}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Library
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchResults && searchResults.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or genre filters. Our Google Books API may be temporarily unavailable.
          </p>
        </div>
      )}

      {/* Trending Books Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Trending on BookTok
          </CardTitle>
          <CardDescription>
            Popular romance and fantasy books from our database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trendingBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {trendingBooks.slice(0, 6).map((book) => (
                <div key={book.id} className="text-center space-y-2">
                  <div className="aspect-[3/4] relative">
                    <img
                      src={book.cover_url || '/placeholder.svg'}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm line-clamp-1">{book.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {book.authors?.join(', ')}
                    </p>
                  </div>
                  {!isBookInLibrary(book.id) && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addBookToLibrary(book, 'want_to_read')}
                      className="w-full"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No trending books available at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}