import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import api from "../../api/axios";
import Spinner from "../../components/shared/Spinner";

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats)  return <p className="p-8 text-gray-500">Failed to load stats.</p>;

  const statCards = [
    { label: "Total Orders",       value: stats.totalOrders,       icon: "🧾", color: "text-blue-600"   },
    { label: "Today's Orders",     value: stats.todayOrders,       icon: "📦", color: "text-orange-600" },
    { label: "Pending Orders",     value: stats.pendingOrders,     icon: "⏳", color: "text-yellow-600" },
    { label: "Total Customers",    value: stats.totalCustomers,    icon: "👥", color: "text-purple-600"  },
    { label: "Total Menu Items",   value: stats.totalMenuItems,    icon: "🍽️", color: "text-teal-600"   },
    { label: "Today's Revenue",    value: `₹${stats.todayRevenue.toFixed(0)}`, icon: "💰", color: "text-green-600" },
    { label: "Total Revenue",      value: `₹${stats.totalRevenue.toFixed(0)}`, icon: "📈", color: "text-green-700" },
    { label: "Active Surplus",     value: stats.activeSurplus,     icon: "🌿", color: "text-emerald-600" },
  ];

  const weekData = stats.weeklyRevenue.map((d) => ({
    day:     new Date(d._id).toLocaleDateString("en-IN", { weekday: "short" }),
    revenue: Math.round(d.revenue),
    orders:  d.orders,
  }));

  const quickLinks = [
    { label: "Manage Menu",  href: "/admin/menu",  icon: "🍽️" },
    { label: "Manage Users", href: "/admin/users", icon: "👥" },
    { label: "View Orders",  href: "/staff/orders",icon: "🧾" },
    { label: "Reservations", href: "/staff/reservations", icon: "📅" },
    { label: "Surplus",      href: "/staff/surplus", icon: "🌿" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Full overview of your restaurant operations.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((c) => (
          <div key={c.label} className="stat-card">
            <span className="text-2xl">{c.icon}</span>
            <span className={`text-2xl font-bold ${c.color}`}>{c.value}</span>
            <span className="text-xs text-gray-500">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Revenue Chart */}
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-lg mb-4">Weekly Revenue</h2>
          {weekData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No revenue data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v) => [`₹${v}`, "Revenue"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                />
                <Bar dataKey="revenue" fill="#e65c00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top selling items */}
        <div className="card">
          <h2 className="font-semibold text-lg mb-4">Top Items</h2>
          {stats.topItems.length === 0 ? (
            <p className="text-gray-400 text-sm">No order data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.topItems.map((item, i) => (
                <div key={item._id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${i === 0 ? "bg-yellow-100 text-yellow-700"
                    : i === 1 ? "bg-gray-100 text-gray-600"
                    : "bg-orange-50 text-orange-500"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item._id}</p>
                    <p className="text-xs text-gray-400">{item.totalQty} sold</p>
                  </div>
                  <span className="text-xs font-medium text-green-600">₹{Math.round(item.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick nav */}
      <h2 className="font-semibold text-lg mb-4">Quick Navigation</h2>
      <div className="flex flex-wrap gap-3">
        {quickLinks.map((l) => (
          <Link key={l.href} to={l.href}
                className="card flex items-center gap-2 hover:shadow-md transition-shadow
                           px-4 py-3 text-sm font-medium text-gray-700 hover:text-primary">
            <span>{l.icon}</span> {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
