import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess('Se ha enviado un correo con las instrucciones para restablecer tu contraseña.');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      setError('Error al enviar el correo de recuperación. Por favor, verifica tu dirección de correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl shadow-lg">
        {/* Logo Section */}
        <div className="hidden md:flex md:w-1/2 bg-amber-400 items-center justify-center p-12">
          <div className="bg-white rounded-xl p-8 w-full max-w-sm">
            <img
              src={logo}
              alt="Carrete Cervecero"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Reset Password Form Section */}
        <div className="w-full md:w-1/2 bg-white p-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-2">Recuperar Contraseña</h2>
            <p className="text-gray-600 mb-8">
              Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-amber-500 hover:text-amber-600"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
