import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import api  from "../../api/axios";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart, subtotal, itemCount } = useCart();
  const { user }          = useAuth();
  const navigate          = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm]   = useState({
    orderType: "dine-in", tableNumber: "", specialInstructions: "", paymentMethod: "cash"
  });

  const tax           = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryCharge= form.orderType === "delivery" ? 50 : 0;
  const total         = subtotal + tax + deliveryCharge;

  const placeOrder = async () => {
    if (!user) { navigate("/login"); return; }
    setLoading(true);
    try {
      await api.post("/orders", {
        items: items.map(({ menuItem, name, price, quantity }) => ({ menuItem, name, price, quantity })),
        ...form,
        tableNumber: form.tableNumber ? Number(form.tableNumber) : null,
      });
      clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate("/my-orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-display font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious items from the menu!</p>
        <Link to="/menu" className="btn-primary px-8 py-2.5">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.menuItem} className="card flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                }
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-primary font-semibold text-sm">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.menuItem, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-50">−</button>
                <span className="w-6 text-center font-medium">{item.quantity}</span>
                <button onClick={() => updateQty(item.menuItem, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-50">+</button>
              </div>
              <div className="text-right min-w-[60px]">
                <p className="font-semibold">₹{item.price * item.quantity}</p>
                <button onClick={() => removeItem(item.menuItem)}
                        className="text-xs text-red-400 hover:text-red-600">Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary & Order form */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-4">Order Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-gray-600 mb-1">Order Type</label>
                <select className="input" value={form.orderType}
                        onChange={(e) => setForm({ ...form, orderType: e.target.value })}>
                  <option value="dine-in">Dine In</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="delivery">Delivery (+₹50)</option>
                </select>
              </div>
              {form.orderType === "dine-in" && (
                <div>
                  <label className="block text-gray-600 mb-1">Table Number</label>
                  <input type="number" className="input" placeholder="e.g. 5"
                         value={form.tableNumber}
                         onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}/>
                </div>
              )}
              <div>
                <label className="block text-gray-600 mb-1">Payment</label>
                <select className="input" value={form.paymentMethod}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Special Instructions</label>
                <textarea className="input resize-none" rows={2} placeholder="Any allergies or requests..."
                          value={form.specialInstructions}
                          onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}/>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">Bill Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
              {deliveryCharge > 0 && (
                <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>₹{deliveryCharge}</span></div>
              )}
              <hr className="border-gray-100"/>
              <div className="flex justify-between font-bold text-base">
                <span>Total</span><span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={placeOrder} disabled={loading}
                    className="btn-primary w-full mt-4 py-2.5">
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
