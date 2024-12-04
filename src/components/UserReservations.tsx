import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  reservations: number;
}

export default function UserReservations() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersWithReservations = async () => {
      try {
        // Obtener todos los usuarios
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = new Map();
        
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          usersData.set(userData.userId, {
            id: userData.userId,
            email: userData.email,
            phone: userData.telefono,
            name: userData.username,
            reservations: 0
          });
        });

        // Obtener todas las facturas y contar reservas
        const facturasSnapshot = await getDocs(collection(db, 'facturacion'));
        
        facturasSnapshot.forEach((doc) => {
          const factura = doc.data();
          if (factura.userId && usersData.has(factura.userId)) {
            const userData = usersData.get(factura.userId);
            userData.reservations += 1;
            usersData.set(factura.userId, userData);
          }
        });

        // Filtrar solo usuarios con reservas
        const usersWithReservations = Array.from(usersData.values())
          .filter(user => user.reservations > 0)
          .sort((a, b) => b.reservations - a.reservations); // Ordenar por número de reservas

        setUsers(usersWithReservations);
      } catch (error) {
        console.error('Error al obtener usuarios con reservas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersWithReservations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Usuarios con Reservas</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Reservas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.phone || 'No especificado'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.name || 'No especificado'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                    {user.reservations}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No se encontraron usuarios con reservas
          </div>
        )}
      </div>
    </div>
  );
}
