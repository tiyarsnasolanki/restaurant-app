import { useState, useEffect } from "react";
import api from "../api/axios";
import MenuCard from "../components/customer/MenuCard";
import Spinner  from "../components/shared/Spinner";

const CATEGORIES = ["All", "Starters", "Main Course", "Desserts", "Beverages", "Snacks", "Specials"];

export default function MenuPage() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [category, setCategory] = useState("All");
  const [search,   setSearch]   = useState("");
  const [vegOnly,  setVegOnly]  = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== "All") params.category = category;
    if (search)             params.search   = search;
    if (vegOnly)            params.isVeg    = true;

    api.get("/menu", { params })
      .then((r) => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search, vegOnly]);

  const grouped = CATEGORIES.slice(1).reduce((acc, cat) => {
    const filtered = items.filter((i) => i.category === cat);
    if (filtered.length) acc[cat] = filtered;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-2">Our Menu</h1>
      <p className="text-gray-500 mb-6">Fresh ingredients, great taste — order online, pick up or dine in.</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          className="input max-w-xs"
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === c
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={vegOnly}
            onChange={(e) => setVegOnly(e.target.checked)}
            className="accent-green-600"
          />
          🟢 Veg only
        </label>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-lg">No items found. Try a different filter.</p>
        </div>
      ) : category !== "All" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => <MenuCard key={item._id} item={item} />)}
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="mb-10">
            <h2 className="text-xl font-display font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">
              {cat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {catItems.map((item) => <MenuCard key={item._id} item={item} />)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
