import React, { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import SignIn from './components/SignIn';
import { default as AnalyticsComponent } from './components/Analytics';
import { default as RecurringComponent } from './components/Recurring';
import { default as SavingsGoalsComponent } from './components/SavingsGoals';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<AnalyticsComponent />} />
            <Route path="/recurring" element={<RecurringComponent />} />
            <Route path="/goals" element={<SavingsGoalsComponent />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <AppContent />
            <Analytics />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;