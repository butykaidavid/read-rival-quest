import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Trophy, Zap, Heart, Sword, Star, TrendingUp } from 'lucide-react';

export const LandingPage = () => {
  const [currentGenre, setCurrentGenre] = useState(0);
  const genres = [
    { name: 'Romance', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
    { name: 'Fantasy', icon: Sword, color: 'text-purple-500', bg: 'bg-purple-50' },
    { name: 'Mystery', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Header />
      
      {/* Hero Section */}
      <section className="relative px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Turn Reading Into Your Greatest Competition
          </h1>
          <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
            Join 50,000+ book lovers competing in challenges, climbing leaderboards, and discovering their next favorite 
            romance or fantasy obsession through the most engaging reading platform of 2025.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-primary text-white hover:opacity-90 shadow-book">
                Start Your Reading Journey
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore Challenges
            </Button>
          </div>

          {/* Genre Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {genres.map((genre, index) => {
              const Icon = genre.icon;
              return (
                <Card key={genre.name} className={`cursor-pointer transition-all hover:scale-105 ${genre.bg} border-2`}>
                  <CardHeader className="text-center">
                    <Icon className={`w-12 h-12 mx-auto mb-2 ${genre.color}`} />
                    <CardTitle className={genre.color}>{genre.name}</CardTitle>
                    <CardDescription>
                      {genre.name === 'Romance' && "Enemies-to-lovers, love triangles, spicy reads"}
                      {genre.name === 'Fantasy' && "Dragons, magic, epic adventures like ACOTAR"}
                      {genre.name === 'Mystery' && "Thrillers, detective stories, plot twists"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-card/50">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-3xl font-bold text-center">Why BookTok Readers Choose ReadRival</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Trophy className="w-12 h-12 mx-auto mb-4 text-warning" />
                <CardTitle>Competitive Reading</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Climb genre-specific leaderboards and compete with friends in romance and fantasy challenges
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 mx-auto mb-4 text-accent" />
                <CardTitle>Book Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Join book clubs, share reviews, and discover your next obsession through community recommendations
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>Daily Quests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Complete reading quests, earn points, and unlock exclusive badges for your achievements
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-success" />
                <CardTitle>AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get personalized book suggestions based on your reading history and current BookTok trends
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-3xl font-bold">Join the Reading Revolution</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Active Readers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">2M+</div>
              <p className="text-muted-foreground">Pages Read This Month</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">10K+</div>
              <p className="text-muted-foreground">Challenges Completed</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary">#BookTok</Badge>
            <Badge variant="secondary">#RomanceReads</Badge>
            <Badge variant="secondary">#FantasyBooks</Badge>
            <Badge variant="secondary">#ReadingChallenge2025</Badge>
            <Badge variant="secondary">#BookCompetition</Badge>
          </div>

          <Link to="/auth">
            <Button size="lg" className="bg-gradient-primary text-white hover:opacity-90 shadow-book">
              Start Competing Today - Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-card/30 border-t">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">ReadRival</h3>
              <p className="text-muted-foreground text-sm">
                The ultimate competitive reading platform for book lovers who want to turn pages into victories.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Reading Challenges</li>
                <li>Leaderboards</li>
                <li>Book Communities</li>
                <li>Progress Tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Genres</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Romance Books</li>
                <li>Fantasy Series</li>
                <li>BookTok Favorites</li>
                <li>Trending Reads</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 ReadRival. All rights reserved. Built for book lovers, by book lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};