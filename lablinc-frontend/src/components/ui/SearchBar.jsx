import { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import './SearchBar.css';

const SearchBar = ({ 
  onSearch, 
  placeholder = 'Search...', 
  delay = 500,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, delay);

  // Call onSearch when debounced value changes
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`search-bar ${className}`}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="search-clear"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
      <span className="search-icon">🔍</span>
    </div>
  );
};

export default SearchBar;
