import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/shared/Spinner";
import toast   from "react-hot-toast";

function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <span className={`text-xs font-mono ${timeLeft === "Expired" ? "text-red-500" : "text-orange-500"}`}>
      ⏳ {timeLeft}
    </span>
  );
}

export default function SurplusPage() {
  const { user }                    = useAuth();
  const [listings, setListings]     = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [claiming, setClaiming]     = useState(null);
  const [vegOnly,  setVegOnly]      = useState(false);

  const fetchListings = () => {
    setLoading(true);
    const params = vegOnly ? { isVeg: true } : {};
    api.get("/surplus", { params })
      .then((r) => setListings(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, [vegOnly]);

  const handleClaim = async (id) => {
    if (!user) { toast.error("Please login to claim deals"); return; }
    setClaiming(id);
    try {
      await api.post(`/surplus/${id}/claim`, { quantity: 1 });
      toast.success("🎉 Deal claimed! Pick up before it expires.");
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to claim");
    } finally {
      setClaiming(null);
    }
  };

  const available = listings.filter((l) => {
    const qty = l.quantityAvailable - l.quantityClaimed;
    return qty > 0 && l.status === "active";
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">🌿 Surplus Food Deals</h1>
        <p className="text-white/90 mb-4">
          Fresh unsold meals at huge discounts — good for your wallet, great for the planet.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <span className="font-bold text-lg">{available.length}</span>
            <span className="ml-1 text-white/80">Active deals</span>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <span className="font-bold text-lg">
              {available.reduce((s, l) => s + l.quantityAvailable - l.quantityClaimed, 0)}
            </span>
            <span className="ml-1 text-white/80">Portions available</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)}
                 className="accent-green-600"/>
          🟢 Veg only
        </label>
        <button onClick={fetchListings}
                className="ml-auto text-sm text-primary hover:underline">
          ↺ Refresh
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : available.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold mb-2">No surplus deals right now</h3>
          <p>Check back later — deals are added throughout the day.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {available.map((listing) => {
            const remaining = listing.quantityAvailable - listing.quantityClaimed;
            return (
              <div key={listing._id}
                   className="card hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                {/* Image */}
                <div className="h-40 rounded-lg overflow-hidden bg-gray-100 mb-3">
                  {listing.image ? (
                    <img src={listing.image} alt={listing.itemName}
                         className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🍱</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{listing.itemName}</h3>
                  {listing.isVeg && (
                    <span className="w-5 h-5 border-2 border-green-600 flex items-center justify-center rounded-sm flex-shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-600"/>
                    </span>
                  )}
                </div>

                {listing.description && (
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2">{listing.description}</p>
                )}

                {/* Pricing */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-gray-400 line-through text-sm">₹{listing.originalPrice}</span>
                  <span className="text-green-600 font-bold text-xl">₹{listing.discountedPrice}</span>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {listing.discountPercent}% OFF
                  </span>
                </div>

                {/* Countdown & quantity */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <CountdownTimer expiresAt={listing.expiresAt} />
                  <span className={`font-medium ${remaining <= 3 ? "text-red-500" : "text-gray-600"}`}>
                    {remaining} left
                  </span>
                </div>

                {/* Claim button */}
                <button
                  onClick={() => handleClaim(listing._id)}
                  disabled={claiming === listing._id}
                  className="btn-primary w-full text-sm py-2 bg-green-600 hover:bg-green-700"
                >
                  {claiming === listing._id ? "Claiming..." : "🎯 Claim Deal"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
