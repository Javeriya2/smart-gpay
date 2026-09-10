import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], itemsPerPage = 5) {
  const [currentPage, setCurrentPage] = useState(1);

  const maxPage = Math.ceil(items.length / itemsPerPage) || 1;

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, maxPage));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page: number) => setCurrentPage(Math.min(Math.max(1, page), maxPage));

  return {
    currentData,
    currentPage,
    maxPage,
    nextPage,
    prevPage,
    goToPage,
  };
}
