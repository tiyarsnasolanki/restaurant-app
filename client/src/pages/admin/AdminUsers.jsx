import { useState, useEffect } from "react";
import api from "../../api/axios";
import Spinner from "../../components/shared/Spinner";
import toast   from "react-hot-toast";

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    // Re-use the auth/me pattern — fetch all users via a simple query
    // NOTE: You need to add GET /api/admin/users route (see below); 
    // here we demonstrate the UI; the route is wired in the server section.
    api.get("/auth/users")
      .then((r) => setUsers(r.data))
      .catch(() => {
        // Fallback: show placeholder if route not available
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/auth/users/${id}/role`, { role });
      toast.success("Role updated");
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    } catch {
      toast.error("Failed to update role");
    }
  };

  const roleBadge = (role) => {
    const c = role === "admin"
      ? "bg-purple-100 text-purple-700"
      : role === "staff"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";
    return <span className={`badge ${c}`}>{role}</span>;
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold">User Management</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{users.length} total users</span>
        </div>
      </div>

      <input
        className="input max-w-sm mb-6"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">👥</div>
          <p>{search ? "No users match your search." : "No users yet."}</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center
                                      justify-center text-sm font-bold flex-shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.phone || "—"}</td>
                  <td className="px-4 py-3">{roleBadge(u.role)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1
                                 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="customer">customer</option>
                      <option value="staff">staff</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
