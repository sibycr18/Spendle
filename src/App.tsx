import React, { useState, useEffect } from 'react';
import { BarChart3, LayoutDashboard, X } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import SignIn from './components/SignIn';

type Page = 'dashboard' | 'analytics';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for stored user data on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Loaded stored user:', parsedUser);
      setUser(parsedUser);
    }
  }, []);

  const handleSignIn = (userData: any) => {
    console.log('Handling sign in with data:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleSignOut = () => {
    console.log('Signing out user');
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <SignIn onSignIn={handleSignIn} />
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen h-screen flex flex-col bg-gray-50">
        <Header 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          user={user}
          onSignOut={handleSignOut}
        />

        <div className="flex-1 flex h-[calc(100vh-4rem)] pt-16">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentPage('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setCurrentPage('analytics');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentPage === 'analytics'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">Analytics</span>
              </button>
            </nav>
          </aside>

          {/* Mobile Sidebar Overlay */}
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ease-in-out ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Sidebar */}
          <aside 
            className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 lg:hidden transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentPage('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setCurrentPage('analytics');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentPage === 'analytics'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">Analytics</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto relative">
            <div className="h-full">
              <div className="container mx-auto px-4 lg:px-8 py-6">
                {currentPage === 'dashboard' && (
                  <Dashboard />
                )}
                {currentPage === 'analytics' && (
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Analytics</h1>
                    <p className="text-gray-600 mt-4">Analytics features coming soon...</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}