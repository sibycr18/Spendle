import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata.full_name,
                    avatar_url: session.user.user_metadata.avatar_url,
                });
            }
            setLoading(false);
        });

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata.full_name,
                    avatar_url: session.user.user_metadata.avatar_url,
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            // First clear local storage
            localStorage.removeItem('sb-' + supabase.supabaseUrl + '-auth-token');
            
            // Then attempt to sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error && error.message !== 'Auth session missing!') {
                console.error('Error signing out:', error.message);
                throw error;
            }

            // Always clear the user state, even if there's an auth session missing error
            setUser(null);
        } catch (error) {
            console.error('Error during sign out:', error);
            // Still clear the user state
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};
