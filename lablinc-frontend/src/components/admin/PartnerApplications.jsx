import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin.api';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Pagination from '../ui/Pagination';
import '../../styles/admin.css';

const PartnerApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPartnerApplications({
        page: pagination.page,
        limit: pagination.limit,
      });
      
      // Handle different response formats
      let applicationsData = [];
      if (Array.isArray(response)) {
        applicationsData = response;
      } else if (Array.isArray(response.data)) {
        applicationsData = response.data;
      } else if (Array.isArray(response.applications)) {
        applicationsData = response.applications;
      } else if (response.data?.applications && Array.isArray(response.data.applications)) {
        applicationsData = response.data.applications;
      }
      
      setApplications(applicationsData);
      setPagination(prev => ({
        ...prev,
        total: response.total || response.pagination?.total || response.data?.total || applicationsData.length,
      }));
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);



  const getStatusBadgeVariant = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return variants[status] || 'default';
  };

  const columns = [
    {
      header: 'Applicant',
      key: 'name',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Organization',
      key: 'organization',
    },
    {
      header: 'Phone',
      key: 'phone',
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
      header: 'Applied',
      key: 'createdAt',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/partners/${row._id}`);
          }}
          className="btn btn-sm btn-secondary"
        >
          Review
        </button>
      ),
    },
  ];

  return (
    <div className="partner-applications">
      <div className="management-header">
        <h2><span className="icon-emoji">🤝</span> Partner Applications</h2>
        <div className="management-stats">
          <span>Total Applications: {pagination.total}</span>
        </div>
      </div>

      <Table
        columns={columns}
        data={applications}
        loading={loading}
        emptyMessage="No applications found"
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={Math.ceil(pagination.total / pagination.limit)}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
      />
    </div>
  );
};

export default PartnerApplications;
