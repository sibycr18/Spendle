import React, { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { User as UserType } from '../types';

interface HeaderProps {
    toggleMobileMenu: () => void;
    user: UserType;
}

export default function Header({ toggleMobileMenu, user }: HeaderProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { signOut } = useAuth();

    // Function to get proxied image URL
    const getProxiedImageUrl = (url: string) => {
        // Using images.weserv.nl as a proxy service with higher quality settings
        return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=128&h=128&dpr=2&fit=cover&a=attention&default=404&q=100`;
    };

    return (
        <header className="bg-white border-b border-gray-200 fixed top-0 inset-x-0 z-10">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden -ml-2 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">Open menu</span>
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="hidden md:flex items-center">
                            <Logo className="h-8 w-8" />
                            <span className="ml-2 text-lg font-semibold text-gray-900">
                                FinFlow
                            </span>
                        </div>
                        <div className="md:hidden flex items-center">
                            <Logo className="h-8 w-8" />
                            <span className="ml-2 text-lg font-semibold text-gray-900">
                                FinFlow
                            </span>
                        </div>
                    </div>

                    {/* Profile dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {user.avatar_url && !imageError ? (
                                <img
                                    src={getProxiedImageUrl(user.avatar_url)}
                                    alt={user.name || 'User'}
                                    onError={() => setImageError(true)}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-gray-500" />
                                </div>
                            )}
                            <span className="text-sm font-medium text-gray-700">
                                {user.name || user.email}
                            </span>
                        </button>

                        {showProfileMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowProfileMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                                    <button
                                        onClick={signOut}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
