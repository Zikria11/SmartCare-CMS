import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '@/services/ApiService';

type UserRole = 'Patient' | 'Doctor' | 'Receptionist' | 'LabTechnician' | 'Admin';
type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

interface Profile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  specialization?: string;
  licenseNumber?: string;
}

interface AuthContextType {
  user: any | null; // We'll use any for now since we don't have a specific user type
  session: any | null; // We'll use any for now
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole, additionalData?: Partial<Profile>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null); // Using any for now
  const [session, setSession] = useState<any | null>(null); // Using any for now
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    // In our implementation, we might refresh profile data from the API
    // For now, we'll just use the stored profile
    if (profile) {
      setProfile(profile);
    }
  };

  useEffect(() => {
    // Check if user is already logged in by checking for token
    const token = apiService.getToken();
    if (token) {
      // In a real implementation, we might want to verify the token
      // For now, we'll just set loading to false
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    additionalData?: Partial<Profile>
  ) => {
    try {
      const userData = {
        username: email.split('@')[0], // Use part of email as username
        email,
        password,
        fullName,
        role,
        ...additionalData
      };

      const response = await apiService.register(userData);

      const normalizeRole = (role: any): UserRole => {
        if (typeof role === 'string') return role as UserRole;
        const roles: Record<number, UserRole> = {
          0: 'Patient',
          1: 'Doctor',
          2: 'Receptionist',
          3: 'LabTechnician',
          4: 'Admin'
        };
        return roles[role] || 'Patient';
      };

      const normalizedUser = {
        ...response.user,
        role: normalizeRole(response.user.role)
      };

      // Update user and profile based on response
      setUser(normalizedUser);
      setProfile(normalizedUser);

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);

      const normalizeRole = (role: any): UserRole => {
        if (typeof role === 'string') return role as UserRole;
        const roles: Record<number, UserRole> = {
          0: 'Patient',
          1: 'Doctor',
          2: 'Receptionist',
          3: 'LabTechnician',
          4: 'Admin'
        };
        return roles[role] || 'Patient';
      };

      const normalizedUser = {
        ...response.user,
        role: normalizeRole(response.user.role)
      };

      // Update user and profile based on response
      setUser(normalizedUser);
      setProfile(normalizedUser);

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    apiService.clearToken();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};