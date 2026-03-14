import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({
    name:    user?.name    || "",
    phone:   user?.phone   || "",
    address: user?.address || "",
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-6">My Profile</h1>

      <div className="card">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`badge mt-1 ${
              user?.role === "admin" ? "bg-purple-100 text-purple-700"
              : user?.role === "staff" ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input className="input" value={form.name}
                     onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input className="input" value={form.phone}
                     onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea className="input resize-none" rows={2} value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary px-6">
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary px-6">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {[
              { label: "Name",    value: user?.name },
              { label: "Email",   value: user?.email },
              { label: "Phone",   value: user?.phone   || "Not set" },
              { label: "Address", value: user?.address || "Not set" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="w-20 text-sm text-gray-500 font-medium">{label}</span>
                <span className="text-gray-900 text-sm">{value}</span>
              </div>
            ))}
            <button onClick={() => setEditing(true)} className="btn-primary mt-4 px-6">
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
