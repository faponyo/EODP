import React, { FC } from "react";

interface PaginationProps {
    handlePageChange: (page: number) => void;
    currentPage: number;
    pageCount: number;
    pagesize: number;
    setPageSize: (size: number) => void;
}

const EPagination: FC<PaginationProps> = ({
                                              handlePageChange,
                                              currentPage,
                                              pageCount,
                                              pagesize,
                                              setPageSize,
                                          }) => {
    // Calculate the start page dynamically (same logic)
    const startPage =
        currentPage <= 5 ? 1 : Math.min(currentPage - 4, pageCount - 9);

    return (
        <div className="flex items-center justify-end space-x-2 p-2">
            {/* Previous Button */}
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md border ${
                    currentPage === 1
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-white hover:bg-gray-100"
                }`}
            >
                Prev
            </button>

            {/* First Page and Ellipsis */}
            {currentPage > 5 && (
                <>
                    <button
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1 rounded-md border hover:bg-gray-100"
                    >
                        1
                    </button>
                    <span className="px-2">...</span>
                </>
            )}

            {/* Dynamic Page Numbers */}
            {Array.from({ length: 10 }, (_, index) => {
                const page = startPage + index;
                if (page > pageCount) return null;



                return (
                    <button
                        onClick={() => handlePageChange(page)}
                        key={page}
                        className={`px-3 py-1 rounded-md border ${
                            page === currentPage
                                ? "bg-blue-600 text-white font-semibold"
                                : "bg-white hover:bg-gray-100"
                        }`}
                    >
                        {page}
                    </button>
                );
            })}

            {/* Last Page and Ellipsis */}
            {currentPage < pageCount - 5 && (
                <>
                    <span className="px-2">...</span>
                    <button
                        onClick={() => handlePageChange(pageCount)}
                        className="px-3 py-1 rounded-md border hover:bg-gray-100"
                    >
                        {pageCount}
                    </button>
                </>
            )}

            {/* Next Button */}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pageCount}
                className={`px-3 py-1 rounded-md border ${
                    currentPage === pageCount
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-white hover:bg-gray-100"
                }`}
            >
                Next
            </button>

            {/* Page Size Selector */}
            <select
                value={pagesize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="ml-4 rounded-md border px-2 py-1 text-sm"
            >
                {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                        {size} per page
                    </option>
                ))}
            </select>
        </div>
    );
};

export default EPagination;
