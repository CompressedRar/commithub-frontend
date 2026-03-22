import { useState, useEffect, useMemo, useCallback } from "react";
import { getDepartment, removeUserFromDepartment } from "../../../../../../services/departmentService";
import { socket } from "../../../../../api";
import Swal from "sweetalert2";

export function useDepartmentMembers(deptid) {
    const [allMembers, setAllMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const loadData = useCallback(async () => {
        try {
            const res = await getDepartment(deptid);
            const activeOnly = (res.data.users || []).filter(u => u.account_status === 1);
            setAllMembers(activeOnly);
        } catch (error) {
            console.error(error);
        }
    }, [deptid]);

    const removeMember = async (userId, userName) => {
        const result = await Swal.fire({
            title: "Remove member?",
            text: `${userName} will lose access to this office.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, remove",
        });

        if (result.isConfirmed) {
            try {
                await removeUserFromDepartment(userId);
                Swal.fire("Removed", "Member removed successfully.", "success");
                loadData(); // Refresh list
            } catch (error) {
                Swal.fire("Error", error.response?.data?.error || "Removal failed", "error");
            }
        }
    };

    useEffect(() => {
        loadData();
        socket.on("user_modified", loadData);
        socket.on("user_created", loadData);
        return () => {
            socket.off("user_modified");
            socket.off("user_created");
        };
    }, [loadData]);

    const filteredData = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return allMembers.filter((m) =>
            [m.email, m.first_name, m.last_name, m.position?.name].some(
                (field) => String(field || "").toLowerCase().includes(query)
            )
        );
    }, [allMembers, searchQuery]);

    return {
        paginatedMembers: filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage),
        searchQuery,
        setSearchQuery: (q) => { setSearchQuery(q); setPage(1); },
        page,
        setPage,
        totalPages: Math.ceil(filteredData.length / rowsPerPage),
        removeMember // Exported for the Row component
    };
}