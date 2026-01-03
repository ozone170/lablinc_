import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin.api';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Pagination from '../ui/Pagination';
import SearchBar from '../ui/SearchBar';
import CreateUserForm from './CreateUserForm';
import '../../styles/admin.css';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters.search, filters.role, filters.status]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
        status: filters.status,
      });
      
      // Handle different response formats
      let usersData = [];
      if (Array.isArray(response)) {
        usersData = response;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (Array.isArray(response.users)) {
        usersData = response.users;
      } else if (response.data?.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      }
      
      setUsers(usersData);
      setPagination(prev => ({
        ...prev,
        total: response.total || response.pagination?.total || response.data?.total || usersData.length,
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleVerifyEmail = async (userId) => {
    try {
      setVerifyingEmail(userId);
      await adminAPI.verifyUserEmail(userId);
      fetchUsers();
      alert('User email verified successfully');
    } catch (error) {
      console.error('Failed to verify user email:', error);
      alert(error.response?.data?.message || 'Failed to verify user email');
    } finally {
      setVerifyingEmail(null);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getRoleBadgeVariant = (role) => {
    const variants = {
      admin: 'danger',
      msme: 'primary',
      institute: 'info',
      user: 'default',
    };
    return variants[role] || 'default';
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      active: 'success',
      suspended: 'warning',
      inactive: 'default',
    };
    return variants[status] || 'default';
  };

  const columns = [
    {
      header: 'Name',
      key: 'name',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role',
      render: (value) => (
        <Badge variant={getRoleBadgeVariant(value)}>
          {value?.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Organization',
      key: 'organization',
      render: (value) => value || '-',
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => (
        <Badge variant={getStatusBadgeVariant(value)}>
          {value?.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Email Verified',
      key: 'emailVerified',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Badge variant={value ? 'success' : 'warning'}>
            {value ? '✅ Verified' : '❌ Unverified'}
          </Badge>
          {!value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVerifyEmail(row._id);
              }}
              disabled={verifyingEmail === row._id}
              className="btn btn-xs btn-primary"
              title="Verify email manually"
            >
              {verifyingEmail === row._id ? '⏳' : '✅ Verify'}
            </button>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/users/${row._id}`);
            }}
            className="btn btn-sm btn-secondary"
          >
            View
          </button>
          {row.status === 'active' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(row._id, 'suspended');
              }}
              className="btn btn-sm btn-warning"
            >
              Suspend
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(row._id, 'active');
              }}
              className="btn btn-sm btn-success"
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="user-management">
      <div className="management-header">
        <h2><span className="icon-emoji">👥</span> User Management</h2>
        <div className="management-actions">
          <div className="management-stats">
            <span>Total Users: {pagination.total}</span>
          </div>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`btn ${showCreateForm ? 'btn-secondary' : 'btn-primary'}`}
          >
            {showCreateForm ? '❌ Cancel' : '➕ Create New User'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <CreateUserForm
          onUserCreated={() => {
            fetchUsers();
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="management-filters">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by name or email..."
        />
        
        <div className="filter-group">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="msme">MSME</option>
            <option value="institute">Institute</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found"
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={Math.ceil(pagination.total / pagination.limit)}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
      />
    </div>
  );
};

export default UserManagement;
