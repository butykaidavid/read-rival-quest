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

// Mock Google Books API function (replace with real API)
const searchBooks = async (query: string, genre?: string): Promise<Book[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data with popular romance/fantasy books
  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'Fourth Wing',
      authors: ['Rebecca Yarros'],
      description: 'Enter the brutal and elite world of a war college for dragon riders...',
      cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=450&fit=crop',
      page_count: 500,
      published_date: '2023-05-02',
      genres: ['Fantasy', 'Romance', 'Dragons'],
      average_rating: 4.6,
      is_trending: true
    },
    {
      id: '2',
      title: 'The Seven Husbands of Evelyn Hugo',
      authors: ['Taylor Jenkins Reid'],
      description: 'A reclusive Hollywood icon finally tells her story...',
      cover_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop',
      page_count: 400,
      published_date: '2017-06-13',
      genres: ['Romance', 'Historical Fiction'],
      average_rating: 4.5,
      is_trending: true
    },
    {
      id: '3',
      title: 'Iron Flame',
      authors: ['Rebecca Yarros'],
      description: 'The sequel to Fourth Wing continues the dragon rider saga...',
      cover_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop',
      page_count: 623,
      published_date: '2023-11-07',
      genres: ['Fantasy', 'Romance', 'Dragons'],
      average_rating: 4.7,
      is_trending: true
    },
    {
      id: '4',
      title: 'A Court of Thorns and Roses',
      authors: ['Sarah J. Maas'],
      description: 'A thrilling retelling of Beauty and the Beast in a fantasy world...',
      cover_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop',
      page_count: 419,
      published_date: '2015-05-05',
      genres: ['Fantasy', 'Romance', 'Fae'],
      average_rating: 4.3,
      is_trending: false
    }
  ];

  // Filter by query and genre
  return mockBooks.filter(book => {
    const matchesQuery = query === '' || 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.authors.some(author => author.toLowerCase().includes(query.toLowerCase()));
    
    const matchesGenre = !genre || book.genres?.some(g => 
      g.toLowerCase().includes(genre.toLowerCase())
    );
    
    return matchesQuery && matchesGenre;
  });
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
  });

  const { data: userBooks = [] } = useQuery({
    queryKey: ['user-books', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Simplified query for now - will enhance when relationships are properly set up
      return [];
    },
    enabled: !!user,
  });

  const handleSearch = async () => {
    setIsSearching(true);
    await refetch();
    setIsSearching(false);
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

      // Refetch user books
      if (userBooks) {
        // Manual refresh would go here
      }
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
    return userBooks?.some(ub => ub.book_id === bookId);
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
            Find books by title, author, or ISBN
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

      {/* Search Results */}
      {(isLoading || isSearching) && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching for amazing books...</p>
        </div>
      )}

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

      {searchResults && searchResults.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or genre filters
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
            Popular romance and fantasy books everyone's reading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('');
              handleSearch();
            }}
            className="w-full"
          >
            <Heart className="h-4 w-4 mr-2" />
            Discover Trending Books
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}