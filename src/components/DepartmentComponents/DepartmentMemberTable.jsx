import { useEffect, useState } from "react"
import { getDepartments, getDepartment, getDepartmentMembers } from "../../services/departmentService";
import DepartmentMembers from "./DepartmentMembers";
import { socket } from "../api";
function DepartmentMemberTable(props) {

    const [allMembers, setAllMembers] = useState([])
    const [filteredMembers, setFilteredMembers] = useState([])

    const [tenMembers, setTenMembers] = useState([])
    const [pages, setPages] = useState([]) 
    const [currentPage, setCurrentPage] = useState(1)
    const [memberLimit, setMemberLimit] = useState({"offset": 0, "limit": 10})
    const [searchQuery, setQuery] = useState("")
    
    async function loadAllMembers(id) {      
        var res = await getDepartment(id).then(data => data.data.users)
        setAllMembers(res)
        setFilteredMembers(res)
        generatePagination(res)
        

    }

    function loadLimited(){
        var slicedMembers = filteredMembers.slice(memberLimit["offset"], memberLimit["limit"])
        console.log(slicedMembers)
        setTenMembers(slicedMembers)
    }

    function loadSearchedData(query){
        console.log("displatyed")
        var matchedMembers = []

        for(const member of allMembers){
            
            if( member.email.includes(query) || 
            member.first_name.includes(query) || 
            member.last_name.includes(query) || 
            member.position.name.includes(query) || 
            String(member.id).includes(query) ){
                matchedMembers = [...matchedMembers, member]
            }
        }
        console.log(matchedMembers)
        
        setFilteredMembers(matchedMembers)
        generatePagination(matchedMembers)
        setMemberLimit({"offset": 0, "limit": 10})
    }


    function generatePagination(array){
        var calculatedPage = array.length / 10
        
        var newPages = []
        for(var i = 1; i <= Math.ceil(calculatedPage); i++){
            console.log(i)
            newPages = [...newPages, {"id": i, "page": i}]
        }  
        console.log(newPages)
        setPages(newPages)
    }

    useEffect(()=>{
        if(searchQuery.length == 0) {
            loadLimited()
            loadAllMembers(props.deptid)
            return   
        }
        const debounce = setTimeout(()=>{
            loadSearchedData(searchQuery)
        }, 500)

        return ()=> clearTimeout(debounce)


    }, [searchQuery])

    useEffect(()=> {
        
        loadLimited()
        
    }, [allMembers])

    useEffect(()=> {
        
        loadLimited()
        
    }, [memberLimit])

    useEffect(()=>{
        console.log("loading members")
        loadAllMembers(props.deptid)
        console.log("members loaded")

        socket.on("user_modified", ()=>{
            loadAllMembers(props.deptid)
            console.log("user modified")
        })

        socket.on("user_created", ()=>{
            loadAllMembers(props.deptid)
            console.log("user modified")
        })
        
        return () => {
            socket.off("user_created");
            socket.off("user_modified");
        }
        
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
                        <input type="text" placeholder="Search member..." onInput={(element)=>{setQuery(element.target.value)}}/>                        
                </div>                        
            </div>

            <div className="table-container">
                <table>
                    <tbody>
                        <tr>
                            <th>ID</th>
                            <th>EMAIL ADDRESS</th>
                            <th>FULL NAME</th>
                            
                            <th>POSITION</th>
                            <th>NO. OF TASKS</th>
                            <th>STATUS</th>
                            <th></th>
                        </tr>
                                
                        {tenMembers != 0? tenMembers.map(mems => (
                        <DepartmentMembers mems = {mems}></DepartmentMembers>)):

                        <tr className="empty-table">
                            <td>No users</td>
                        </tr>
                        }
                    </tbody>                               
                </table>                        
            </div>
            <div className="pagination">
                {pages.map(data => (<span className="pages" key={data.id} onClick={()=>{
                    setMemberLimit({"offset": 0+((data.page * 10) - 10), "limit": data.page * 10})
                    
                }}> {data.page}</span>))}
            </div>
        </div>
    )
}

export default DepartmentMemberTable