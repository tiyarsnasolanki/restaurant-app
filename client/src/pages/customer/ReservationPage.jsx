import { useState, useEffect } from "react";
import api from "../../api/axios";
import Spinner     from "../../components/shared/Spinner";
import StatusBadge from "../../components/shared/StatusBadge";
import toast       from "react-hot-toast";

const OCCASIONS = ["", "Birthday", "Anniversary", "Business Dinner", "Date Night", "Other"];

export default function ReservationPage() {
  const [reservations, setReservations] = useState([]);
  const [slots,        setSlots]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [form, setForm] = useState({
    date: "", timeSlot: "", partySize: 2, specialRequests: "", occasion: "", phone: "", email: ""
  });

  const fetchRes = () => {
    api.get("/reservations").then((r) => setReservations(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetchRes, []);

  const fetchSlots = (date) => {
    if (!date) return;
    api.get(`/reservations/slots?date=${date}`)
      .then((r) => setSlots(r.data.available))
      .catch(console.error);
  };

  const handleDate = (e) => {
    setForm({ ...form, date: e.target.value, timeSlot: "" });
    fetchSlots(e.target.value);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.timeSlot) { toast.error("Please select a time slot"); return; }
    setSubmitting(true);
    try {
      await api.post("/reservations", form);
      toast.success("Table reserved! See you soon 🎉");
      setForm({ date: "", timeSlot: "", partySize: 2, specialRequests: "", occasion: "", phone: "", email: "" });
      setSlots([]);
      fetchRes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reserve");
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (id) => {
    try {
      await api.delete(`/reservations/${id}`);
      toast.success("Reservation cancelled");
      fetchRes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel");
    }
  };

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate  = tomorrow.toISOString().split("T")[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-6">Book a Table</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Booking form */}
        <div className="card">
          <h2 className="font-semibold text-lg mb-4">New Reservation</h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" required className="input" min={minDate}
                       value={form.date} onChange={handleDate}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Party Size *</label>
                <input type="number" required min={1} max={20} className="input"
                       value={form.partySize}
                       onChange={(e) => setForm({ ...form, partySize: +e.target.value })}/>
              </div>
            </div>

            {/* Time slots */}
            {form.date && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot *</label>
                {slots.length === 0 ? (
                  <p className="text-sm text-red-500">No slots available for this date</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((s) => (
                      <button key={s} type="button"
                              onClick={() => setForm({ ...form, timeSlot: s })}
                              className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                                form.timeSlot === s
                                  ? "bg-primary text-white border-primary"
                                  : "border-gray-300 hover:border-primary text-gray-700"
                              }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" className="input" placeholder="+91 ..."
                     value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
              <select className="input" value={form.occasion}
                      onChange={(e) => setForm({ ...form, occasion: e.target.value })}>
                {OCCASIONS.map((o) => <option key={o} value={o}>{o || "— None —"}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
              <textarea className="input resize-none" rows={2}
                        placeholder="Dietary requirements, special arrangements..."
                        value={form.specialRequests}
                        onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}/>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
              {submitting ? "Booking..." : "Book Table"}
            </button>
          </form>
        </div>

        {/* My reservations */}
        <div>
          <h2 className="font-semibold text-lg mb-4">My Reservations</h2>
          {loading ? <Spinner /> : reservations.length === 0 ? (
            <p className="text-gray-400 text-sm">No reservations yet.</p>
          ) : (
            <div className="space-y-3">
              {reservations.map((r) => (
                <div key={r._id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{new Date(r.date).toLocaleDateString("en-IN", { weekday:"short", day:"2-digit", month:"short" })} at {r.timeSlot}</p>
                      <p className="text-sm text-gray-500">{r.partySize} guests{r.occasion ? ` · ${r.occasion}` : ""}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.tableNumber && (
                    <p className="text-sm text-gray-500">Table #{r.tableNumber}</p>
                  )}
                  {["pending", "confirmed"].includes(r.status) && (
                    <button onClick={() => cancel(r._id)}
                            className="mt-2 text-xs text-red-500 hover:underline">
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
