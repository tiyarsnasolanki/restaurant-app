import { useState, useEffect } from "react";
import api from "../../api/axios";
import Spinner      from "../../components/shared/Spinner";
import StatusBadge  from "../../components/shared/StatusBadge";
import toast        from "react-hot-toast";

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    api.get("/orders").then((r) => setOrders(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const cancel = async (id) => {
    try {
      await api.delete(`/orders/${id}`);
      toast.success("Order cancelled");
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel order");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📦</div>
          <p>No orders yet. Browse the menu and place your first order!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="font-semibold capitalize">{order.orderType}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={order.status} />
                  <StatusBadge status={order.paymentStatus} />
                </div>
              </div>

              <div className="border-t border-b border-gray-100 py-3 my-3 space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} × {item.quantity}</span>
                    <span className="text-gray-600">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="font-bold text-primary">Total: ₹{order.totalAmount.toFixed(2)}</p>
                {order.status === "pending" && (
                  <button onClick={() => cancel(order._id)}
                          className="text-sm text-red-500 hover:text-red-700 border border-red-200
                                     hover:border-red-400 px-3 py-1 rounded-lg transition-colors">
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
