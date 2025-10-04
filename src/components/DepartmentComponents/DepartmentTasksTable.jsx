import { useEffect, useState } from "react"
import { getDepartments, getDepartment, getDepartmentMembers, getDepartmentTasks } from "../../services/departmentService";

import { socket } from "../api";
import DepartmentTask from "./DepartmentTask";
import DepartmentTaskInfo from "./DepartmentTaskInfo";
import DepartmentAssignTask from "./DepartmentAssignTask";
import AddDepartmentTask from "./AddDepartmentTask";

function DepartmentTasksTable(props) {

    const [allMembers, setAllMembers] = useState([])
    const [filteredMembers, setFilteredMembers] = useState([])

    const [tenMembers, setTenMembers] = useState([])
    const [pages, setPages] = useState([]) 
    const [currentPage, setCurrentPage] = useState(1)
    const [memberLimit, setMemberLimit] = useState({"offset": 0, "limit": 10})
    const [searchQuery, setQuery] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const [currentUserID, setCurrentUserID] = useState(0)

    //department task assign
    
    async function loadAllMembers() {      
        var res = await getDepartmentTasks(props.id).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        console.log(res)
        setAllMembers(res)
        setFilteredMembers(res)
        generatePagination(res)
        console.log("loaded all the members")

    }

    function loadLimited(){
        var slicedMembers = filteredMembers.slice(memberLimit["offset"], memberLimit["limit"])
        console.log("department tasks", slicedMembers)
        setTenMembers(slicedMembers)
    }

    function loadSearchedData(query){
        console.log("displatyed")
        var matchedMembers = []

        for(const member of allMembers){
            
            if(  member.name.toLowerCase().includes(query.toLowerCase()) ||
                member.actual_accomplishment.toLowerCase().includes(query.toLowerCase()) ||
            member.target_accomplishment.toLowerCase().includes(query.toLowerCase()) || 
            member.category.name.toLowerCase().includes(query.toLowerCase()) 
            ){
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
        loadAllMembers()
        console.log("members loaded")

        socket.on("user_created", ()=>{
            loadAllMembers()
            console.log("new user added")
        })

        socket.on("user_assigned", ()=>{
            loadAllMembers()
            console.log("new user added")
        })

        socket.on("task_modified", ()=>{
            loadAllMembers()
            console.log("task_modified")
        })
        socket.on("department_assigned", ()=>{
            loadAllMembers()
            console.log("department_asigned")
        })

        

        return () => {
            socket.off("department_assigned");
            socket.off("user_created");
            socket.off("task_modified");
            socket.off("user_assigned")
            socket.off("user_unassigned")
        }
        
    },[])

    //add tasks bukas
    //simuklan na yung ipcr bukas
    //view profile ng user sa department
    return (
        <div className="member-container">
            <div className="modal fade " id="add-user"  data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-xl" >
                    <div className="modal-content model-register">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Add Tasks</h5>
                            
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">

                            {/**Dito ilalagay add department task */}
                            <AddDepartmentTask dept_id = {props.id}></AddDepartmentTask>

                        </div>
                        
                    </div>
                </div>
            </div>

            <div className="modal fade" id="user-profile"  data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg" >
                    <div className="modal-content model-register " style={{backgroundColor: "rgb(233, 233, 233)"}}>
                        <div className="modal-header">
                            <h2>Assign Members</h2>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {/**currentUserID? <DepartmentTaskInfo key={currentUserID} id = {currentUserID}></DepartmentTaskInfo> :""*/}    
                            {currentUserID? <DepartmentAssignTask key={currentUserID} task_id = {currentUserID} dept_id = {props.id}></DepartmentAssignTask> :""}                                              
                        </div>
                        
                    </div>
                </div>
            </div>


            <div className="table-header-container" id="user-table">
                <div className="table-title">Tasks</div>
                <div className="create-user-container">
                    <button data-bs-toggle="modal" data-bs-target="#add-user" className="btn btn-primary">
                        <span className="material-symbols-outlined">add</span>
                        <span>Add Tasks</span>
                    </button>
                </div>
                <div className="search-members">
                        <input type="text" placeholder="Search task..." onInput={(element)=>{setQuery(element.target.value)}}/>                        
                </div>                        
            </div>

            <div className="table-container">
                <table>
                    <tbody>
                        <tr>
                            <th>TASK NAME</th>
                            <th>TARGET</th>
                            <th>ACTUAL</th>
                            <th>CATEGORY</th>
                            <th>INDIVIDUALS ASSIGNED</th>
                            <th></th>
                        </tr>
                                
                        {tenMembers != 0? tenMembers.map(mems => (
                        <DepartmentTask mems = {mems} switchMember = {(id) => {setCurrentUserID(id); console.log("hehe", id)}}></DepartmentTask>)):

                        ""
                        }
                    </tbody>        
                                         
                </table>    
                                    
            </div>
            {tenMembers != 0?"":
                    <div className="empty-symbols">
                        <span className="material-symbols-outlined">file_copy_off</span>    
                        <span className="desc">No Tasks Found</span>
                    </div>}  
            <div className="pagination">
                {pages.map(data => (<span className="pages" key={data.id} onClick={()=>{
                    setMemberLimit({"offset": 0+((data.page * 10) - 10), "limit": data.page * 10})
                    
                }}> {data.page}</span>))}
            </div>
        </div>
    )
}

export default DepartmentTasksTable