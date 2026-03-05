import RideRow from './RideRow';
import Pagination from './Pagination';

const COLUMNS = [
  { key: 'requested', label: 'Requested' },
  { key: 'rider', label: 'Rider' },
  { key: 'route', label: 'Route' },
  { key: 'status', label: 'Status' },
  { key: 'driver', label: 'Driver' },
];

function SortIcon({ col, sortCol, sortDir }) {
  if (col !== sortCol) return <i className="ti ti-arrows-sort" style={{ opacity: 0.3, marginLeft: 4, fontSize: 12 }} />;
  return sortDir === 'asc'
    ? <i className="ti ti-sort-ascending" style={{ marginLeft: 4, fontSize: 12 }} />
    : <i className="ti ti-sort-descending" style={{ marginLeft: 4, fontSize: 12 }} />;
}

export default function RidesTable({
  filteredRides, selectedIds, employees,
  onToggleSelect, onToggleSelectAll, onRowClick, onApprove,
  page, pageSize, totalCount, onPageChange, onPageSizeChange,
  sortCol, sortDir, onSort,
}) {
  const allSelected = filteredRides.length > 0 && filteredRides.every(r => selectedIds.has(r.id));

  return (
    <div id="rides-table-view" className="ro-section">
      <div className="ro-table-wrap">
        <table className="ro-table" id="rides-table">
          <thead>
            <tr>
              <th style={{ width: '32px' }}>
                <input
                  type="checkbox"
                  id="rides-select-all"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                />
              </th>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => onSort(col.key)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {col.label}
                  <SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody id="rides-tbody">
            {filteredRides.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                  No rides match the current filters.
                </td>
              </tr>
            ) : (
              filteredRides.map(ride => (
                <RideRow
                  key={ride.id}
                  ride={ride}
                  selected={selectedIds.has(ride.id)}
                  employees={employees}
                  onToggleSelect={onToggleSelect}
                  onRowClick={onRowClick}
                  onApprove={onApprove}
                />
              ))
            )}
          </tbody>
        </table>
        {totalCount > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
