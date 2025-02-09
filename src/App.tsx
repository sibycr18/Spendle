import React, { useState } from 'react';
import { BarChart3, LayoutDashboard, LineChart, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';

type Page = 'dashboard' | 'analytics';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">FinFlow</h1>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;