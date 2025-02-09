import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Logo from './Logo';

interface SignInProps {
    onSignIn: (user: any) => void;
}

interface GoogleUser {
    email: string;
    email_verified: boolean;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
    locale: string;
    sub: string;
}

export default function SignIn({ onSignIn }: SignInProps) {
    const handleGoogleSuccess = (credentialResponse: any) => {
        if (credentialResponse.credential) {
            const decoded = jwtDecode<GoogleUser>(credentialResponse.credential);
            const userData = {
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                sub: decoded.sub
            };
            onSignIn(userData);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="transform transition-transform duration-300 hover:scale-110">
                            <Logo className="h-16 w-16" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-display tracking-wide">
                        Welcome to FinFlow
                    </h2>
                    <div className="mt-8 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {}}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
