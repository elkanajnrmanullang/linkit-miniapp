// Halaman Dashboard Utama
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [coffees, setCoffees] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCoffee, setSelectedCoffee] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [coffeeRes, orderRes] = await Promise.all([
        api.get('/coffees'),
        api.get('/orders')
      ]);
      setCoffees(coffeeRes.data);
      setOrders(orderRes.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    try {
      await api.post('/orders', { coffeeId: selectedCoffee.id, quantity: Number(quantity) });
      setSelectedCoffee(null);
      setQuantity(1);
      fetchData();
    } catch (error) {
      alert('Gagal membuat pesanan');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard LinkIT</h1>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-700">Master Data Kopi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[70vh] overflow-y-auto pr-2">
            {coffees.map(coffee => (
              <div key={coffee.id} className="bg-white p-4 rounded shadow border border-gray-100 flex flex-col">
                <img src={coffee.image} alt={coffee.title} className="w-full h-32 object-cover mb-3 rounded" />
                <h3 className="font-bold text-lg mb-1">{coffee.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-grow">{coffee.description}</p>
                <button onClick={() => setSelectedCoffee(coffee)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full font-semibold transition">
                  Buat Order
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-700">Data Transaksional Order</h2>
          <div className="bg-white p-4 rounded shadow border border-gray-100 h-[70vh] overflow-y-auto">
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Belum ada transaksi</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="border-b py-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">Order #{order.id} - {order.coffee?.title}</p>
                      <p className="text-sm text-gray-600">Jumlah: {order.quantity} | Total: Rp{order.totalPrice.toLocaleString('id-ID')}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedCoffee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h3 className="text-lg font-bold mb-2 text-gray-800">Form Transaksi Baru</h3>
            <p className="text-sm text-gray-600 mb-4">Produk: {selectedCoffee.title}</p>
            <form onSubmit={handleOrder}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Pemesanan</label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 p-2 rounded mb-6 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSelectedCoffee(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold transition">Batal</button>
                <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold transition">Simpan Transaksi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}