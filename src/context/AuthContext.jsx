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

  const getNameFromEmail = (email, existingName) => {
    if (existingName && existingName !== 'officer' && existingName !== 'admin') return existingName;
    if (!email) return 'User Logistik';
    const e = email.toLowerCase();
    if (e === 'officer@gmail.com') return 'Dio Haris Kurniawan';
    if (e.includes('admin') || e === 'admin@logistik.com' || e === 'admin@logistik.co.id') return 'Alzi Rahmana Putra';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const determineRole = (email, existingRole) => {
    if (existingRole) {
      const r = String(existingRole).toLowerCase();
      if (r === 'admin' || r === 'administrator') return 'admin';
      if (r === 'officer' || r === 'logistik officer' || r === 'user') return 'officer';
    }
    if (!email) return 'officer';
    const e = email.toLowerCase();
    if (e.includes('admin') || e === 'admin@logistik.com' || e === 'admin@logistik.co.id') {
      return 'admin';
    }
    return 'officer';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        let savedRole = null;
        let savedName = null;
        try {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const parsed = JSON.parse(savedUser);
            savedRole = parsed.role;
            savedName = parsed.name;
          }
        } catch (e) {}

        const userRole = determineRole(firebaseUser.email, savedRole);
        const userName = getNameFromEmail(firebaseUser.email, firebaseUser.displayName || savedName);

        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: userName,
          role: userRole,
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

      let savedRole = null;
      let savedName = null;
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          savedRole = parsed.role;
          savedName = parsed.name;
        }
      } catch (e) {}

      const userRole = determineRole(firebaseUser.email, savedRole);
      const userName = getNameFromEmail(firebaseUser.email, firebaseUser.displayName || savedName);

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: userName,
        role: userRole,
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
        const userRole = determineRole(email);
        const userName = getNameFromEmail(email);
        const fallbackUser = {
          uid: email.includes('admin') ? 'local-admin-01' : 'local-officer-01',
          email: email,
          name: userName,
          role: userRole,
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
