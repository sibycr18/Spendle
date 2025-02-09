import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, Wallet, LayoutDashboard, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, NavLink, useLocation } from 'react-router-dom';

interface UserType {
    email: string;
}

const Header = () => {
    const { user, signOut } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
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

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (!user) return null;

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="flex items-center">
                            <Wallet className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">FinFlow</span>
                        </Link>
                        <nav className="flex space-x-4">
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                                        isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`
                                }
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Dashboard</span>
                            </NavLink>
                            <NavLink
                                to="/analytics"
                                className={({ isActive }) =>
                                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                                        isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`
                                }
                            >
                                <BarChart3 className="h-4 w-4" />
                                <span>Analytics</span>
                            </NavLink>
                        </nav>
                    </div>

                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center space-x-3 focus:outline-none"
                        >
                            <div className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors duration-200">
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                        {user.email?.[0].toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {user.email?.split('@')[0]}
                                </span>
                                <ChevronDown 
                                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                                        showProfileMenu ? 'transform rotate-180' : ''
                                    }`} 
                                />
                            </div>
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm text-gray-500">Signed in as</p>
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors duration-200"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
