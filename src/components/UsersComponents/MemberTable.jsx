import { useEffect, useState } from "react"

import { getAccounts } from "../../services/userService";
import Members from "./Members";

import { socket } from "../api";
import MemberProfile from "./MemberProfile";

function MemberTable(props) {

    const [allMembers, setAllMembers] = useState([])
    const [filteredMembers, setFilteredMembers] = useState([])

    const [tenMembers, setTenMembers] = useState([])
    const [pages, setPages] = useState([]) 
    const [memberLimit, setMemberLimit] = useState({"offset": 0, "limit": 10})
    const [searchQuery, setQuery] = useState("")

    const [currentUserID, setCurrentUserID] = useState(0)

    //department task assign
    
    async function loadAllMembers() {      
        var res = await getAccounts().then(data => data.data).catch(error => {
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
            String(member.id).includes(query)|| 
            member.created_at.includes(query) ||
            member.role.includes(query) ||
            member.department.name.includes(query) ){
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

        socket.on("user_modified", ()=>{
            loadAllMembers()
            console.log("user modified")
        })

        return () => {
            socket.off("user_created");
            socket.off("user_modified");
        }
        
    },[])
    return (
        <div className="member-container">
            <div className="modal fade " id="add-user"  data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-fullscreen" >
                    <div className="modal-content model-register">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Create Account</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <iframe className="register-page" src="/create" frameborder="0"></iframe>                                                        
                        </div>
                        
                    </div>
                </div>
            </div>

            <div className="modal fade " id="user-profile"  data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg" >
                    <div className="modal-content model-register">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Profile Page</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {currentUserID? <MemberProfile key={currentUserID} id = {currentUserID}></MemberProfile> :""}                                                   
                        </div>
                        
                    </div>
                </div>
            </div>


            <div className="table-header-container" id="user-table">
                <div className="table-title">Accounts</div>
                <div className="create-user-container">
                    <button data-bs-toggle="modal" data-bs-target="#add-user" className="btn btn-primary">
                        <span className="material-symbols-outlined">add</span>
                        <span>Create Account</span>
                    </button>
                </div>
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
                        <input type="text" placeholder="Search user..." onInput={(element)=>{setQuery(element.target.value)}}/>                        
                </div>                        
            </div>

            <div className="table-container">
                <table>
                    <tbody>
                        <tr>
                            <th>ID</th>
                            <th>EMAIL ADDRESS</th>
                            <th>FULL NAME</th>
                            <th>DEPARTMENT</th>
                            <th>POSITION</th>
                            <th>ROLE</th>
                            <th style={{textAlign: "center"}}>STATUS</th>
                            <th>DATE CREATED</th>
                            <th></th>
                        </tr>
                                
                        {tenMembers != 0? tenMembers.map(mems => (
                        <Members mems = {mems} switchMember = {(id) => {setCurrentUserID(id); console.log("hehe", id)}}></Members>)):

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

export default MemberTable