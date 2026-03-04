import React, { useState, useMemo } from 'react';

/**
 * SortableTable — click-to-sort analytics table.
 *
 * @param {Array<{key: string, label: string, align?: string}>} columns
 * @param {Array<object>}  rows
 * @param {function}       [renderCell] - (row, colKey) => ReactNode
 */
export default function SortableTable({ columns, rows, renderCell }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (colKey) => {
    if (sortCol === colKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortCol || !rows) return rows || [];
    const sorted = [...rows].sort((a, b) => {
      const aRaw = a[sortCol];
      const bRaw = b[sortCol];

      // Extract text value — strip % for numeric comparison
      const aText = String(aRaw ?? '').replace('%', '').trim();
      const bText = String(bRaw ?? '').replace('%', '').trim();

      const aNum = parseFloat(aText);
      const bNum = parseFloat(bText);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDir === 'asc' ? aNum - bNum : bNum - aNum;
      }
      return sortDir === 'asc'
        ? aText.localeCompare(bText)
        : bText.localeCompare(aText);
    });
    return sorted;
  }, [rows, sortCol, sortDir]);

  return (
    <div className="ro-table-wrap">
      <table className="ro-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="sortable-header"
                data-sort-dir={sortCol === col.key ? sortDir : undefined}
                style={col.align ? { textAlign: col.align } : undefined}
                onClick={() => handleSort(col.key)}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={col.align ? { textAlign: col.align } : undefined}
                >
                  {renderCell ? renderCell(row, col.key) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
