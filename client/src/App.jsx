import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Layouts
import Navbar       from "./components/shared/Navbar";
import Spinner      from "./components/shared/Spinner";

// Public pages
import Home         from "./pages/Home";
import MenuPage     from "./pages/MenuPage";
import SurplusPage  from "./pages/SurplusPage";
import LoginPage    from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Customer pages
import CartPage        from "./pages/customer/CartPage";
import OrdersPage      from "./pages/customer/OrdersPage";
import ReservationPage from "./pages/customer/ReservationPage";
import ProfilePage     from "./pages/customer/ProfilePage";

// Staff pages
import StaffDashboard    from "./pages/staff/StaffDashboard";
import StaffOrders       from "./pages/staff/StaffOrders";
import StaffReservations from "./pages/staff/StaffReservations";
import StaffSurplus      from "./pages/staff/StaffSurplus";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMenu      from "./pages/admin/AdminMenu";
import AdminUsers     from "./pages/admin/AdminUsers";

// Route guards
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user)    return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Home />} />
          <Route path="/menu"     element={<MenuPage />} />
          <Route path="/surplus"  element={<SurplusPage />} />
          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* Customer */}
          <Route path="/cart"        element={<PrivateRoute roles={["customer","staff","admin"]}><CartPage /></PrivateRoute>} />
          <Route path="/my-orders"   element={<PrivateRoute roles={["customer"]}><OrdersPage /></PrivateRoute>} />
          <Route path="/reservations"element={<PrivateRoute roles={["customer"]}><ReservationPage /></PrivateRoute>} />
          <Route path="/profile"     element={<PrivateRoute roles={["customer","staff","admin"]}><ProfilePage /></PrivateRoute>} />

          {/* Staff */}
          <Route path="/staff"              element={<PrivateRoute roles={["staff","admin"]}><StaffDashboard /></PrivateRoute>} />
          <Route path="/staff/orders"       element={<PrivateRoute roles={["staff","admin"]}><StaffOrders /></PrivateRoute>} />
          <Route path="/staff/reservations" element={<PrivateRoute roles={["staff","admin"]}><StaffReservations /></PrivateRoute>} />
          <Route path="/staff/surplus"      element={<PrivateRoute roles={["staff","admin"]}><StaffSurplus /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin"       element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/menu"  element={<PrivateRoute roles={["admin"]}><AdminMenu /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={["admin"]}><AdminUsers /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}
