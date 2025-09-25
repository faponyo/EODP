import { useState, useMemo } from 'react';

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export const usePagination = (initialPageSize: number = 50) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginateData = <T>(data: T[]): { paginatedData: T[]; pagination: PaginationConfig } => {
    const total = data.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      paginatedData,
      pagination: {
        page,
        pageSize,
        total,
      },
    };
  };

  const totalPages = (total: number) => Math.ceil(total / pageSize);

  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  const goToNextPage = (total: number) => {
    if (page < totalPages(total)) {
      setPage(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const resetPage = () => {
    setPage(1);
  };

  return {
    page,
    pageSize,
    setPageSize,
    paginateData,
    totalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPage,
  };
};