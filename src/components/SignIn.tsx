import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { supabase } from '../lib/supabase';
import { Wallet } from 'lucide-react';
import FloatingElements from './FloatingElements';

export default function SignIn() {
    const handleGoogleSignIn = async (credentialResponse: any) => {
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
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <FloatingElements />
            <div className="flex-1 flex flex-col items-center justify-center mt-16">
                <div className="w-full max-w-md mx-auto">
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

                                <div className="flex justify-center w-full">
                                    <button 
                                        onClick={() => {
                                            const googleLoginBtn = document.querySelector('[role="button"]') as HTMLElement;
                                            if (googleLoginBtn) googleLoginBtn.click();
                                        }}
                                        className="flex items-center px-4 py-2.5 bg-[#2563eb] text-white rounded-md hover:bg-[#1d4ed8] transition-colors duration-200 w-64"
                                    >
                                        <div className="bg-white p-2 rounded mr-4">
                                            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                            </svg>
                                        </div>
                                        <span className="text-base font-medium">Sign in with Google</span>
                                        <div style={{ width: 0, height: 0, overflow: 'hidden' }}>
                                            <GoogleLogin
                                                onSuccess={handleGoogleSignIn}
                                                onError={() => {
                                                    console.error('Google Sign In Failed');
                                                }}
                                                useOneTap
                                                theme="filled_blue"
                                                shape="pill"
                                                size="large"
                                                text="continue_with"
                                                locale="en"
                                            />
                                        </div>
                                    </button>
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
            <div className="flex flex-col items-center space-y-2 py-4">
                <p className="text-gray-600">Made with ❤️ by Siby C.R.</p>
                <div className="flex space-x-4">
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
                    <a href="https://www.linkedin.com/in/sibycr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                    </a>
                    <a href="https://www.instagram.com/siby.cr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
