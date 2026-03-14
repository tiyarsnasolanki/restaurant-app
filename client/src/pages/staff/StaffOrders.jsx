import { useState, useEffect } from "react";
import api from "../../api/axios";
import Spinner     from "../../components/shared/Spinner";
import StatusBadge from "../../components/shared/StatusBadge";
import toast       from "react-hot-toast";

const ORDER_STATUSES = ["pending","confirmed","preparing","ready","delivered","cancelled"];
const FILTERS        = ["all","pending","confirmed","preparing","ready","delivered"];

export default function StaffOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  const fetch = () => {
    setLoading(true);
    const params = filter !== "all" ? { status: filter } : {};
    api.get("/orders", { params })
      .then((r) => setOrders(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetch, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success(`Order marked as ${status}`);
      fetch();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const updatePayment = async (id, paymentStatus) => {
    try {
      await api.patch(`/orders/${id}/payment`, { paymentStatus });
      toast.success("Payment status updated");
      fetch();
    } catch {
      toast.error("Failed to update payment");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold">Orders</h1>
        <button onClick={fetch} className="btn-secondary text-sm py-1.5 px-3">↺ Refresh</button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                    filter === f ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                  <p className="font-semibold mt-0.5">{order.customer?.name}</p>
                  <p className="text-xs text-gray-400">{order.customer?.phone} · {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-lg">₹{order.totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 capitalize">{order.orderType}
                    {order.tableNumber ? ` · Table ${order.tableNumber}` : ""}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="text-gray-600">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                {order.specialInstructions && (
                  <p className="text-xs text-orange-600 mt-2 pt-2 border-t border-gray-200">
                    📝 {order.specialInstructions}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500 font-medium mr-1">Update:</span>
                {ORDER_STATUSES.filter((s) => s !== order.status).map((s) => (
                  <button key={s} onClick={() => updateStatus(order._id, s)}
                          className="text-xs px-2.5 py-1 rounded-full border border-gray-300
                                     hover:border-primary hover:text-primary transition-colors capitalize">
                    {s}
                  </button>
                ))}
                {order.paymentStatus === "pending" && (
                  <button onClick={() => updatePayment(order._id, "paid")}
                          className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700
                                     hover:bg-green-200 transition-colors ml-auto">
                    ✓ Mark Paid
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
