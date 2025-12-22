import { useState } from 'react';

/**
 * Custom hook for pagination logic
 * @param {number} initialPage - Initial page number (default: 1)
 * @param {number} initialSize - Initial page size (default: 10)
 * @returns {object} - Pagination state and methods
 */
export const usePagination = (initialPage = 1, initialSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / pageSize);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const nextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const goToFirstPage = () => setPage(1);
  const goToLastPage = () => setPage(totalPages);

  const changePageSize = (newSize) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  const reset = () => {
    setPage(initialPage);
    setPageSize(initialSize);
    setTotal(0);
  };

  return {
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    setPageSize: changePageSize,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    reset,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
