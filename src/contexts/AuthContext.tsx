import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    signIn: (token: string, user: User) => void;
    signUp: (token: string, user: User) => void;
    signOut: () => void;
    isLoading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('safe_auth_token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    // Token invalid or expired
                    localStorage.removeItem('safe_auth_token');
                    setToken(null);
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth validation failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [token]);

    const signIn = (newToken: string, userData: User) => {
        localStorage.setItem('safe_auth_token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const signUp = (newToken: string, userData: User) => {
        localStorage.setItem('safe_auth_token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const signOut = () => {
        localStorage.removeItem('safe_auth_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            signIn, 
            signUp, 
            signOut, 
            isLoading, 
            isAdmin: user?.email === 'shreyashsr2004@gmail.com'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
