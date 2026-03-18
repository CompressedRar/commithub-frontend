export const LogFilters = ({ filters, setFilters, searchQuery, setSearchQuery, departments }) => (
  <div className="row g-2 mb-3">
    <div className="col-md-3">
      <select className="form-select" value={filters.department} 
        onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
        <option value="All">All Departments</option>
        {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
      </select>
    </div>
    <div className="col-md-3">
      <select className="form-select" value={filters.action} 
        onChange={(e) => setFilters({ ...filters, action: e.target.value })}>
        <option value="All">All Actions</option>
        {["CREATE", "UPDATE", "ARCHIVE", "LOGIN", "SUBMIT", "ASSIGN"].map(a => 
          <option key={a} value={a}>{a}</option>
        )}
      </select>
    </div>
    <div className="col-md-3">
      <input 
        type="text" className="form-control" placeholder="Search logs..." 
        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
      />
    </div>
  </div>
);