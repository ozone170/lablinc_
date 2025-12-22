const Table = ({ 
  columns, 
  data, 
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  className = '' 
}) => {
  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner">⏳</div>
        <div>Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <div className="table-empty-icon">📭</div>
        <div className="table-empty-text">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      <div className="table-wrapper">
        <table className="modern-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index}
                style={{ width: column.width }}
                className={column.className}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'table-row-clickable' : ''}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={column.className}>
                  {column.render 
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default Table;
