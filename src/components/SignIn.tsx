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
        <div className="min-h-screen flex items-center justify-center relative">
            <FloatingElements />
            <div className="w-full max-w-md mx-auto relative">
                <div className="flex flex-col items-center space-y-8">
                    <div className="bg-white w-full rounded-xl shadow-lg p-8 space-y-6">
                        <div className="flex flex-col items-center space-y-6">
                            <div className="flex items-center space-x-3 transform hover:scale-105 transition-transform duration-200">
                                <Wallet className="h-12 w-12 text-blue-600" />
                                <h1 className="text-3xl font-bold text-gray-900">Spendle</h1>
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-semibold text-gray-900">Welcome Back</h2>
                                <p className="text-gray-600">Sign in to manage your finances</p>
                            </div>

                            <div className="flex justify-center w-full">
                                <GoogleLogin
                                    onSuccess={handleGoogleSignIn}
                                    onError={() => {
                                        console.error('Google Sign In Failed');
                                        // TODO: Add proper error handling
                                    }}
                                    useOneTap
                                    theme="filled_blue"
                                    shape="pill"
                                    size="large"
                                    text="continue_with"
                                    locale="en"
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
    );
}
