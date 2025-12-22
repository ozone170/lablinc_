import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import {
  UserManagement,
  InstrumentManagement,
  BookingManagement,
  AnalyticsDashboard,
  ContactMessages,
  PartnerApplications,
} from '../components/admin';
import './AdminPage.css';

const AdminPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'analytics';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Update active tab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: '📊', component: AnalyticsDashboard },
    { id: 'users', label: 'Users', icon: '👥', component: UserManagement },
    { id: 'instruments', label: 'Instruments', icon: '🔬', component: InstrumentManagement },
    { id: 'bookings', label: 'Bookings', icon: '📅', component: BookingManagement },
    { id: 'partners', label: 'Partners', icon: '🤝', component: PartnerApplications },
    { id: 'messages', label: 'Messages', icon: '💬', component: ContactMessages },
  ];

  const ActiveComponent = menuItems.find(item => item.id === activeTab)?.component || AnalyticsDashboard;

  const handleNavClick = (itemId) => {
    setActiveTab(itemId);
    setSearchParams({ tab: itemId });
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-modern">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <span className="logo-icon">⚡</span>
              {sidebarOpen && <span className="logo-text">Admin Panel</span>}
            </div>
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                data-label={item.label}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
                {activeTab === item.id && <span className="nav-indicator" />}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            {sidebarOpen && (
              <div className="sidebar-info">
                <p className="info-text">LabLinc Admin</p>
                <p className="info-version">v2.0.0</p>
              </div>
            )}
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div 
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="admin-main">
          <div className="admin-header">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <div className="header-content">
              <h1 className="header-title">
                <span className="title-icon">
                  {menuItems.find(item => item.id === activeTab)?.icon}
                </span>
                {menuItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="header-subtitle">
                Manage and monitor your platform
              </p>
            </div>
            <div className="header-actions">
              <button className="btn-icon" title="Refresh" onClick={() => window.location.reload()}>
                🔄
              </button>
              <button className="btn-icon" title="Settings">
                ⚙️
              </button>
            </div>
          </div>

          <div className="admin-content">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </AdminLayout>
  );
};

export default AdminPage;
