import { useEffect, useState } from "react";
import { getLogs } from "../../services/logService";
import Logs from "./Logs";
import Swal from "sweetalert2";
import { getDepartments } from "../../services/departmentService";

function LogTable() {
    const [allMembers, setAllMembers] = useState(null);
    const [filteredMembers, setFilteredMembers] = useState(null);
    const [tenMembers, setTenMembers] = useState(null);
    const [pages, setPages] = useState(null);
    const [memberLimit, setMemberLimit] = useState({ offset: 0, limit: 10 });
    const [searchQuery, setQuery] = useState("");

    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedAction, setSelectedAction] = useState("All");
    const [selectedTarget, setSelectedTarget] = useState("All");

    const [allDepartments, setAllDepartments] = useState([]);

    async function loadDepartments() {
        try {
            const res = await getDepartments();
            setAllDepartments(res.data);
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: "Error",
                text: "Fetching Departments failed.",
                icon: "error",
            });
        }
    }

    async function loadAllMembers() {
        try {
            const res = await getLogs();
            const data = res.data;
            setAllMembers(data);
            setFilteredMembers(data);
            generatePagination(data);
            console.log("Loaded all logs");
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: "Error",
                text: "Fetching Logs failed.",
                icon: "error",
            });
        }
    }

    function loadLimited() {
        if (!filteredMembers) return
        const sliced = filteredMembers.slice(memberLimit.offset, memberLimit.limit);
        setTenMembers(sliced);
    }

    function generatePagination(array) {
        const totalPages = Math.ceil(array.length / 10);
        const newPages = Array.from({ length: totalPages }, (_, i) => ({
            id: i + 1,
            page: i + 1,
        }));
        setPages(newPages);
    }

    // ✅ Combined filtering logic for search + selects
    function applyFilters() {
        if (!allMembers) return
        let results = [...allMembers];

        // Department filter
        console.log(selectedDepartment, selectedAction, selectedTarget)
        if (selectedDepartment !== "All") {
            results = results.filter(
                (member) =>
                    member.department === selectedDepartment ||
                    member.department_name === selectedDepartment
            );
        }

        // Action filter
        if (selectedAction !== "All") {
            results = results.filter((member) => member.action === selectedAction);
        }

        // Target filter
        if (selectedTarget !== "All") {
            results = results.filter((member) => member.target_type === selectedTarget);
        }

        // Search filter
        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            results = results.filter(
                (m) =>
                    m.full_name?.toLowerCase().includes(q) ||
                    m.action?.toLowerCase().includes(q) ||
                    String(m.id).includes(q) ||
                    m.timestamp?.toLowerCase().includes(q) ||
                    m.ip_address?.toLowerCase().includes(q) ||
                    m.user_agent?.toLowerCase().includes(q) ||
                    m.department?.toLowerCase().includes(q)
            );
        }

        setFilteredMembers(results);
        generatePagination(results);
        setMemberLimit({ offset: 0, limit: 10 });
    }

    // ✅ Initial load
    useEffect(() => {
        loadDepartments();
        loadAllMembers();
        
    }, []);

    // ✅ Update limited members whenever pagination or data changes
    useEffect(() => {
        loadLimited();
    }, [filteredMembers, memberLimit]);

    // ✅ Search debounce
    useEffect(() => {
        const delay = setTimeout(() => {
            applyFilters();
        }, 400);
        return () => clearTimeout(delay);
    }, [searchQuery]);

    // ✅ Apply filters instantly when select elements change
    useEffect(() => {
        applyFilters();
    }, [selectedDepartment, selectedAction, selectedTarget]);

    return (
        <div className="member-container">
            <div className="table-header-container" id="user-table">
                <div className="table-title">Logs</div>
                <div className="search-members">
                    {/* Department Filter */}
                    <select onChange={(e) => setSelectedDepartment(e.target.value)}>
                        <option value="All">All Departments</option>
                        {allDepartments.map((dept) => (
                            <option value={dept.name} key={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                        <option value="UNKNOWN">UNKNOWN</option>
                    </select>

                    <select onChange={(e) => setSelectedAction(e.target.value)}>
                        <option value="All">All Actions</option>
                        <option value="CREATE">CREATE</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="ARCHIVE">ARCHIVE</option>
                        <option value="LOGIN">LOGIN</option>
                    </select>

                    <select onChange={(e) => setSelectedTarget(e.target.value)}>
                        <option value="All">All Targets</option>
                        <option value="DEPARTMENT">Department</option>
                        <option value="CATEGORY">Category</option>
                        <option value="TASK">Task</option>
                        <option value="USER">User</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Search logs..."
                        onInput={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            
                            <th>USER</th>
                            <th>DEPARTMENT</th>
                            <th>ACTION</th>
                            <th>TARGET</th>
                            <th>IP ADDRESS</th>
                            <th>TIMESTAMP</th>
                            <th>USER AGENT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenMembers && tenMembers.length > 0 ? (
                            tenMembers.map((log) => (
                                <Logs log={log} key={log.id} />
                            ))
                        ) : (
                            <tr className="empty-table">
                                <td colSpan="7">No logs found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                {pages && pages.map((data) => (
                    <span
                        className="pages"
                        key={data.id}
                        onClick={() =>
                            setMemberLimit({
                                offset: (data.page - 1) * 10,
                                limit: data.page * 10,
                            })
                        }
                    >
                        {data.page}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default LogTable;
