import React, { useEffect, ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import SignIn from './components/SignIn';
import { default as AnalyticsComponent } from './components/Analytics';
import { default as RecurringComponent } from './components/Recurring';
import { default as SavingsGoalsComponent } from './components/SavingsGoals';
import LandingPage from './components/LandingPage';
import NetworkStatus from './components/NetworkStatus';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Define interface for ProtectedRoute props
interface ProtectedRouteProps {
  children: ReactNode;
}

// Landing page wrapper component
const LandingPageWrapper = () => {
  // Add styles to enable scrolling on the landing page
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        height: auto !important;
        overflow: auto !important;
      }
    `;
    // Add the style to the document head
    document.head.appendChild(style);
    
    // Cleanup function to remove the style element
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return <LandingPage />;
};

// Authenticated route wrapper
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to sign in page if not authenticated
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          {children}
        </div>
      </main>
    </div>
  );
};

function AppContent() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPageWrapper />} />
      <Route path="/signin" element={<SignIn />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AnalyticsComponent />
        </ProtectedRoute>
      } />
      <Route path="/recurring" element={
        <ProtectedRoute>
          <RecurringComponent />
        </ProtectedRoute>
      } />
      <Route path="/goals" element={
        <ProtectedRoute>
          <SavingsGoalsComponent />
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <AppContent />
            <NetworkStatus />
            <Analytics />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;