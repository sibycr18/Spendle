import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseAuth, isOffline } from '../lib/supabaseClient';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isOffline: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isOffline: false,
    signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [offline, setOffline] = useState(isOffline());

    // Setup network status listeners
    useEffect(() => {
        const handleOnline = () => setOffline(false);
        const handleOffline = () => setOffline(true);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        // Check active sessions and sets the user
        const initAuth = async () => {
            try {
                const { session } = await supabaseAuth.getSession();
                
                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email!,
                        name: session.user.user_metadata.full_name,
                        avatar_url: session.user.user_metadata.avatar_url,
                    });
                }
            } catch (error) {
                console.warn('Error getting session:', error);
                // Try to recover from localStorage if possible
                const cachedUser = localStorage.getItem('supabase.auth.user');
                if (cachedUser) {
                    try {
                        const userData = JSON.parse(cachedUser);
                        setUser({
                            id: userData.id,
                            email: userData.email,
                            name: userData.user_metadata?.full_name,
                            avatar_url: userData.user_metadata?.avatar_url,
                        });
                    } catch (e) {
                        console.error('Error parsing cached user data:', e);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                // Update local user state
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata.full_name,
                    avatar_url: session.user.user_metadata.avatar_url,
                });
                
                // Also update cached data for offline use
                localStorage.setItem('supabase.auth.user', JSON.stringify(session.user));
                localStorage.setItem('supabase.auth.session', JSON.stringify(session));
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
            // Clear all Supabase-related items from localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('sb-') || key?.startsWith('supabase.auth.')) {
                    localStorage.removeItem(key);
                }
            }
            
            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error && error.message !== 'Auth session missing!') {
                console.error('Error signing out:', error.message);
                throw error;
            }

            // Clear user state
            setUser(null);

            // Clear any session cookies
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });

            // Force a page reload to clear any cached state
            window.location.href = '/';
        } catch (error) {
            console.error('Error during sign out:', error);
            // Still clear the user state and reload
            setUser(null);
            window.location.href = '/';
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isOffline: offline, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
