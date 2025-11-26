import MainLayout from '../components/layout/MainLayout';
import MsmeDashboard from '../components/dashboard/MsmeDashboard';
import InstituteDashboard from '../components/dashboard/InstituteDashboard';
import AdminDashboardSummary from '../components/dashboard/AdminDashboardSummary';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'msme':
        return <MsmeDashboard />;
      case 'institute':
        return <InstituteDashboard />;
      case 'admin':
        return <AdminDashboardSummary />;
      default:
        return (
          <div className="empty-state">
            <p>Unable to load dashboard</p>
          </div>
        );
    }
  };

  return (
    <MainLayout>
      {renderDashboard()}
    </MainLayout>
  );
};

export default DashboardPage;
