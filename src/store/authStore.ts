import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Permission {
    [key: string]: boolean;
}

interface Role {
    _id: string;
    name: string;
    permissions: Permission;
}

interface User {
    _id: string;
    username: string;
    role: string | Role; // Can be string (legacy) or Role object
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
        }
    )
);
