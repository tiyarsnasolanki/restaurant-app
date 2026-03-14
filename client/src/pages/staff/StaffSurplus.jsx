import { useState, useEffect } from "react";
import api from "../../api/axios";
import Spinner     from "../../components/shared/Spinner";
import StatusBadge from "../../components/shared/StatusBadge";
import toast       from "react-hot-toast";

const defaultForm = {
  itemName: "", description: "", originalPrice: "", discountedPrice: "",
  quantityAvailable: "", category: "Food", isVeg: false,
  expiresAt: "", image: "", tags: "",
};

export default function StaffSurplus() {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(defaultForm);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetch = () => {
    api.get("/surplus/all").then((r) => setListings(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  // Default expiry = end of today
  const defaultExpiry = () => {
    const d = new Date();
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (+form.discountedPrice >= +form.originalPrice) {
      toast.error("Discounted price must be less than original price");
      return;
    }
    setSaving(true);
    try {
      await api.post("/surplus", {
        ...form,
        originalPrice:     +form.originalPrice,
        discountedPrice:   +form.discountedPrice,
        quantityAvailable: +form.quantityAvailable,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      });
      toast.success("Surplus listing created!");
      setForm(defaultForm);
      setShowForm(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create listing");
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id) => {
    try {
      await api.patch(`/surplus/${id}`, { status: "cancelled" });
      toast.success("Listing cancelled");
      fetch();
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const f = (field) => ({
    value: form[field],
    onChange: (e) => setForm({ ...form, [field]: e.target.value }),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold">Surplus Food Listings</h1>
        <button onClick={() => { setShowForm(!showForm); setForm({ ...defaultForm, expiresAt: defaultExpiry() }); }}
                className="btn-primary text-sm">
          {showForm ? "✕ Close" : "+ New Listing"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card mb-8 border-primary/30 border-2">
          <h2 className="font-semibold text-lg mb-4">🌿 Post Surplus Deal</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input required className="input" placeholder="e.g. Butter Chicken" {...f("itemName")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input" {...f("category")}>
                {["Food","Desserts","Beverages","Snacks","Combo"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹) *</label>
              <input required type="number" min="1" className="input" placeholder="350" {...f("originalPrice")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price (₹) *</label>
              <input required type="number" min="1" className="input" placeholder="150" {...f("discountedPrice")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available *</label>
              <input required type="number" min="1" className="input" placeholder="5" {...f("quantityAvailable")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires At *</label>
              <input required type="datetime-local" className="input" {...f("expiresAt")} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input className="input" placeholder="Freshly cooked, still warm..." {...f("description")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="url" className="input" placeholder="https://..." {...f("image")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input className="input" placeholder="spicy, rice, popular" {...f("tags")} />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" id="isVeg" checked={form.isVeg}
                     onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
                     className="accent-green-600" />
              <label htmlFor="isVeg" className="text-sm font-medium text-gray-700 cursor-pointer">
                🟢 Vegetarian item
              </label>
            </div>

            {/* Preview discount */}
            {form.originalPrice && form.discountedPrice && +form.originalPrice > 0 && (
              <div className="sm:col-span-2 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                <span className="text-green-700 font-medium">
                  Discount: {Math.round((1 - form.discountedPrice / form.originalPrice) * 100)}% OFF
                  — saving customers ₹{form.originalPrice - form.discountedPrice}
                </span>
              </div>
            )}

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary px-6">
                {saving ? "Posting..." : "Post Listing"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-6">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listings table */}
      {loading ? <Spinner /> : listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🌱</div>
          <p>No surplus listings yet. Post your first deal!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((l) => {
            const remaining = l.quantityAvailable - l.quantityClaimed;
            const savings   = l.originalPrice - l.discountedPrice;
            return (
              <div key={l._id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{l.itemName}</h3>
                      {l.isVeg && <span className="text-xs text-green-600 font-medium">🟢 Veg</span>}
                      <StatusBadge status={l.status} />
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{l.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-gray-400 line-through">₹{l.originalPrice}</span>
                      <span className="text-green-600 font-bold">₹{l.discountedPrice}</span>
                      <span className="text-gray-500">{l.discountPercent}% off · saving ₹{savings}</span>
                      <span className="text-gray-500">{remaining}/{l.quantityAvailable} remaining</span>
                      <span className="text-gray-400 text-xs">
                        Expires: {new Date(l.expiresAt).toLocaleString()}
                      </span>
                    </div>
                    {l.claimedBy?.length > 0 && (
                      <p className="text-xs text-teal-600 mt-1">
                        ✓ Claimed by {l.claimedBy.length} customer(s)
                      </p>
                    )}
                  </div>
                  {l.status === "active" && (
                    <button onClick={() => cancel(l._id)}
                            className="text-xs text-red-500 hover:text-red-700 border border-red-200
                                       hover:border-red-400 px-3 py-1 rounded-lg transition-colors">
                      Cancel Listing
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
