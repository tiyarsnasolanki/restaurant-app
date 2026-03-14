import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

export default function MenuCard({ item }) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="card flex flex-col hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-44 rounded-lg overflow-hidden bg-gray-100 mb-3">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
        {/* Veg / Non-veg indicator */}
        <span className={`absolute top-2 left-2 w-5 h-5 border-2 flex items-center justify-center rounded-sm
          ${item.isVeg ? "border-green-600" : "border-red-600"}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`} />
        </span>
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Unavailable</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 leading-tight">{item.name}</h3>
          <span className="text-primary font-bold whitespace-nowrap">₹{item.price}</span>
        </div>

        {item.description && (
          <p className="text-gray-500 text-xs mb-2 line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span>⏱ {item.preparationTime} min</span>
          {item.tags?.slice(0, 2).map((t) => (
            <span key={t} className="bg-gray-100 px-1.5 py-0.5 rounded">{t}</span>
          ))}
        </div>

        <button
          onClick={handleAdd}
          disabled={!item.isAvailable}
          className="btn-primary w-full text-sm py-1.5 mt-auto"
        >
          + Add to Cart
        </button>
      </div>
    </div>
  );
}
