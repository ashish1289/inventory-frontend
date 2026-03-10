import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Download } from 'lucide-react';

const Table = ({ columns, data, searchable = true, searchPlaceholder = "Search...", loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search logic
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item => 
      columns.some(col => {
        if (!col.accessor) return false;
        const val = item[col.accessor];
        return val && String(val).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Sort logic
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExportCSV = () => {
    if (!sortedData || sortedData.length === 0) return;

    // 1. Get Headers
    const headers = columns.map(c => c.header).join(',');

    // 2. Get Rows
    const csvRows = sortedData.map(row => {
      return columns.map(col => {
        let cellValue = '';
        if (col.accessor) {
          cellValue = row[col.accessor];
        } else if (col.render) {
          // If it's a render function without accessor, we might not get perfect text representation
          // We'll try to execute it. If it returns React nodes, this might be tricky,
          // so we heavily rely on accessors for cleanly exported data, but we can try extraction:
          try {
            const rendered = col.render(row);
            if (typeof rendered === 'string' || typeof rendered === 'number') {
              cellValue = rendered;
            } else if (rendered?.props?.children) {
              // Extremely basic React node text extraction fallback
              cellValue = Array.isArray(rendered.props.children) 
                ? rendered.props.children.join(' ') 
                : rendered.props.children;
            }
          } catch (e) {
            cellValue = '';
          }
        }
        
        // Sanitize for CSV
        let textVal = String(cellValue || '').replace(/"/g, '""');
        return `"${textVal}"`;
      }).join(',');
    });

    const csvString = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Export_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 bg-surface rounded-lg shadow border border-border overflow-hidden">
      {/* Search Bar & Export */}
      {searchable && (
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // reset to page 1 on search
              }}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={sortedData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover text-text border border-border rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download as Excel/CSV"
          >
            <Download size={16} className="text-green-600 dark:text-green-500" /> 
            Export CSV
          </button>
        </div>
      )}

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-hover/50 text-text border-b border-border">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:bg-surface-hover' : ''}`}
                  onClick={() => col.sortable && handleSort(col.accessor)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && (
                      <ArrowUpDown size={14} className={sortConfig?.key === col.accessor ? "text-primary" : "text-text-muted"} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-text-muted">
                  <div className="flex justify-center items-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
                    Loading data...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-text-muted">
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr 
                  key={row._id || rowIdx} 
                  className="border-b border-border last:border-0 hover:bg-surface-hover/30 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 text-sm text-text">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between bg-surface-hover/20">
          <p className="text-sm text-text-muted">
            Showing <span className="font-medium text-text">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-text">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="font-medium text-text">{sortedData.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md border border-border bg-surface text-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                    currentPage === idx + 1 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-surface text-text border border-border hover:bg-surface-hover'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md border border-border bg-surface text-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
