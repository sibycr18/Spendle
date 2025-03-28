import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { supabase, isOffline } from '../lib/supabase';
import { Wallet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import FloatingElements from './FloatingElements';

export default function SignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Get the intended destination from location state or default to dashboard
    const from = location.state?.from?.pathname || '/dashboard';

    const handleGoogleSignIn = async (credentialResponse: any) => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Check if we're offline before attempting the sign-in
            if (isOffline()) {
                throw new Error('You appear to be offline. Please check your internet connection and try again.');
            }
            
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: credentialResponse.credential,
            });

            if (error) {
                console.error('Error signing in with Google:', error.message);
                setError(error.message);
                return;
            }

            console.log('Successfully signed in:', data);
            
            // Redirect to the intended destination after successful login
            navigate(from, { replace: true });
        } catch (error: any) {
            console.error('Error signing in:', error);
            setError(error.message || 'Failed to sign in. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* One Tap Sign In */}
            <div className="hidden">
                <GoogleLogin
                    onSuccess={handleGoogleSignIn}
                    onError={() => {
                        console.error('Google One Tap Sign In Failed');
                    }}
                    useOneTap
                    auto_select
                />
            </div>

            {isLoading && (
                <>
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-center bg-white p-8 rounded-xl shadow-xl border border-gray-200">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-blue-600 animate-loading-bar"></div>
                            </div>
                            <p className="text-gray-600">Signing in...</p>
                        </div>
                    </div>
                </>
            )}

            {error && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg">
                    {error}
                </div>
            )}

            <FloatingElements />
            
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="flex flex-col items-center space-y-8">
                        <div className="bg-white w-full rounded-xl shadow-lg p-12 space-y-8">
                            <div className="flex flex-col items-center space-y-8">
                                <div className="flex items-center space-x-3 transform hover:scale-105 transition-transform duration-200">
                                    <Wallet className="h-12 w-12 text-blue-600" />
                                    <h1 className="text-3xl font-bold text-gray-900">Spendle</h1>
                                </div>

                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-semibold text-gray-900">Welcome to Spendle</h2>
                                    <p className="text-gray-600">Your personal finance companion</p>
                                </div>

                                {/* Main Google Sign In Button */}
                                <div className="w-full flex justify-center">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSignIn}
                                        onError={() => {
                                            console.error('Google Sign In Failed');
                                        }}
                                        useOneTap={false}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-500">
                            <p>By signing in, you agree to our</p>
                            <div className="space-x-1">
                                <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
                                <span>&</span>
                                <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2 mt-6 sm:mt-8">
                <p className="text-sm sm:text-base text-gray-600 text-center px-4">Made with ❤️ by Siby C.R.</p>
                <div className="flex space-x-4 justify-center pb-8">
                    <a href="https://github.com/sibycr18" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                        </svg>
                    </a>
                    <a href="https://x.com/siby_cr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </a>
                    <a href="https://www.linkedin.com/in/sibycr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                    </a>
                    <a href="https://www.instagram.com/siby.cr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
