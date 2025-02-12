import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { supabase } from '../lib/supabase';
import { Wallet } from 'lucide-react';
import FloatingElements from './FloatingElements';

export default function SignIn() {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async (credentialResponse: any) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: credentialResponse.credential,
            });

            if (error) {
                console.error('Error signing in with Google:', error.message);
                // TODO: Add proper error handling
                return;
            }

            console.log('Successfully signed in:', data);
        } catch (error) {
            console.error('Error signing in:', error);
            // TODO: Add proper error handling
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
                            <p className="text-base text-gray-600">Signing you in</p>
                        </div>
                    </div>
                </>
            )}
            <FloatingElements />
            
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-screen">
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
            
            <div className="py-8 text-center">
                <p className="text-gray-600">Made with ❤️ by Siby C.R.</p>
                <div className="flex justify-center space-x-4 mt-4">
                    <a href="https://github.com/sibycr18" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                    </a>
                    <a href="https://x.com/siby_cr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
