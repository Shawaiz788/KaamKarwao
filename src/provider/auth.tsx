import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from '@react-native-firebase/auth';

interface AuthContextType {
    user: User | null;
    initializing: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    initializing: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Listen to Firebase auth state changes
        const auth = getAuth();
        const subscriber = onAuthStateChanged(auth, (userState) => {
            setUser(userState);
            if (initializing) setInitializing(false);
        });
        return subscriber; // unsubscribe on unmount
    }, [initializing]);

    return (
        <AuthContext.Provider value={{ user, initializing }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
