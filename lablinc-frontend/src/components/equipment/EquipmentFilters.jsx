import './EquipmentFilters.css';

const EquipmentFilters = ({ filters, onFilterChange, onSearch }) => {
  const handleChange = (e) => {
    onFilterChange({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const handleClear = () => {
    onFilterChange({
      search: '',
      category: '',
      availability: '',
    });
    onSearch();
  };

  return (
    <div className="equipment-filters">
      <form onSubmit={handleSearchSubmit} className="filters-form">
        <div className="filter-group">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search instruments..."
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="Microscopy">Microscopy</option>
            <option value="Spectroscopy">Spectroscopy</option>
            <option value="Chromatography">Chromatography</option>
            <option value="Analytical">Analytical</option>
            <option value="Separation">Separation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            name="availability"
            value={filters.availability}
            onChange={handleChange}
            className="filter-select"
          >
            <option value="">All Availability</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Search
        </button>

        <button type="button" onClick={handleClear} className="btn btn-secondary">
          Clear
        </button>
      </form>
    </div>
  );
};

export default EquipmentFilters;
