import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a custom fetch implementation with retry logic
const customFetch = async (url: string | URL, options?: RequestInit): Promise<Response> => {
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let lastError: Error;

  // Check if this is a token refresh request
  const isAuthRefresh = url.toString().includes('/auth/v1/token') && 
                     options?.body && 
                     typeof options.body === 'string' && 
                     options.body.includes('grant_type=refresh_token');

  while (retryCount < MAX_RETRIES) {
    try {
      // Regular fetch attempt
      const response = await fetch(url, options);
      return response;
    } catch (error: any) {
      // Store last error
      lastError = error;
      
      // Only retry for network errors (like DNS resolution issues)
      if (error instanceof TypeError && 
          (error.message.includes('Failed to fetch') ||
           error.message.includes('NetworkError') ||
           error.message.includes('ERR_NAME_NOT_RESOLVED'))) {
        
        retryCount++;
        
        // Exponential backoff before retry
        const delay = Math.pow(2, retryCount) * 300; // 600ms, 1200ms, 2400ms
        console.warn(`Network error when connecting to Supabase. Retry ${retryCount}/${MAX_RETRIES} after ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Not a network error, don't retry
        throw error;
      }
    }
  }

  // All retries failed
  console.error('Failed to connect to Supabase after multiple attempts');

  // Special handling for auth refresh token errors to prevent unnecessary logouts
  if (isAuthRefresh) {
    console.warn('Auth refresh token request failed due to network issues. Returning fake success to prevent logout.');
    
    // Return a simulated successful response to prevent unwanted logout
    // This keeps the user session alive while offline or when Supabase is unreachable
    return new Response(
      JSON.stringify({
        access_token: 'temp_access_token_during_connectivity_issues',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: localStorage.getItem('supabase.auth.refreshToken') || 'temp_refresh_token',
        user: JSON.parse(localStorage.getItem('supabase.auth.user') || '{}')
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // For other requests, throw the last error
  throw lastError;
};

// Enhanced Supabase client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: customFetch
  }
});

// Helper to check if we're currently offline
export function isOffline(): boolean {
  return !navigator.onLine;
}

// For auth-specific operations - use more resilient error handling
export const supabaseAuth = {
  // Get current user with offline fallback
  getUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data;
    } catch (error) {
      // Fallback to localStorage if network error occurs
      if (!navigator.onLine) {
        const userData = localStorage.getItem('supabase.auth.user');
        if (userData) {
          return { user: JSON.parse(userData) };
        }
      }
      throw error;
    }
  },

  // Get session with offline fallback
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    } catch (error) {
      // Fallback to localStorage if network error occurs
      if (!navigator.onLine) {
        const session = localStorage.getItem('supabase.auth.session');
        if (session) {
          return { session: JSON.parse(session) };
        }
      }
      throw error;
    }
  }
}; 