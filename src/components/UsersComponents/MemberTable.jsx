import { useEffect, useState } from "react"
import { getAccounts } from "../../services/userService";
import Members from "./Members";
import { socket } from "../api";
import MemberProfile from "./MemberProfile";
import { getDepartments } from "../../services/departmentService";
import Swal from "sweetalert2";

function MemberTable(props) {

    const [allMembers, setAllMembers] = useState(null)
    const [filteredMembers, setFilteredMembers] = useState(null)
    const [tenMembers, setTenMembers] = useState(null)
    const [pages, setPages] = useState(null) 
    const [memberLimit, setMemberLimit] = useState({"offset": 0, "limit": 10})
    const [searchQuery, setQuery] = useState("")

    const [selectedDepartment, setSelectedDepartment] = useState("All")
    const [selectedRole, setSelectedRole] = useState("All")

    const [currentUserID, setCurrentUserID] = useState(0)
    const [allDepartments, setAllDepartments] = useState(null)

    // Load departments
    async function loadDepartments() {
        try {
            const res = await getDepartments()
            setAllDepartments(res.data)
        } catch (error) {
            console.log(error)
            Swal.fire({
                title: "Error",
                text: "Fetching Departments failed.",
                icon: "error"
            })
        }
    }

    // Load all members
    async function loadAllMembers() {      
        try {
            const res = await getAccounts()
            setAllMembers(res.data)
            setFilteredMembers(res.data)
            generatePagination(res.data)
        } catch (error) {
            console.log(error)
            Swal.fire({
                title: "Error",
                text: error.response?.data?.error || "Fetching accounts failed.",
                icon: "error"
            })
        }
    }

    // Pagination
    function loadLimited() {
        if(!filteredMembers) return;
        const slicedMembers = filteredMembers.slice(memberLimit.offset, memberLimit.limit)
        setTenMembers(slicedMembers)
    }

    function generatePagination(array) {
        const totalPages = Math.ceil(array.length / 10)
        const newPages = Array.from({ length: totalPages }, (_, i) => ({ id: i + 1, page: i + 1 }))
        setPages(newPages)
    }

    // 🔍 Main Filter Function (Department + Role + Search)
    function applyFilters() {
        if(!allMembers) return;
        let filtered = [...allMembers]

        // Filter by department
        if (selectedDepartment !== "All") {
            filtered = filtered.filter(m => 
                m.department && m.department.id === parseInt(selectedDepartment)
            )
        }

        // Filter by role
        if (selectedRole !== "All") {
            filtered = filtered.filter(m => 
                m.role.toLowerCase() === selectedRole.toLowerCase()
            )
        }

        // Search filter
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(m =>
                m.email.toLowerCase().includes(query) ||
                m.first_name.toLowerCase().includes(query) ||
                m.last_name.toLowerCase().includes(query) ||
                m.position.name.toLowerCase().includes(query) ||
                String(m.id).includes(query) ||
                m.created_at.toLowerCase().includes(query) ||
                m.role.toLowerCase().includes(query)
            )
        }

        setFilteredMembers(filtered)
        generatePagination(filtered)
        setMemberLimit({ offset: 0, limit: 10 })
    }

    // Reactivity
    useEffect(() => {
        loadLimited()
    }, [filteredMembers, memberLimit])

    useEffect(() => {
        applyFilters()
    }, [selectedDepartment, selectedRole])

    useEffect(()=> {
        const debounce = setTimeout(() => {
            applyFilters()
        }, 500)

    return () => clearTimeout(debounce)
    }, [searchQuery])

    useEffect(() => {
        loadAllMembers()
        loadDepartments()

        socket.on("user_created", loadAllMembers)
        socket.on("user_modified", loadAllMembers)

        return () => {
            socket.off("user_created")
            socket.off("user_modified")
        }
    }, [])

    return (
        <div className="member-container">
            {/* --- MODALS OMITTED FOR BREVITY --- */}

            <div className="table-header-container" id="user-table">
                <div className="table-title">Accounts</div>
                <div className="create-user-container">
                    <button data-bs-toggle="modal" data-bs-target="#add-user" className="btn btn-primary">
                        <span className="material-symbols-outlined">add</span>
                        <span>Create Account</span>
                    </button>
                </div>

                {/* 🔽 Filters Section */}
                <div className="search-members">
                    <select onChange={(e) => setSelectedDepartment(e.target.value)}>
                        <option value="All">All Departments</option>
                        {allDepartments && allDepartments.map(dept => (
                            <option value={dept.id} key={dept.id}>{dept.name}</option>
                        ))}
                    </select>

                    <select onChange={(e) => setSelectedRole(e.target.value)}>
                        <option value="All">All Roles</option>
                        <option value="Administrator">Administrator</option>
                        <option value="College President">College President</option>
                        <option value="Head">Head</option>
                        <option value="Faculty">Faculty</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Search user..."
                        value={searchQuery}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table>
                    <tbody>
                        <tr>
                            <th>FULL NAME</th>
                            <th>EMAIL ADDRESS</th>
                            <th>DEPARTMENT</th>
                            <th>POSITION</th>
                            <th>ROLE</th>
                            <th style={{textAlign: "center"}}>STATUS</th>
                            <th>DATE CREATED</th>
                            <th></th>
                        </tr>

                        {tenMembers && tenMembers.length > 0 ? (
                            tenMembers.map(mems => (
                                <Members
                                    key={mems.id}
                                    mems={mems}
                                    switchMember={(id) => setCurrentUserID(id)}
                                />
                            ))
                        ) : ""}
                    </tbody>
                </table>
            </div>
            {tenMembers != 0?"":
                    <div className="empty-symbols">
                        <span className="material-symbols-outlined">no_accounts</span>    
                        <span className="desc">No Users Found</span>
                    </div>}  

            {/* Pagination */}
            <div className="pagination">
                {pages && pages.map(data => (
                    <span
                        className="pages"
                        key={data.id}
                        onClick={() =>
                            setMemberLimit({
                                offset: (data.page - 1) * 10,
                                limit: data.page * 10
                            })
                        }
                    >
                        {data.page}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default MemberTable
