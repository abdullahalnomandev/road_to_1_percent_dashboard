import React, { useContext, useEffect, useState } from 'react';
import { useProfileQuery } from '../redux/apiSlices/authSlice';

type User = {
  email: string;
  image: string;
  name: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN"; 
  status: "active" | "inactive"; 
};

export const UserContext = React.createContext<User | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const { data } = useProfileQuery({});
    const profile = data?.data as User; // assert type if your API returns this

    useEffect(() => {
        if (profile) {
            setUser(profile);
        }
    }, [profile]);

    return (
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = (): User => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
