import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  register: (email: string, password: string, profileUrl: string, username: string, telefono: string) => Promise<User>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const db = getFirestore();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const checkAdminStatus = async (uid: string) => {
    try {
      const adminDocRef = doc(db, 'admin', uid);
      const adminDoc = await getDoc(adminDocRef);
      return adminDoc.exists();
    } catch (error) {
      console.error('Error al verificar estado de administrador:', error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const adminDocRef = doc(db, 'admin', currentUser.uid);
        const adminDoc = await getDoc(adminDocRef);
        if (adminDoc.exists()) {
          setUser({
            ...currentUser,
            ...adminDoc.data(),
            isAdmin: true
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, profileUrl: string, username: string, telefono: string) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const adminData = {
        email: email,
        profileUrl: profileUrl || "defaultProfileUrl",
        userId: response.user.uid,
        username: username,
        telefono: telefono,
        createdAt: new Date().toISOString(),
      };

      const adminDocRef = doc(db, "admin", response.user.uid);
      await setDoc(adminDocRef, adminData);

      setUser({ ...response.user, ...adminData, isAdmin: true });
      
      return response.user;
    } catch (error) {
      console.error("Error en el registro:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      const adminDocRef = doc(db, "admin", response.user.uid);
      const adminDoc = await getDoc(adminDocRef);
      
      if (adminDoc.exists()) {
        setUser({ ...response.user, ...adminDoc.data(), isAdmin: true });
      } else {
        // Si el usuario no está en la colección admin, cerrar sesión
        await auth.signOut();
        throw new Error("No tienes permisos de administrador");
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      throw error;
    }
  };

  const isAdmin = () => {
    return true; // Todos los usuarios en la colección admin son administradores
  };

  const value = {
    user,
    loading,
    userRole,
    login,
    logout,
    resetPassword,
    register,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
