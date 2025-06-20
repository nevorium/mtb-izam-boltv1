import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, getJakartaTimestamp } from '@/lib/firebase';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  // Google OAuth setup
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: makeRedirectUri({
        scheme: 'murojaah',
        path: 'auth',
      }),
    },
    discovery
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication?.accessToken);
    }
  }, [response]);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Store session info for security tracking
      await AsyncStorage.setItem('lastLoginTime', new Date().toISOString());
      await AsyncStorage.setItem('authProvider', 'email');
      
      return { success: true, user: result.user };
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan saat masuk';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Email tidak terdaftar';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Password salah';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Terlalu banyak percobaan. Coba lagi nanti';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      // Save user data with signup timestamp
      const userData = {
        email: result.user.email,
        displayName: displayName,
        signup_timestamp: getJakartaTimestamp(),
        auth_provider: 'email',
        created_at: new Date(),
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userData);
      
      // Store session info
      await AsyncStorage.setItem('lastLoginTime', new Date().toISOString());
      await AsyncStorage.setItem('authProvider', 'email');
      
      return { success: true, user: result.user };
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan saat mendaftar';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email sudah terdaftar';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password terlalu lemah';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const handleGoogleSignIn = async (accessToken?: string) => {
    if (!accessToken) return { success: false, error: 'Token akses tidak valid' };

    try {
      // Get user info from Google
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );
      const userInfo = await userInfoResponse.json();

      // Check if user exists with this email
      const existingUserQuery = await getDoc(doc(db, 'users_google', userInfo.id));
      
      if (existingUserQuery.exists()) {
        // User exists, sign them in
        const credential = GoogleAuthProvider.credential(null, accessToken);
        const result = await signInWithCredential(auth, credential);
        
        // Store session info
        await AsyncStorage.setItem('lastLoginTime', new Date().toISOString());
        await AsyncStorage.setItem('authProvider', 'google');
        
        return { success: true, user: result.user };
      } else {
        // New user, create account
        const credential = GoogleAuthProvider.credential(null, accessToken);
        const result = await signInWithCredential(auth, credential);
        
        // Save Google user data
        const googleUserData = {
          google_id: userInfo.id,
          email: userInfo.email,
          full_name: userInfo.name,
          profile_picture: userInfo.picture,
          signup_timestamp: getJakartaTimestamp(),
          created_at: new Date(),
        };
        
        await setDoc(doc(db, 'users_google', userInfo.id), googleUserData);
        
        // Also save to regular users collection for consistency
        const userData = {
          email: userInfo.email,
          displayName: userInfo.name,
          photoURL: userInfo.picture,
          signup_timestamp: getJakartaTimestamp(),
          auth_provider: 'google',
          google_id: userInfo.id,
          created_at: new Date(),
        };
        
        await setDoc(doc(db, 'users', result.user.uid), userData);
        
        // Store session info
        await AsyncStorage.setItem('lastLoginTime', new Date().toISOString());
        await AsyncStorage.setItem('authProvider', 'google');
        
        return { success: true, user: result.user, isNewUser: true };
      }
    } catch (error: any) {
      return { success: false, error: 'Gagal masuk dengan Google' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web implementation
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await signInWithCredential(auth, provider);
        
        // Store session info
        await AsyncStorage.setItem('lastLoginTime', new Date().toISOString());
        await AsyncStorage.setItem('authProvider', 'google');
        
        return { success: true, user: result.user };
      } else {
        // Mobile implementation
        const result = await promptAsync();
        if (result.type === 'success') {
          return await handleGoogleSignIn(result.authentication?.accessToken);
        }
        return { success: false, error: 'Login dibatalkan' };
      }
    } catch (error: any) {
      return { success: false, error: 'Gagal masuk dengan Google' };
    }
  };

  const logout = async () => {
    try {
      // 1. Clear all user session data and authentication tokens
      await AsyncStorage.multiRemove([
        'lastLoginTime',
        'authProvider',
        'userPreferences',
        'cachedUserData',
        'sessionToken',
        'refreshToken'
      ]);

      // 2. Update user's last logout timestamp in Firestore (server-side session invalidation)
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            last_logout: getJakartaTimestamp(),
            session_invalidated: true,
            logout_timestamp: new Date()
          });
        } catch (firestoreError) {
          console.warn('Failed to update logout timestamp:', firestoreError);
          // Continue with logout even if Firestore update fails
        }
      }

      // 3. Sign out from Firebase Auth (invalidates server-side session)
      await signOut(auth);

      // 4. Clear any cached data or temporary storage
      if (Platform.OS === 'web') {
        // Clear web storage
        try {
          localStorage.clear();
          sessionStorage.clear();
          
          // Clear browser history to prevent back button access
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '/login');
          }
        } catch (webError) {
          console.warn('Failed to clear web storage:', webError);
        }
      }

      // 5. Set logout success message
      setLogoutMessage('Berhasil keluar dari aplikasi');

      // 6. Clear the message after 3 seconds
      setTimeout(() => {
        setLogoutMessage(null);
      }, 3000);

      return { success: true, message: 'Berhasil keluar dari aplikasi' };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, error: 'Gagal keluar dari aplikasi' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Gagal mengirim email reset password';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Email tidak terdaftar';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const getUserSignupTimestamp = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().signup_timestamp;
      }
      return null;
    } catch (error) {
      console.error('Error getting signup timestamp:', error);
      return null;
    }
  };

  // Security function to check if user session is still valid
  const validateSession = async () => {
    if (!user) return false;

    try {
      const lastLoginTime = await AsyncStorage.getItem('lastLoginTime');
      if (!lastLoginTime) return false;

      const loginTime = new Date(lastLoginTime);
      const now = new Date();
      const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

      // Session expires after 24 hours
      if (hoursSinceLogin > 24) {
        await logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  // Clear logout message manually
  const clearLogoutMessage = () => {
    setLogoutMessage(null);
  };

  return {
    user,
    loading,
    logoutMessage,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    getUserSignupTimestamp,
    validateSession,
    clearLogoutMessage,
  };
}