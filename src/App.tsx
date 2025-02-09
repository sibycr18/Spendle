import React, { useState } from 'react';
import { BarChart3, LayoutDashboard, X } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import SignIn from './components/SignIn';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type Page = 'dashboard' | 'analytics';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <SignIn />
      </div>
    );
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed top-0 bottom-0 left-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">FinFlow</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`flex items-center space-x-2 w-full px-4 py-2 text-sm font-medium rounded-lg ${
              currentPage === 'dashboard'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentPage('analytics')}
            className={`flex items-center space-x-2 w-full px-4 py-2 text-sm font-medium rounded-lg ${
              currentPage === 'analytics'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Analytics</span>
          </button>
        </nav>
      </aside>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden ${
          isMobileMenuOpen ? 'block' : 'hidden'
        }`}
        onClick={toggleMobileMenu}
      />

      <div
        className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white z-30 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">FinFlow</h2>
          <button
            onClick={toggleMobileMenu}
            className="text-gray-500 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          <button
            onClick={() => {
              setCurrentPage('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-2 w-full px-4 py-2 text-sm font-medium rounded-lg ${
              currentPage === 'dashboard'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => {
              setCurrentPage('analytics');
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-2 w-full px-4 py-2 text-sm font-medium rounded-lg ${
              currentPage === 'analytics'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Analytics</span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col h-screen">
        <Header
          toggleMobileMenu={toggleMobileMenu}
          user={user}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="pt-16">
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'analytics' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Analytics Coming Soon
                </h2>
                <p className="mt-2 text-gray-600">
                  We're working on bringing you insightful analytics. Stay tuned!
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}