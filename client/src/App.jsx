import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { GuestRoute, ProtectedRoute } from "./components/auth/RouteGuards";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Customers from "./pages/customers/Customers";
import Dashboard from "./pages/dashboard/Dashboard";
import Invoices from "./pages/invoices/Invoices";
import InvoiceEditor from "./pages/invoices/InvoiceEditor";
import InvoiceView from "./pages/invoices/InvoiceView";
import Products from "./pages/products/Products";
import Settings from "./pages/settings/Settings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/new" element={<InvoiceEditor key="new" />} />
              <Route path="/invoices/:id/edit" element={<InvoiceEditor key="edit" />} />
              <Route path="/invoices/:id" element={<InvoiceView />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;