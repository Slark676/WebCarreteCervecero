import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

interface UserProfile {
  id: string;
  email: string;
  telefono: string;
  username: string;
  userId: string;
}

function ProfileContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        // Obtener el usuario actual
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError('No hay usuario autenticado');
          return;
        }

        console.log('Usuario actual:', currentUser.uid);

        // Buscar el documento que coincida con el userId del usuario actual
        const usersRef = collection(db, 'admin');
        const q = query(usersRef, where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!isMounted) return;

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          console.log('Datos del perfil encontrado:', data);
          
          if (data) {
            setProfile({
              id: doc.id,
              email: data.email || '',
              telefono: data.telefono || '',
              username: data.username || '',
              userId: data.userId
            });
          }
        } else {
          console.log('No se encontró perfil para el usuario:', currentUser.uid);
          setError('No se encontró información del perfil');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error al obtener perfil:', err);
          setError('Error al cargar el perfil: ' + (err instanceof Error ? err.message : 'Error desconocido'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 text-center text-gray-600">
        No se encontró información del perfil
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Mi Perfil</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nombre
            </label>
            <div className="w-full px-4 py-2 rounded-lg bg-gray-50">
              {profile.username}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <div className="w-full px-4 py-2 rounded-lg bg-gray-50">
              {profile.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Teléfono
            </label>
            <div className="w-full px-4 py-2 rounded-lg bg-gray-50">
              {profile.telefono}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <ErrorBoundary>
      <ProfileContent />
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error en Profile:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <h2 className="text-lg font-semibold mb-2">Algo salió mal</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
