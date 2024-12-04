import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

interface Order {
  id: string;
  address: string;
  city: string;
  createdAt: any;
  date: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  phone: string;
  time: string;
  total: number;
  userId: string;
}

interface Filters {
  address: string;
  city: string;
  dateFrom: string;
  dateTo: string;
  totalFrom: string;
  totalTo: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    address: '',
    city: '',
    dateFrom: '',
    dateTo: '',
    totalFrom: '',
    totalTo: ''
  });
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, 'facturacion');
      const querySnapshot = await getDocs(ordersRef);
      
      const ordersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          address: data.address || '',
          city: data.city || '',
          createdAt: data.createdAt,
          date: data.date || '',
          items: data.items || [],
          phone: data.phone || '',
          time: data.time || '',
          total: data.total || 0,
          userId: data.userId || ''
        };
      }) as Order[];
      
      ordersData.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
      
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener pedidos:', err);
      setError('Error al cargar los pedidos');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];

    // Filtrar por dirección
    if (filters.address) {
      result = result.filter(order => 
        order.address.toLowerCase().includes(filters.address.toLowerCase())
      );
    }

    // Filtrar por ciudad
    if (filters.city) {
      result = result.filter(order => 
        order.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filtrar por fecha
    if (filters.dateFrom) {
      result = result.filter(order => 
        new Date(order.date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      result = result.filter(order => 
        new Date(order.date) <= new Date(filters.dateTo)
      );
    }

    // Filtrar por total
    if (filters.totalFrom) {
      result = result.filter(order => 
        order.total >= parseFloat(filters.totalFrom)
      );
    }
    if (filters.totalTo) {
      result = result.filter(order => 
        order.total <= parseFloat(filters.totalTo)
      );
    }

    setFilteredOrders(result);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      address: '',
      city: '',
      dateFrom: '',
      dateTo: '',
      totalFrom: '',
      totalTo: ''
    });
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleReload = async () => {
    setReloading(true);
    await fetchOrders();
    setReloading(false);
  };

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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Botón de recarga */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleReload}
          disabled={reloading}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {reloading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Recargando...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Recargar pedidos</span>
            </>
          )}
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            type="text"
            name="address"
            value={filters.address}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Filtrar por dirección..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad
          </label>
          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Filtrar por ciudad..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rango de fechas
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rango de total
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="totalFrom"
              value={filters.totalFrom}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Desde..."
            />
            <input
              type="number"
              name="totalTo"
              value={filters.totalTo}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Hasta..."
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dirección
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ciudad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.date} {order.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => handleOrderClick(order)}
                    className="text-amber-600 hover:text-amber-900"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles del pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Detalles del Pedido</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Dirección de entrega</p>
                <p className="mt-1">{selectedOrder.address}, {selectedOrder.city}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha y hora</p>
                <p className="mt-1">{selectedOrder.date} {selectedOrder.time}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                <p className="mt-1">{selectedOrder.phone}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
