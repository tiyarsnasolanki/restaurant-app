import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axios";
import Spinner from "../../components/shared/Spinner";

export default function StaffDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Today's Orders",        value: stats?.todayOrders,       icon: "🧾", href: "/staff/orders" },
    { label: "Pending Orders",         value: stats?.pendingOrders,     icon: "⏳", href: "/staff/orders?status=pending" },
    { label: "Today's Reservations",   value: stats?.todayReservations, icon: "📅", href: "/staff/reservations" },
    { label: "Active Surplus Deals",   value: stats?.activeSurplus,     icon: "🌿", href: "/staff/surplus" },
  ];

  const quickLinks = [
    { label: "Manage Orders",        href: "/staff/orders",       icon: "🧾", desc: "View and update order statuses" },
    { label: "Manage Reservations",  href: "/staff/reservations", icon: "📅", desc: "Confirm & seat guests" },
    { label: "Post Surplus Deal",    href: "/staff/surplus",      icon: "🌿", desc: "List unsold food at discounts" },
  ];

  if (loading) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Staff Panel</h1>
        <p className="text-gray-500 mt-1">Manage daily operations efficiently.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} to={c.href} className="stat-card hover:shadow-md transition-shadow">
            <span className="text-2xl">{c.icon}</span>
            <span className="text-3xl font-bold text-gray-900">{c.value ?? "—"}</span>
            <span className="text-sm text-gray-500">{c.label}</span>
          </Link>
        ))}
      </div>

      {/* Revenue (if admin or viewing all) */}
      {stats?.todayRevenue !== undefined && (
        <div className="card mb-8 bg-gradient-to-r from-primary/5 to-orange-50 border-primary/20">
          <p className="text-sm text-gray-500 mb-1">Today's Revenue</p>
          <p className="text-4xl font-bold text-primary">₹{stats.todayRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">Total revenue: ₹{stats.totalRevenue?.toFixed(2)}</p>
        </div>
      )}

      {/* Quick Links */}
      <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickLinks.map((l) => (
          <Link key={l.href} to={l.href}
                className="card hover:shadow-md transition-shadow flex items-start gap-4">
            <span className="text-3xl">{l.icon}</span>
            <div>
              <p className="font-semibold">{l.label}</p>
              <p className="text-gray-500 text-sm">{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
