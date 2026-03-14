const colors = {
  // Order statuses
  pending:    "bg-yellow-100 text-yellow-800",
  confirmed:  "bg-blue-100 text-blue-800",
  preparing:  "bg-orange-100 text-orange-800",
  ready:      "bg-green-100 text-green-800",
  delivered:  "bg-gray-100 text-gray-700",
  cancelled:  "bg-red-100 text-red-700",
  // Payment
  paid:       "bg-green-100 text-green-800",
  failed:     "bg-red-100 text-red-700",
  refunded:   "bg-purple-100 text-purple-700",
  // Reservation
  seated:     "bg-teal-100 text-teal-800",
  completed:  "bg-gray-100 text-gray-700",
  "no-show":  "bg-red-100 text-red-700",
  // Surplus
  active:     "bg-green-100 text-green-800",
  "sold-out": "bg-gray-100 text-gray-700",
  expired:    "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
