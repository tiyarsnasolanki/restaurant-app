import { useState, useEffect } from "react";
import api from "../../api/axios";
import Spinner from "../../components/shared/Spinner";
import toast   from "react-hot-toast";

const CATEGORIES = ["Starters","Main Course","Desserts","Beverages","Snacks","Specials"];
const blank = {
  name:"", description:"", price:"", category:"Starters",
  image:"", isVeg:false, isAvailable:true, tags:"", preparationTime:15
};

export default function AdminMenu() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(blank);
  const [editing, setEditing] = useState(null); // id being edited
  const [saving,  setSaving]  = useState(false);
  const [showForm,setShowForm]= useState(false);
  const [catFilter,setCat]    = useState("All");

  const fetch = () => {
    api.get("/menu").then((r) => setItems(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const openEdit = (item) => {
    setEditing(item._id);
    setForm({ ...item, tags: (item.tags || []).join(", "), price: item.price.toString() });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(blank); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: +form.price,
      preparationTime: +form.preparationTime,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    try {
      if (editing) {
        await api.put(`/menu/${editing}`, payload);
        toast.success("Menu item updated!");
      } else {
        await api.post("/menu", payload);
        toast.success("Menu item created!");
      }
      closeForm();
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success("Item deleted");
      fetch();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await api.patch(`/menu/${item._id}/availability`, { isAvailable: !item.isAvailable });
      toast.success(`${item.name} ${!item.isAvailable ? "enabled" : "disabled"}`);
      fetch();
    } catch {
      toast.error("Failed to update");
    }
  };

  const f = (field) => ({
    value: form[field],
    onChange: (e) => setForm({ ...form, [field]: e.target.value }),
  });

  const displayed = catFilter === "All" ? items : items.filter((i) => i.category === catFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold">Menu Management</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(blank); }}
                className="btn-primary text-sm">
          {showForm ? "✕ Close" : "+ Add Item"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-8 border-primary/30 border-2">
          <h2 className="font-semibold text-lg mb-4">{editing ? "Edit Item" : "Add New Menu Item"}</h2>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input required className="input" placeholder="Paneer Butter Masala" {...f("name")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select required className="input" {...f("category")}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input required type="number" min="0" className="input" placeholder="299" {...f("price")} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input className="input" placeholder="Rich creamy tomato-based gravy..." {...f("description")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
              <input type="number" className="input" {...f("preparationTime")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="url" className="input" placeholder="https://..." {...f("image")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input className="input" placeholder="spicy, popular, new" {...f("tags")} />
            </div>
            <div className="flex gap-6 items-center sm:col-span-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isVeg}
                       onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
                       className="accent-green-600" />
                🟢 Vegetarian
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isAvailable}
                       onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                       className="accent-blue-600" />
                Available now
              </label>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary px-6">
                {saving ? "Saving..." : editing ? "Update Item" : "Add Item"}
              </button>
              <button type="button" onClick={closeForm} className="btn-secondary px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {["All", ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setCat(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    catFilter === c ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>{c}</button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayed.map((item) => (
            <div key={item._id} className={`card flex flex-col transition-shadow hover:shadow-md
              ${!item.isAvailable ? "opacity-60" : ""}`}>
              <div className="h-36 rounded-lg overflow-hidden bg-gray-100 mb-3 relative">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                }
                {!item.isAvailable && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Unavailable
                  </div>
                )}
                {item.isVeg && (
                  <div className="absolute top-2 left-2 w-5 h-5 border-2 border-green-600 bg-white
                                  flex items-center justify-center rounded-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-600"/>
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
                <span className="text-primary font-bold text-sm ml-2 whitespace-nowrap">₹{item.price}</span>
              </div>
              <p className="text-xs text-gray-400 mb-1">{item.category}</p>
              <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(item)}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  Edit
                </button>
                <button onClick={() => toggleAvailability(item)}
                        className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
                          item.isAvailable
                            ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}>
                  {item.isAvailable ? "Disable" : "Enable"}
                </button>
                <button onClick={() => deleteItem(item._id)}
                        className="text-xs py-1.5 px-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
