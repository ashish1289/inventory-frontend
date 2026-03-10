import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Loader from './components/Loader';

// Layouts and Routes
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth
import Login from './pages/auth/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminProducts from './pages/admin/Products';
import TransferInventory from './pages/admin/TransferInventory';
import AdminTransactions from './pages/admin/Transactions';

// Department Pages
import DeptDashboard from './pages/department/Dashboard';
import ReceivedItems from './pages/department/ReceivedItems';
import MyInventory from './pages/department/MyInventory';

// Common Pages
import Profile from './pages/common/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<Loader fullScreen />}>
          <Routes>
            {/* Public Redirect */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            
            {/* Auth */}
            <Route path="/auth/login" element={<Login />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/transfer" element={<TransferInventory />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
              </Route>
            </Route>

            {/* Department Routes */}
            <Route element={<ProtectedRoute allowedRoles={['department']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/department/dashboard" element={<DeptDashboard />} />
                <Route path="/department/received" element={<ReceivedItems />} />
                <Route path="/department/inventory" element={<MyInventory />} />
              </Route>
            </Route>

            {/* Shared routes - accessible by any authenticated user */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'department']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
