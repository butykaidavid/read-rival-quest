import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Routes, Route, useLocation } from 'react-router-dom';
import { LandingPage } from '@/components/landing/LandingPage';

const Index = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Determine if we're on the landing page (auth page)
  const isAuthPage = location.pathname === '/auth' || (!user && location.pathname === '/');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 w-8 bg-primary rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading ReadRival...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/auth" element={
          <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
            <Header />
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
              <AuthForm />
            </div>
          </div>
        } />
        <Route path="/*" element={
          user ? (
            <>
              <Header />
              <MainContent />
            </>
          ) : (
            <LandingPage />
          )
        } />
      </Routes>
    </div>
  );
};

export default Index;
