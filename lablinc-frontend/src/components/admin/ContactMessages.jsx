import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin.api';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Pagination from '../ui/Pagination';
import '../../styles/admin.css';

const ContactMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getContactMessages({
        page: pagination.page,
        limit: pagination.limit,
      });
      
      // Handle different response formats
      let messagesData = [];
      if (Array.isArray(response)) {
        messagesData = response;
      } else if (Array.isArray(response.data)) {
        messagesData = response.data;
      } else if (Array.isArray(response.messages)) {
        messagesData = response.messages;
      } else if (response.data?.messages && Array.isArray(response.data.messages)) {
        messagesData = response.data.messages;
      }
      
      setMessages(messagesData);
      setPagination(prev => ({
        ...prev,
        total: response.total || response.pagination?.total || response.data?.total || messagesData.length,
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);



  const getStatusBadgeVariant = (status) => {
    const variants = {
      unread: 'warning',
      read: 'info',
      resolved: 'success',
    };
    return variants[status] || 'default';
  };

  const columns = [
    {
      header: 'From',
      key: 'name',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Subject',
      key: 'subject',
      render: (value) => (
        <div className="truncate" style={{ maxWidth: '200px' }}>
          {value || 'No subject'}
        </div>
      ),
    },
    {
      header: 'Message',
      key: 'message',
      render: (value) => (
        <div className="truncate" style={{ maxWidth: '300px' }}>
          {value}
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
      header: 'Received',
      key: 'createdAt',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/messages/${row._id}`);
            }}
            className="btn btn-sm btn-secondary"
          >
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="contact-messages">
      <div className="management-header">
        <h2><span className="icon-emoji">💬</span> Contact Messages</h2>
        <div className="management-stats">
          <span>Total Messages: {pagination.total}</span>
        </div>
      </div>

      <Table
        columns={columns}
        data={messages}
        loading={loading}
        emptyMessage="No messages found"
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={Math.ceil(pagination.total / pagination.limit)}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
      />
    </div>
  );
};

export default ContactMessages;
