import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Create Context
const AuthContext = createContext();

// Custom Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Register with email and password
  const register = async (email, password, fullName) => {
    try {
      setError('');
      setAuthLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
      
      setCurrentUser({ 
        ...userCredential.user, 
        displayName: fullName 
      });
      
      return userCredential.user;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      setError('');
      setAuthLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      
      return userCredential.user;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      setError('');
      setAuthLoading(true);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const userCredential = await signInWithPopup(auth, provider);
      setCurrentUser(userCredential.user);
      
      return userCredential.user;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError('');
      setAuthLoading(true);
      
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError('');
      setAuthLoading(true);
      
      await sendPasswordResetEmail(auth, email);
      
      return { success: true, message: 'Password reset email sent successfully!' };
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      setError('');
      setAuthLoading(true);
      
      if (!auth.currentUser) {
        throw new Error('No user is currently logged in');
      }
      
      await updateProfile(auth.currentUser, updates);
      setCurrentUser({ ...auth.currentUser, ...updates });
      
      return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Firebase error message mapper
  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email or login.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please check your email or create a new account.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Popup was blocked. Please allow popups for this site.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email but different sign-in credentials.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed. Please contact support.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/requires-recent-login':
        return 'This operation requires recent authentication. Please log in again.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    register,
    login,
    logout,
    signInWithGoogle,
    resetPassword,
    updateUserProfile,
    error,
    setError,
    loading,
    authLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ✅ REMOVE THIS LINE - Don't export default
// export default AuthContext;
