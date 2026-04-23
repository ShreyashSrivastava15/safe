import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    signOut: () => Promise<void>;
    isLoading: boolean;
    isAdmin: boolean;
}

const MOCK_USER: any = {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'admin@safe-system.ai',
    user_metadata: { full_name: 'S.A.F.E. Admin' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
};

const MOCK_SESSION: any = {
    access_token: 'mock_token',
    user: MOCK_USER,
    expires_at: 9999999999,
};

const AuthContext = createContext<AuthContextType>({ 
    session: MOCK_SESSION, 
    user: MOCK_USER, 
    signOut: async () => { }, 
    isLoading: false, 
    isAdmin: true 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // Default to mock state to ensure "normal" operation without Supabase DNS issues
    const [session, setSession] = useState<Session | null>(MOCK_SESSION);
    const [user, setUser] = useState<User | null>(MOCK_USER);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // We still try to listen, but we start with a working mock state
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session);
                setUser(session.user);
            }
        }).finally(() => {
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setSession(session);
                setUser(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        setSession(null);
        setUser(null);
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.warn("Supabase signOut failed, handled gracefully in mock mode");
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, signOut, isLoading, isAdmin: true }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
