import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin.api';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Pagination from '../ui/Pagination';
import SearchBar from '../ui/SearchBar';
import CreateInstrumentForm from './CreateInstrumentForm';
import '../../styles/admin.css';

const InstrumentManagement = () => {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [filters, setFilters] = useState({ search: '', category: '', status: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchInstruments();
  }, [pagination.page, filters.search, filters.category, filters.status]);

  const fetchInstruments = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getInstruments({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        category: filters.category,
        status: filters.status,
      });
      
      console.log('Instruments API Response:', response); // Debug log
      
      // Handle different response formats
      let instrumentsData = [];
      let totalCount = 0;
      
      if (Array.isArray(response)) {
        instrumentsData = response;
        totalCount = response.length;
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          instrumentsData = response.data;
          totalCount = response.total || response.pagination?.total || response.data.length;
        } else if (Array.isArray(response.data.instruments)) {
          instrumentsData = response.data.instruments;
          totalCount = response.data.total || response.data.pagination?.total || response.data.instruments.length;
        }
      } else if (Array.isArray(response.instruments)) {
        instrumentsData = response.instruments;
        totalCount = response.total || response.pagination?.total || response.instruments.length;
      }
      
      setInstruments(instrumentsData);
      setPagination(prev => ({
        ...prev,
        total: totalCount,
      }));
    } catch (error) {
      console.error('Failed to fetch instruments:', error);
      setInstruments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async (instrumentId) => {
    try {
      await adminAPI.toggleInstrumentFeature(instrumentId);
      fetchInstruments();
    } catch (error) {
      console.error('Failed to toggle feature:', error);
      alert('Failed to update instrument');
    }
  };

  const handleDelete = async (instrumentId) => {
    if (!confirm('Are you sure you want to delete this instrument?')) return;
    
    try {
      await adminAPI.deleteInstrument(instrumentId);
      fetchInstruments();
    } catch (error) {
      console.error('Failed to delete instrument:', error);
      alert('Failed to delete instrument');
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
      available: 'success',
      booked: 'warning',
      maintenance: 'danger',
      unavailable: 'default',
    };
    return variants[status] || 'default';
  };

  const columns = [
    {
      header: 'Instrument',
      key: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.photos && row.photos[0] && (
            <img 
              src={row.photos[0]} 
              alt={value}
              className="instrument-thumb"
              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
            />
          )}
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">{row.category?.name || row.category}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Owner',
      key: 'owner',
      render: (value) => value?.name || value?.email || '-',
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
      header: 'Featured',
      key: 'featured',
      render: (value, row) => {
        const isFeatured = value || row.isFeatured;
        return (
          <Badge variant={isFeatured ? 'primary' : 'default'}>
            {isFeatured ? 'YES' : 'NO'}
          </Badge>
        );
      },
    },
    {
      header: 'Price',
      key: 'pricing',
      render: (value) => (
        <div>
          <div>₹{value?.hourly || value?.hourlyRate || 0}/hr</div>
          <div className="text-sm text-gray-500">₹{value?.daily || value?.dailyRate || 0}/day</div>
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
              navigate(`/admin/instruments/${row._id}`);
            }}
            className="btn btn-sm btn-secondary"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFeature(row._id);
            }}
            className={`btn btn-sm ${(row.featured || row.isFeatured) ? 'btn-warning' : 'btn-primary'}`}
          >
            {(row.featured || row.isFeatured) ? 'Unfeature' : 'Feature'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id);
            }}
            className="btn btn-sm btn-danger"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="instrument-management">
      <div className="management-header">
        <h2><span className="icon-emoji">🔬</span> Instrument Management</h2>
        <div className="management-actions">
          <div className="management-stats">
            <span>Total Instruments: {pagination.total}</span>
            <span>Showing: {instruments.length}</span>
          </div>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`btn ${showCreateForm ? 'btn-secondary' : 'btn-primary'}`}
          >
            {showCreateForm ? '❌ Cancel' : '➕ Add New Instrument'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <CreateInstrumentForm
          onInstrumentCreated={() => {
            fetchInstruments();
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="management-filters">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search instruments..."
        />
        
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="maintenance">Maintenance</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={instruments}
        loading={loading}
        emptyMessage="No instruments found"
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

export default InstrumentManagement;
