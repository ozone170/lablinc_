import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthErrorHandler from '../components/auth/AuthErrorHandler';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import AboutPage from '../pages/AboutPage';
import EquipmentPage from '../pages/EquipmentPage';
import InstrumentDetailsPage from '../pages/InstrumentDetailsPage';
import BookingPage from '../pages/BookingPage';
import DashboardPage from '../pages/DashboardPage';
import AdminPage from '../pages/AdminPage';
import PartnerPage from '../pages/PartnerPage';
import ContactPage from '../pages/ContactPage';
import NotificationsPage from '../pages/NotificationsPage';
import ProfilePage from '../pages/ProfilePage';
import ProfileEditPage from '../pages/ProfileEditPage';
import SettingsPage from '../pages/SettingsPage';
import HelpPage from '../pages/HelpPage';
import TermsPage from '../pages/TermsPage';
import PrivacyPage from '../pages/PrivacyPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import NotFoundPage from '../pages/NotFoundPage';

// Instrument Pages
import CreateInstrumentPage from '../pages/instruments/CreateInstrumentPage';
import EditInstrumentPage from '../pages/instruments/EditInstrumentPage';

// Booking Pages
import BookingDetailPage from '../pages/bookings/BookingDetailPage';

// Admin Detail Pages
import BookingDetailsPage from '../pages/BookingDetailsPage';
import UserDetailsPage from '../pages/UserDetailsPage';
import InstrumentDetailsAdminPage from '../pages/InstrumentDetailsAdminPage';
import PartnerApplicationDetailsPage from '../pages/PartnerApplicationDetailsPage';
import ContactMessageDetailsPage from '../pages/ContactMessageDetailsPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthErrorHandler>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/instrument/:instrumentId" element={<InstrumentDetailsPage />} />
        <Route path="/partner" element={<PartnerPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Protected Routes */}
        <Route
          path="/booking/:instrumentId"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        {/* Instrument Routes */}
        <Route
          path="/instruments/create"
          element={
            <ProtectedRoute allowedRoles={['msme', 'admin']}>
              <CreateInstrumentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instruments/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['msme', 'admin']}>
              <EditInstrumentPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BookingDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/instruments/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <InstrumentDetailsAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PartnerApplicationDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ContactMessageDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </AuthErrorHandler>
    </BrowserRouter>
  );
};

export default AppRouter;
