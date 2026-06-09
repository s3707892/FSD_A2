import { useState, useEffect, createContext, useContext, ReactNode, createElement } from 'react';
import { User, AuthContextType } from '../types';
import { getCurrentUser, setCurrentUser } from '../utils/localStorage';
import { signIn as apiSignIn } from '../api/User';

// shared auth conte across the web
const AuthContext = 
  createContext<AuthContextType | null>(null);
    interface AuthProviderProps {
    children: 
    ReactNode;
  }

export const AuthProvider = 
   ({ children }: AuthProviderProps) => {
      const [currentUser, setCurrentUserState] = 
         useState<User | null>(getCurrentUser);

  // keep localstorage in sync whenever current user changes
  useEffect(() => {
    setCurrentUser(currentUser);
  }, [currentUser]);

  // case insensitive email check against authenticated users
  const signIn = async (email: string, password: string): Promise<string | false> => {
    try {
      const user = await apiSignIn(email, password);
      
      if (user === false) return false;

      setCurrentUser(user);
      setCurrentUserState(user);
      return user.role;

    } catch (err) {
      console.error(err);
      return false;
    }
  };


  // clear user from localstorage on sign out
  const signOut = (): void => {
    setCurrentUserState(null);
    setCurrentUser(null);
  };




  // merge updates into current user without replacing the whole object
  const updateCurrentUser = (updates: Partial<User>): void => {
    if (currentUser) {
      const updatedUser = 
      { ...currentUser, ...updates };
      setCurrentUserState(updatedUser);
      setCurrentUser(updatedUser);
    }
  };

  // Const to authentication
  const value: AuthContextType = {
    currentUser,
    signIn,
    signOut,
    updateCurrentUser,
    isAuthenticated: currentUser !== null,
  };

  return createElement(AuthContext.Provider, { value }, children);
};

// grab auth state and actions from anywhere in the app
export const useAuth = (): AuthContextType =>
  {const ctx = useContext(AuthContext);
    if (!ctx)
      {
      // making its wrapped in authprovider or it wont work
      throw new Error('useAuth needs to be used inside <AuthProvider>');
      }
    return ctx;
 };