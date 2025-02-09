import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import Logo from './Logo';

interface HeaderProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    user: any | null;
    onSignOut: () => void;
}

export default function Header({ isMobileMenuOpen, setIsMobileMenuOpen, user, onSignOut }: HeaderProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Function to get proxied image URL
    const getProxiedImageUrl = (url: string) => {
        // Using images.weserv.nl as a proxy service with higher quality settings
        return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=128&h=128&dpr=2&fit=cover&a=attention&default=404&q=100`;
    };

    useEffect(() => {
        // Reset error state when user changes
        setImageError(false);
    }, [user]);

    return (
        <header className="fixed top-0 inset-x-0 bg-white border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto">
                <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                    {/* Left section with menu button */}
                    <div className="flex-1 flex items-center lg:w-64">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden -ml-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                        >
                            <span className="sr-only">
                                {isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                            </span>
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Center section with logo */}
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex items-center space-x-3">
                            <div className="transform transition-transform duration-200 hover:scale-105">
                                <Logo className="h-10 w-10" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 font-display tracking-wide">
                                FinFlow
                            </span>
                        </div>
                    </div>

                    {/* Right section with profile */}
                    <div className="flex-1 flex items-center justify-end lg:w-64">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center space-x-2 focus:outline-none transition-transform duration-200 hover:scale-105"
                                >
                                    {user.picture && !imageError ? (
                                        <img
                                            src={getProxiedImageUrl(user.picture)}
                                            alt={user.name}
                                            className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                            onError={() => {
                                                console.error('Image failed to load:', user.picture);
                                                setImageError(true);
                                            }}
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-white shadow-sm">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                    )}
                                </button>
                                
                                {/* Profile Dropdown */}
                                <div
                                    className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 transform transition-all duration-200 origin-top-right ${
                                        showProfileMenu 
                                            ? 'opacity-100 scale-100' 
                                            : 'opacity-0 scale-95 pointer-events-none'
                                    }`}
                                >
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onSignOut();
                                            setShowProfileMenu(false);
                                        }}
                                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    );
}
