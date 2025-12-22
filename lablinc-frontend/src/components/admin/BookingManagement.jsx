import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin.api';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Pagination from '../ui/Pagination';
import SearchBar from '../ui/SearchBar';
import { useAuth } from '../../hooks/useAuth';
import { getDisplayAmount, getPricingBreakdown, formatAmount, getAmountLabel } from '../../utils/pricing';
import CreateBookingForm from './CreateBookingForm';
import '../../styles/admin.css';

const BookingManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getBookings({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status,
      });
      
      // Handle different response formats
      let bookingsData = [];
      if (Array.isArray(response)) {
        bookingsData = response;
      } else if (Array.isArray(response.data)) {
        bookingsData = response.data;
      } else if (Array.isArray(response.bookings)) {
        bookingsData = response.bookings;
      } else if (response.data?.bookings && Array.isArray(response.data.bookings)) {
        bookingsData = response.data.bookings;
      }
      
      setBookings(bookingsData);
      setPagination(prev => ({
        ...prev,
        total: response.total || response.pagination?.total || response.data?.total || bookingsData.length,
      }));
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.search, filters.status]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const blob = await adminAPI.downloadInvoice(bookingId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice');
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

  const getStatusBadgeVariant = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'info',
      active: 'primary',
      completed: 'success',
      cancelled: 'danger',
    };
    return variants[status] || 'default';
  };

  const columns = [
    {
      header: 'Booking ID',
      key: '_id',
      render: (value) => (
        <span className="font-mono text-sm">{value?.slice(-8)}</span>
      ),
    },
    {
      header: 'Instrument',
      key: 'instrument',
      render: (value) => (
        <div>
          <div className="font-medium">{value?.name || '-'}</div>
          <div className="text-sm text-gray-500">{value?.category?.name || value?.category}</div>
        </div>
      ),
    },
    {
      header: 'User',
      key: 'user',
      render: (value) => (
        <div>
          <div>{value?.name || '-'}</div>
          <div className="text-sm text-gray-500">{value?.email}</div>
        </div>
      ),
    },
    {
      header: 'Dates',
      key: 'startDate',
      render: (value, row) => (
        <div className="text-sm">
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-gray-500">to {new Date(row.endDate).toLocaleDateString()}</div>
        </div>
      ),
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
      header: getAmountLabel(user),
      key: 'totalAmount',
      render: (value, row) => {
        const breakdown = getPricingBreakdown(row, user);
        return formatAmount(breakdown?.totalAmount || getDisplayAmount(row, user));
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/bookings/${row._id}`);
            }}
            className="btn btn-sm btn-secondary"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadInvoice(row._id);
            }}
            className="btn btn-sm btn-primary"
          >
            Invoice
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="booking-management">
      <div className="management-header">
        <h2><span className="icon-emoji">📅</span> Booking Management</h2>
        <div className="management-actions">
          <div className="management-stats">
            <span>Total Bookings: {pagination.total}</span>
          </div>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`btn ${showCreateForm ? 'btn-secondary' : 'btn-primary'}`}
          >
            {showCreateForm ? '❌ Cancel' : '➕ Create New Booking'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <CreateBookingForm
          onBookingCreated={() => {
            fetchBookings();
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="management-filters">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search bookings..."
        />
        
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={bookings}
        loading={loading}
        emptyMessage="No bookings found"
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

export default BookingManagement;
