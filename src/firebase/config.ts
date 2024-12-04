// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWw5vhwXvXkQaAOpYigNQiEak7M4PF0Mg",
  authDomain: "app-carrete-cervecero.firebaseapp.com",
  projectId: "app-carrete-cervecero",
  storageBucket: "app-carrete-cervecero.firebasestorage.app",
  messagingSenderId: "188099229307",
  appId: "1:188099229307:web:c847796c13ed865b8014de",
  measurementId: "G-SD79F4BTSQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Función para comprobar la conexión con Firebase
export const checkFirebaseConnection = async () => {
  try {
    // Verificar si el usuario está autenticado
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('⚠️ Usuario no autenticado');
      return {
        success: false,
        message: 'Usuario no autenticado',
        error: 'Debes iniciar sesión para acceder a los datos'
      };
    }

    // Intentamos obtener una colección
    const testCollection = collection(db, 'facturacion');
    const snapshot = await getDocs(testCollection);
    
    console.log('✅ Conexión exitosa con Firebase');
    console.log(`📦 Documentos encontrados en facturacion: ${snapshot.size}`);
    return {
      success: true,
      message: 'Conexión exitosa con Firebase',
      documentsCount: snapshot.size
    };
  } catch (error) {
    console.error('❌ Error al conectar con Firebase:', error);
    return {
      success: false,
      message: 'Error al conectar con Firebase',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

export default app;