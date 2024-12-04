import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Layout from './components/Layout';
import Orders from './components/Orders';
import Profile from './components/Profile';
import UserReservations from './components/UserReservations';
import UserManagement from './components/UserManagement';

// Componente protegido que verifica la autenticación y el rol de administrador
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Acceso Denegado</h2>
            <p className="mt-2 text-gray-600">
              No tienes permisos de administrador para acceder a esta página.
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <AdminRoute>
                <Layout>
                  <Orders />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <AdminRoute>
                <Layout>
                  <Orders />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <AdminRoute>
                <Layout>
                  <Profile />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/user-reservations"
            element={
              <AdminRoute>
                <Layout>
                  <UserReservations />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <AdminRoute>
                <Layout>
                  <UserManagement />
                </Layout>
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
