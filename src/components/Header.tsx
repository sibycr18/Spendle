import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, Wallet, LayoutDashboard, BarChart3, Repeat, Menu, X, Sun, Moon, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, NavLink, useLocation } from 'react-router-dom';

interface UserType {
    email: string;
    name?: string;
    avatar_url?: string;
}

const Header = () => {
    const { user, signOut } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const handleSignOut = async () => {
        try {
            await signOut();
            // Close the profile menu after successful sign out
            setShowProfileMenu(false);
        } catch (error) {
            console.error('Error signing out:', error);
            // Still close the menu even if there's an error
            setShowProfileMenu(false);
        }
    };

    if (!user) return null;

    const NavLinks = () => (
        <>
            <NavLink
                to="/"
                className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }`
                }
            >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
            </NavLink>
            <NavLink
                to="/recurring"
                className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }`
                }
            >
                <Repeat className="h-4 w-4" />
                <span>Recurring</span>
            </NavLink>
            <NavLink
                to="/goals"
                className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }`
                }
            >
                <Target className="h-4 w-4" />
                <span>Goals</span>
            </NavLink>
            <NavLink
                to="/analytics"
                className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }`
                }
            >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
            </NavLink>
        </>
    );

    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-50">Spendle</span>
                        </Link>
                        <nav className="hidden md:flex ml-8 space-x-4">
                            <NavLinks />
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Theme toggle button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>

                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="focus:outline-none"
                            >
                                {user.avatar_url ? (
                                    <img 
                                        src={user.avatar_url} 
                                        alt="Profile" 
                                        referrerPolicy="no-referrer" 
                                        className="h-10 w-10 rounded-full object-cover shadow-md ring-1 ring-blue-600 dark:ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-300 transition-all duration-200"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-md ring-1 ring-blue-600 dark:ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-300 transition-all duration-200">
                                        <span className="text-white font-medium text-base">
                                            {user.name ? user.name[0].toUpperCase() : user.email?.[0].toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate mt-1">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {user.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors duration-200"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-2">
                        <nav className="flex flex-col space-y-1 px-2 pb-3 pt-2">
                            <NavLinks />
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
