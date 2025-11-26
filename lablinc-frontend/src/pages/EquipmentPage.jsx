import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import EquipmentCard from '../components/equipment/EquipmentCard';
import EquipmentFilters from '../components/equipment/EquipmentFilters';
import { instrumentsAPI } from '../api/instruments.api';
import './EquipmentPage.css';

const EquipmentPage = () => {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    availability: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const fetchInstruments = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.availability) params.availability = filters.availability;

      const response = await instrumentsAPI.getInstruments(params);

      if (response.success) {
        setInstruments(response.data.instruments);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError('Failed to load instruments. Please try again.');
      console.error('Error fetching instruments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, [pagination.page]);

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchInstruments();
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="equipment-page">
        <div className="page-header">
          <h1>Equipment Catalogue</h1>
          <p>Browse and book research instruments from leading institutes</p>
        </div>

        <div className="equipment-container">
          <aside className="equipment-sidebar">
            <EquipmentFilters
              filters={filters}
              onFilterChange={setFilters}
              onSearch={handleSearch}
            />
          </aside>

          <main className="equipment-main">
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading instruments...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchInstruments} className="btn btn-primary">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && instruments.length === 0 && (
          <div className="empty-state">
            <p>No instruments found matching your criteria.</p>
            <button
              onClick={() => {
                setFilters({ search: '', category: '', availability: '' });
                handleSearch();
              }}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && !error && instruments.length > 0 && (
          <>
            <div className="results-info">
              Showing {instruments.length} of {pagination.total} instruments
            </div>

            <div className="equipment-grid">
              {instruments.map((instrument) => (
                <EquipmentCard key={instrument._id} instrument={instrument} />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>

                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default EquipmentPage;
