import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  isAuthenticated: boolean;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user_data');
    const token = localStorage.getItem('access_token');
    return savedUser && token ? JSON.parse(savedUser) : null;
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('No access token found for profile fetch');
        return;
      }

      const response = await fetch('http://localhost:8000/api/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Profile fetch failed with status:', response.status);
        return;
      }

      const profileData = await response.json();
      
      // Update user with profile information using functional state update
      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        
        const updatedUser: User = {
          ...currentUser,
          name: profileData.name || profileData.email,
        };
        
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        return updatedUser;
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Don't throw - just log the error and continue
    }
  }, []); // Remove user dependency to avoid infinite loops

  // Fetch profile data when component mounts if user exists
  useEffect(() => {
    if (user && user.name === user.email) {
      fetchUserProfile();
    }
  }, []); // Only run once on mount

  const login = async (email: string, password: string) => {
    try {
      // Send login request to backend API
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const loginData = await response.json();
      
      // Store JWT token and user data
      localStorage.setItem('access_token', loginData.access_token);
      localStorage.setItem('user_data', JSON.stringify(loginData.user));
      
      // Convert backend user format to frontend User type
      const frontendUser: User = {
        id: loginData.user.id.toString(),
        name: loginData.user.name, // Temporary, will be updated by profile fetch
        email: loginData.user.email,
        role: loginData.user.role,
        // Add other fields as needed
      };
      
      setUser(frontendUser);
      
      // Fetch profile data to get the real name and check sessions
      try {
        const profileResponse = await fetch('http://localhost:8000/api/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginData.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const updatedUser: User = {
            ...frontendUser,
            name: profileData.name || profileData.email, // Use name from /api/me response
          };
        console.log(updatedUser.name)
          setUser(updatedUser);
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
        }
      } catch (profileError) {
        console.warn('Could not fetch profile data:', profileError);
        // Continue with basic user data if profile fetch fails
      }

      // Check sessions immediately after login for therapists
      if (frontendUser.role === 'therapist') {
        console.log('🔔 Therapist login detected, checking sessions...');
        try {
          const sessionCheckResponse = await fetch('http://localhost:8000/api/sessions/check-on-login', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${loginData.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('🔔 Session check response status:', sessionCheckResponse.status);

          if (sessionCheckResponse.ok) {
            const sessionCheckData = await sessionCheckResponse.json();
            console.log('🔔 Session check completed successfully:', sessionCheckData);
            
            // Store session check data for use by notification system
            localStorage.setItem('login_session_check', JSON.stringify(sessionCheckData));
            
            // Dispatch custom event for components that need to handle login notifications
            console.log('🔔 Dispatching loginSessionCheck event');
            window.dispatchEvent(new CustomEvent('loginSessionCheck', { 
              detail: sessionCheckData 
            }));
          } else {
            console.error('🔔 Session check failed with status:', sessionCheckResponse.status);
            const errorText = await sessionCheckResponse.text();
            console.error('🔔 Session check error response:', errorText);
          }
        } catch (sessionError) {
          console.error('🔔 Session check error:', sessionError);
          // Don't fail login if session check fails
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      // Send registration request to backend API
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.name?.split(' ')[0] || '',
          lastName: userData.name?.split(' ')[1] || '',
          email: userData.email,
          password: userData.password,
          role: userData.role || 'parent',
          phone: userData.phone,
          address: userData.address,
          emergencyContact: userData.emergencyContact
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const registrationData = await response.json();
      
      // Convert backend user format to frontend User type
      const newUser: User = {
        id: registrationData.id.toString(),
        name: registrationData.email, // We'll use email as name for now
        email: registrationData.email,
        role: registrationData.role,
        phone: userData.phone,
        address: userData.address,
        emergencyContact: userData.emergencyContact,
      };
      
      setUser(newUser);
      localStorage.setItem('user_data', JSON.stringify(registrationData));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user;

  // Add tab close protection when user is logged in
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isAuthenticated) {
        // Modern browsers require returnValue to be set
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave? You will be logged out.';
        return 'Are you sure you want to leave? You will be logged out.';
      }
    };

    const handleUnload = () => {
      // Don't clear localStorage on page refresh - only on actual tab close
      // This prevents logout on page reload
      // if (isAuthenticated) {
      //   localStorage.removeItem('access_token');
      //   localStorage.removeItem('user_data');
      //   localStorage.removeItem('login_session_check');
      // }
    };

    if (isAuthenticated) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('unload', handleUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};