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
      <h2 className="filters-title">Filters</h2>
      <form onSubmit={handleSearchSubmit} className="filters-form">
        <div className="filter-group">
          <label htmlFor="search">Search</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search instruments..."
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="CNC Machines">CNC Machines</option>
            <option value="3D Printers">3D Printers</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Material Testing">Material Testing</option>
            <option value="GPU Workstations">GPU Workstations</option>
            <option value="AI Servers">AI Servers</option>
            <option value="Civil">Civil</option>
            <option value="Environmental">Environmental</option>
            <option value="Prototyping">Prototyping</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="availability">Availability</label>
          <select
            id="availability"
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

        <div className="filter-actions">
          <button type="submit" className="btn btn-primary btn-block">
            Apply Filters
          </button>

          <button type="button" onClick={handleClear} className="btn btn-secondary btn-block">
            Clear All
          </button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentFilters;
