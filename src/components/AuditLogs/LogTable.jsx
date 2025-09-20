import { useEffect, useState } from "react"

import { socket } from "../api";
import { getLogs } from "../../services/logService";
import Logs from "./Logs";

function LogTable() {

    const [allMembers, setAllMembers] = useState([])
    const [filteredMembers, setFilteredMembers] = useState([])

    const [tenMembers, setTenMembers] = useState([])
    const [pages, setPages] = useState([]) 
    const [currentPage, setCurrentPage] = useState(1)
    const [memberLimit, setMemberLimit] = useState({"offset": 0, "limit": 10})
    const [searchQuery, setQuery] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const [currentUserID, setCurrentUserID] = useState(0)
    
    async function loadAllMembers() {      
        var res = await getLogs().then(data => data.data)
        console.log(res)
        setAllMembers(res)
        setFilteredMembers(res)
        generatePagination(res)
        console.log("loaded all the logs")

    }

    //assign task bukas
    //account settings
    //department tasks at user settings non
    //remove user sa department
    //update yung dashboard
    //reset password
    //change email user
 
    function loadLimited(){
        var slicedMembers = filteredMembers.slice(memberLimit["offset"], memberLimit["limit"])
        console.log(slicedMembers)
        setTenMembers(slicedMembers)
    }

    function loadSearchedData(query){
        console.log("displatyed")
        var matchedMembers = []

        for(const member of allMembers){
            
            if( member.full_name.includes(query) ||
            member.action.includes(query) || 
            String(member.id).includes(query)|| 
            member.timestamp.includes(query) ||
            
            member.ip_address.includes(query) ||
            member.user_agent.includes(query) ||
            member.department.includes(query) ){
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
            loadAllMembers()
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

        
    },[])
    return (
        <div className="member-container">
            <div className="table-header-container" id="user-table">
                <div className="table-title">Logs</div>
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
                        <input type="text" placeholder="Search logs..." onInput={(element)=>{setQuery(element.target.value)}}/>                        
                </div>                        
            </div>

            <div className="table-container">
                <table>
                    <tbody>
                        <tr>
                            <th>USER AGENT</th>                            
                            <th>USER</th>
                            <th>DEPARTMENT</th>
                            <th>ACTION</th>
                            <th>TARGET</th>
                            <th>IP ADDRESS</th>
                            <th>TIMESTAMP</th>
                        </tr>
                                
                        {tenMembers != 0? tenMembers.map(log => (
                            <Logs log = {log}></Logs>
                        )):

                        <tr className="empty-table">
                            <td>No logs</td>
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

export default LogTable