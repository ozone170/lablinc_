import Header from './Header';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Header />
      <main className="admin-main-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;