
import Members from "./Members";

const COLUMNS = [
  { label: 'Full Name', key: 'first_name' },
  { label: 'Email', key: 'email' },
  { label: 'Office', key: 'department' },
  { label: 'Position', key: 'position' },
  { label: 'Role', key: 'role' },
  { label: 'Status', key: 'status', center: true },
  { label: 'Created', key: 'created_at' },
];

export default function MemberListTable({ members, sortConfig, setSortConfig, onViewProfile }) {
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="table-responsive shadow-sm rounded border bg-white">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-primary">
          <tr>
            {COLUMNS.map(col => (
              <th 
                key={col.key} 
                className={`cursor-pointer ${col.center ? 'text-center' : ''}`}
                onClick={() => handleSort(col.key)}
              >
                <div className="d-flex align-items-center gap-1">
                  {col.label}
                  <span className="material-symbols-outlined fs-6">
                    {sortConfig.key === col.key 
                      ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') 
                      : 'unfold_more'}
                  </span>
                </div>
              </th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {members.length > 0 ? (
            members.map(m => (
              <Members key={m.id} mems={m} switchMember={onViewProfile} />
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-5 text-muted">
                <span className="material-symbols-outlined fs-1 d-block mb-2">search_off</span>
                No matching accounts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}