import { useState, useEffect } from "react";
import api from "../../api/axios";
import Spinner     from "../../components/shared/Spinner";
import StatusBadge from "../../components/shared/StatusBadge";
import toast       from "react-hot-toast";

const STATUSES = ["pending","confirmed","seated","completed","cancelled","no-show"];

export default function StaffReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [dateFilter,   setDateFilter]   = useState(new Date().toISOString().split("T")[0]);

  const fetch = () => {
    setLoading(true);
    const params = dateFilter ? { date: dateFilter } : {};
    api.get("/reservations", { params })
      .then((r) => setReservations(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(fetch, [dateFilter]);

  const updateStatus = async (id, status, tableNumber) => {
    try {
      await api.patch(`/reservations/${id}/status`, { status, tableNumber });
      toast.success(`Reservation ${status}`);
      fetch();
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-display font-bold">Reservations</h1>
        <div className="flex items-center gap-3">
          <input type="date" className="input w-auto text-sm" value={dateFilter}
                 onChange={(e) => setDateFilter(e.target.value)} />
          <button onClick={fetch} className="btn-secondary text-sm py-1.5 px-3">↺</button>
        </div>
      </div>

      {loading ? <Spinner /> : reservations.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📅</div>
          <p>No reservations for this date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map((r) => (
            <div key={r._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{r.customerName}</p>
                  <p className="text-sm text-gray-500">{r.customerPhone}</p>
                  <p className="text-sm text-gray-500">{r.customerEmail}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-sm mb-3 grid grid-cols-2 gap-2">
                <div><span className="text-gray-500">Date:</span> {new Date(r.date).toLocaleDateString("en-IN")}</div>
                <div><span className="text-gray-500">Time:</span> {r.timeSlot}</div>
                <div><span className="text-gray-500">Guests:</span> {r.partySize}</div>
                <div><span className="text-gray-500">Table:</span> {r.tableNumber || "Not assigned"}</div>
                {r.occasion && <div className="col-span-2"><span className="text-gray-500">Occasion:</span> 🎉 {r.occasion}</div>}
                {r.specialRequests && (
                  <div className="col-span-2 text-orange-600">📝 {r.specialRequests}</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {r.status === "pending" && (
                  <>
                    <button onClick={() => updateStatus(r._id, "confirmed")}
                            className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200">
                      ✓ Confirm
                    </button>
                    <button onClick={() => updateStatus(r._id, "cancelled")}
                            className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200">
                      ✗ Cancel
                    </button>
                  </>
                )}
                {r.status === "confirmed" && (
                  <>
                    <button onClick={() => {
                      const tbl = window.prompt("Assign table number:");
                      if (tbl) updateStatus(r._id, "seated", Number(tbl));
                    }}
                            className="text-xs px-3 py-1 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200">
                      Seat Guest
                    </button>
                    <button onClick={() => updateStatus(r._id, "no-show")}
                            className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                      No Show
                    </button>
                  </>
                )}
                {r.status === "seated" && (
                  <button onClick={() => updateStatus(r._id, "completed")}
                          className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200">
                    ✓ Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
