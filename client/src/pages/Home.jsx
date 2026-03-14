import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  { icon: "🍜", title: "Order Online",       desc: "Browse our full menu and place orders from anywhere." },
  { icon: "📅", title: "Book a Table",        desc: "Reserve your spot for dine-in with ease." },
  { icon: "⚡", title: "Real-time Tracking",  desc: "Track your order status live from kitchen to table." },
  { icon: "🌿", title: "Surplus Food Deals",  desc: "Get fresh meals at 50–70% off — reduce food waste." },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[80vh] flex items-center justify-center text-center px-4"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        <div className="relative z-10 max-w-3xl">
          <span className="inline-block bg-primary/20 text-primary border border-primary/30
                           text-sm px-4 py-1 rounded-full mb-6 font-medium">
            Smart Restaurant Management + Zero Waste
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
            Dine Smart.<br />
            <span className="text-primary">Waste Nothing.</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Order food, book tables, and grab surplus meals at huge discounts — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/menu"    className="btn-primary px-8 py-3 text-base rounded-xl">Browse Menu</Link>
            <Link to="/surplus" className="btn-secondary px-8 py-3 text-base rounded-xl bg-transparent
                                           border-white/30 text-white hover:bg-white/10">
              🌿 Surplus Deals
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-display font-bold text-center text-gray-900 mb-3">
          Everything You Need
        </h2>
        <p className="text-center text-gray-500 mb-10">
          From ordering to sustainability — we've got it all covered.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1 text-lg">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Surplus CTA */}
      <section className="bg-gradient-to-r from-green-600 to-teal-500 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-display font-bold mb-3">🌿 Beat Food Waste</h2>
          <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
            Our surplus marketplace connects you with fresh unsold meals at the end of the day —
            great prices, zero guilt.
          </p>
          <Link to="/surplus" className="inline-block bg-white text-green-700 font-semibold
                                          px-8 py-3 rounded-xl hover:bg-green-50 transition-colors">
            See Today's Surplus Deals →
          </Link>
        </div>
      </section>

      {/* CTA for non-logged in users */}
      {!user && (
        <section className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-display font-bold mb-3">Ready to get started?</h2>
          <p className="text-gray-500 mb-6">Create a free account to order, book, and claim deals.</p>
          <Link to="/register" className="btn-primary px-8 py-3 text-base rounded-xl">
            Create Free Account
          </Link>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-secondary text-white/60 text-center py-6 text-sm">
        © {new Date().getFullYear()} RestaurantPro. Built with ❤️ to reduce food waste.
      </footer>
    </div>
  );
}
