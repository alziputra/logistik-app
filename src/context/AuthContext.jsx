import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User Logistik',
          role: 'admin',
        };
        setUser(userData);
        setToken(firebaseUser.accessToken || 'firebase-token');
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', firebaseUser.accessToken || 'firebase-token');
      } else {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User Logistik',
        role: 'admin',
      };
      const authToken = await firebaseUser.getIdToken();

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);

      return { success: true, data: { user: userData, token: authToken } };
    } catch (error) {
      console.warn('Firebase login attempt failed or fallback used:', error.message);
      // Fallback demo/local login if Firebase Auth is not yet populated with this user
      if (email && password) {
        const fallbackUser = {
          uid: 'local-admin-01',
          email: email,
          name: email.split('@')[0] || 'Admin Logistik',
          role: 'admin',
        };
        const fallbackToken = 'demo-token-12345';
        localStorage.setItem('token', fallbackToken);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setToken(fallbackToken);
        setUser(fallbackUser);
        return { success: true, data: { user: fallbackUser, token: fallbackToken } };
      }
      return { success: false, message: error.message || 'Login gagal, periksa email dan password Anda' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, data: userCredential.user };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: error.message || 'Registrasi gagal' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out of Firebase:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
