import { useEffect, useState } from "react"
import { getDepartments, getDepartment, getDepartmentMembers } from "../services/departmentService";


function DepartmentMemberTable(props) {

    
    const [tenMembers, setTenMembers] = useState([])
    const [pages, setPages] = useState([]) 
    const [memberLimit, setMemberLimit] = useState({"offset": 0, "limit": 10})

    async function loadAllMembers(id, offset, limit) {
        var res = await getDepartment(id).then(data => data.data)
        var calculatedPage = res.users.length / 10
    
        for(var i = 1; i <= calculatedPage; i++){
            setPages([...pages, {"id": 1, "page": {i}}])
        }        
        var res = await getDepartmentMembers(id, offset, limit).then(data => data.data)
        setTenMembers(res)
    }

    useEffect(()=> {
        console.log("loading members")
        loadAllMembers(props.deptid, memberLimit["offset"], memberLimit["limit"])
        console.log("members loaded")
    }, [memberLimit])

    useEffect(()=>{
        
    },[])
    return (
        <div className="member-container">
            <div className="table-header-container">
                <div className="table-title">Department Members</div>
                        {/**<div className="add-members">
                            <button>
                                <span className="material-symbols-outlined">add</span>
                                <span>Add Members</span>
                            </button>
                        </div>
                        <div className="sorting-container">
                            <label htmlFor="sort">Sort By: </label>
                            <select name="sort" id="sort">
                                <option value="">First Name</option>
                                <option value="">Last Name</option>
                                <option value="">Role</option>
                                <option value="">Date Created</option>
                            </select>
                            <select name="sort" id="sort">
                                <option value="">Ascending</option>
                                <option value="">Descending</option>
                            </select>
                        </div> */
                            
                        }
                <div className="search-members">
                        <input type="text" placeholder="Search member..."/>                        
                </div>                        
            </div>

            <div className="table-container">
                <table>
                    <tbody>
                        <tr>
                            <th>ID</th>
                            <th>EMAIL ADDRESS</th>
                            <th>FIRST NAME</th>
                            <th>LAST NAME</th>
                            <th>POSITION</th>
                            <th>ROLE</th>
                            <th>ACTIONS</th>
                        </tr>
                                
                        {tenMembers != 0? tenMembers.map(mems => (
                        <tr key = {mems.id}>
                            <td>{mems.name}</td>                                    
                            <td>johndoe@gmail.com</td>
                            <td>John</td>
                            <td>Doe</td>
                            <td>Instructor</td>
                            <td>Faculty</td>
                            <td>
                                <span className="material-symbols-outlined">more_vert</span>
                                {/**
                                             * assign tasks
                                             * edit position
                                             * remove
                                */}
                            </td>
                        </tr>
                        )):

                        <tr className="empty-table">
                            <td>No users</td>
                        </tr>
                        }
                    </tbody>                               
                </table>                        
            </div>
            <div className="pagination">
                {pages.map(page => (
                    <span className="pages" key={page.id}> {page.page}</span>
                ))}
            </div>
        </div>
    )
}

export default DepartmentMemberTable