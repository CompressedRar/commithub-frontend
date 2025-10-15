import { useState, useEffect, useRef } from "react"
import { getPositions } from "../../services/positionService"
import {  getDepartments } from "../../services/departmentService"
import { archiveAccount, getAccountInfo, updateMemberInfo, unarchiveAccount, resetAccountPasssword, checkEmail } from "../../services/userService"
import { objectToFormData } from "../api"
import Swal from "sweetalert2"
import { Modal } from "bootstrap/js/dist/modal"
import { socket } from "../api";


function MemberProfile(props){
    
    const [memberInformation, setMemberInformation] = useState({}) 
    const [positions, setPositions] = useState([])   
    const [allDepartments, setAllDepartments] = useState([])
    const [formData, setFormData] = useState({"id": 0, "department": 0})
    const [page, setPage] = useState(0)
    const [dataChanged, setDataChanged] = useState(false)
    const [archiving, setArchiving] = useState(false)
    const[preview, setPreview] = useState(null)
    const fileInput = useRef(null)
    const [updating, SetUpdating] = useState(false)
    const [resetting, setResetting] = useState(false)
    const [allIPCRs, setIPCRs] = useState(null)

    const [emailQuery, setEmailQuery] = useState("");
    const [emailQueryResult, setEmailQueryResult] = useState(null);

    const [firstEmail, setFirstEmail] = useState(null)
    const [isEmailValid, setEmailValid] = useState(true)

    

    async function loadUserInformation(){
        var res = await getAccountInfo(props.id).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        setMemberInformation(res)
        console.log("MEMBER INFO", res)
        setIPCRs(res.ipcrs)

        
        
        var fname = document.getElementById("first_name")
        fname.value= res.first_name
        var mname = document.getElementById("middle_name")
        mname.value= res.middle_name
        var lname = document.getElementById("last_name")
        lname.value= res.last_name
        var dept = document.getElementById("department")
        dept.value = res.department.id
        var position = document.getElementById("position")
        position.value = res.position.id
        var email = document.getElementById("email")
        email.value = res.email
        console.log("HEHE",res)
        setPreview(res.profile_picture_link)
        setFirstEmail(res.email)
        setFormData({
            "id": props.id,
            "department": res.department.id,
            "position": res.position.id,
            "first_name": res.first_name,
            "midde_name": res.middle_name,
            "last_name": res.last_name,
            "position": res.position.id,
            "email":res.email
        })

        console.log("lock and loaded")

    }

    const Reactivate = async () => {
        var res = await unarchiveAccount(props.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        if(res == "User successfully reactivated") {
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
    }
    const handleReactivate = async () => {
        Swal.fire({
            title: 'Do you want to reactivate this account?',
            showDenyButton: true,
            confirmButtonText: 'Yes',
            denyButtonText: 'No',
            customClass: {
                actions: 'my-actions',
                cancelButton: 'order-1 right-gap',
                confirmButton: 'order-2'
                },
        }).then(async (result) => {
            if (result.isConfirmed) {
                Reactivate()
            } else if (result.isDenied) {
                                   
            }
        })
                
        
        const modalEl = document.getElementById("user-profile");
        const modal = Modal.getOrCreateInstance(modalEl);

        modal.hide();

            // Cleanup leftover backdrop if any
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = ""; // reset scroll lock
        
        setArchiving(false)
    }

    const handleArch = async () => {
        var res = await archiveAccount(props.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        if(res == "User successfully deactivated") {
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
         else {
            Swal.fire({
                title:"Error",
                text: res,
                icon:"error"
            })
        }
    }

    const handleArchive = async () => {
        
       Swal.fire({
            title: 'Do you want to deactivate this account?',
            showDenyButton: true,
            confirmButtonText: 'Yes',
            denyButtonText: 'No',
            customClass: {
                actions: 'my-actions',
                cancelButton: 'order-1 right-gap',
                confirmButton: 'order-2'
                },
                       }).then(async (result) => {
                       if (result.isConfirmed) {
                           handleArch()
                       } else if (result.isDenied) {
                           
                       }
                   })
        

        const modalEl = document.getElementById("user-profile");
        const modal = Modal.getOrCreateInstance(modalEl);

        modal.hide();

            // Cleanup leftover backdrop if any
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = ""; // reset scroll lock

        setArchiving(false)
        props.firstLoad();
    }

    //gawin yung reset password
    //gawin yung deactivate user

    const ResetPassword = async () => {
        setResetting(true)
        var res = await resetAccountPasssword(props.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        if(res == "Password successfully reset.") {
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
         else {
            Swal.fire({
                title:"Error",
                text: res,
                icon:"error"
            })
        }
        setResetting(false)
    }

    const handleResetPassword = async () => {
        
       Swal.fire({
            title: 'Reset Password?',
            showDenyButton: true,
            text:"The password of this account will be reset to its default password. Do you want to continue?",
            confirmButtonText: 'Yes',
            confirmButtonColor:"red",
            icon:"warning",
            denyButtonText: 'No',
            denyButtonColor:"grey",
            customClass: {
                actions: 'my-actions',
                cancelButton: 'order-1 right-gap',
                confirmButton: 'order-2'
                },
                       }).then(async (result) => {
                       if (result.isConfirmed) {
                           ResetPassword()
                       } else if (result.isDenied) {
                           
                       }
                   })
        

        setArchiving(false)
    }

    

    async function loadDepartments(){
        var res = await getDepartments().then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        setAllDepartments(res)
        console.log(res)
    }

    async function handleUpdate() {
        if (!isEmailValid) {
            Swal.fire({
                title: "Error",
                text: "Email was already taken.",
                icon: "error"
            })
            return
        }
        var converted_data = objectToFormData(formData)
        if (fileInput != null){
            converted_data.set("profile_picture_link", fileInput.current.files[0])
        }
        console.log("FORM DATA", converted_data)
        SetUpdating(true)
        var res = await updateMemberInfo(converted_data).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        console.log(res)
        if(res == "User successfully updated") {
                Swal.fire({
                    title:"Success",
                    text: res,
                    icon:"success"
                })
            }
        else {
            Swal.fire({
                title:"Error",
                text: res,
                icon:"error"
            })
        }
        SetUpdating(false)

        await loadUserInformation()
    }
    
    function detectChange(){
        if(page != 1) return;
        var fname = document.getElementById("first_name")
        var mname = document.getElementById("middle_name")
        var lname = document.getElementById("last_name")
        var dept = document.getElementById("department")
        var position = document.getElementById("position")
        var role = document.getElementById("role")

        var res =  ((role.value == memberInformation.role)&&(fname.value == memberInformation.first_name) && (mname.value == memberInformation.middle_name) && (lname.value == memberInformation.last_name) && (dept.value == memberInformation.department.id) && (position.value == memberInformation.position.id) && (preview == memberInformation.profile_picture_link))
        setDataChanged(res)
        
    }

    const loadPositions = async () => {
        const result = await getPositions().then(data => {
                return data.data    
            }).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
            setPositions(result)
        }

    const handleImageChange = () => {
        const file = fileInput.current.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
        }

        const imageUrl = URL.createObjectURL(file);
        setPreview(imageUrl);

        setFormData((prev) => ({
            ...prev,
            "profile_picture_link": file
        }));
        
         
    };
    
    const handleDataChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})     
    }
    useEffect(()=> {
        console.log("is data changed", preview == memberInformation.profile_picture_link)
        setDataChanged(false)
    }, [preview])

    useEffect(()=>{
        console.log(dataChanged)
    }, [dataChanged])

    useEffect(()=> {
        loadUserInformation()
    }, [page])

    useEffect(()=>{
        console.log(formData)
        detectChange()
    }, [formData])

    useEffect(() => {
    if (!emailQuery) return;

    const timeout = setTimeout(async () => {
        try {
            setEmailValid(false)
            if(emailQuery == firstEmail) {
                setEmailValid(true)
                return
            }
            const res = await checkEmail(emailQuery);
            const msg = res.data.message;
            if (msg === "Available") {
                setEmailValid(true)
                setEmailQueryResult(<span className="text-success">{msg}</span>);
            } else if (msg === "Email was already taken.") {
                setEmailValid(false)
                setEmailQueryResult(<span className="text-danger">{msg}</span>);
            } else {
                setEmailQueryResult(
                <span className="text-muted">Error checking email</span>
            );
            }
        } catch {
            setEmailValid(false)
            setEmailQueryResult(
            <span className="text-muted">Error checking email</span>
            
            );
        }
        }, 400);
        return () => clearTimeout(timeout);
    }, [emailQuery]);

    useEffect(()=>{
        loadDepartments()
        loadPositions()
        
        socket.on("user_modified", ()=>{
            loadUserInformation()
        })
    }, [])





    return(
        <div className="profile-edit-container container-fluid">
      <div className=" ">
        <div className="card-body p-4">
          <h4 className="mb-4 d-flex align-items-center gap-2 text-primary">
            <span className="material-symbols-outlined">manage_accounts</span>
            Edit Profile
          </h4>

          {/* Profile Image */}
          <div className="d-flex align-items-center gap-4 mb-4">
            <div
              className="rounded-circle border border-2 border-primary"
              style={{
                width: "100px",
                height: "100px",
                backgroundImage: `url('${preview || "/default-avatar.png"}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
            <div>
              <label htmlFor="profile-image" className="btn btn-outline-primary btn-sm">
                <span className="material-symbols-outlined me-1">upload</span>
                Change Photo
              </label>
              <input
                type="file"
                id="profile-image"
                name="profile-image"
                onChange={handleImageChange}
                ref={fileInput}
                accept="image/*"
                hidden
              />
            </div>
          </div>

          <h5 className="fw-semibold mb-3 text-secondary">Account Information</h5>
          <div className="row g-3">
            <div className="col">
              <label htmlFor="email" className="form-label d-flex flex-row align-items-center gap-2">Email Address 
            <div>{emailQueryResult}</div></label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="example@email.com"
                defaultValue={memberInformation && memberInformation.email}
                onInput={(e) => {
                    handleDataChange(e)
                    setEmailQuery(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="row g-1">
            <div className="">
              <label htmlFor="first_name" className="form-label">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className="form-control"
                placeholder="John"
                defaultValue={memberInformation && memberInformation.first_name}
                onInput={handleDataChange}
              />
            </div>

            <div className="">
              <label htmlFor="middle_name" className="form-label">Middle Name</label>
              <input
                type="text"
                id="middle_name"
                name="middle_name"
                className="form-control"
                defaultValue={memberInformation && memberInformation.middle_name}
                placeholder="Doe"
                onInput={handleDataChange}
              />
            </div>

            <div className="">
              <label htmlFor="last_name" className="form-label">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className="form-control"
                placeholder="Doe"
                defaultValue={memberInformation && memberInformation.last_name}
                onInput={handleDataChange}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="department" className="form-label">Department</label>
              <select
                id="department"
                name="department"
                className="form-select"
                onChange={handleDataChange}
                defaultValue={memberInformation && memberInformation.department.id}
              >
                {allDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label htmlFor="position" className="form-label">Position</label>
              <select
                id="position"
                name="position"
                className="form-select"
                onChange={handleDataChange}
                defaultValue={memberInformation && memberInformation.position.id}
              >
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>{pos.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label htmlFor="role" className="form-label">Role</label>
              <select id="role" name="role" className="form-select" onChange={handleDataChange}>
                <option value="faculty">Faculty</option>
                <option value="head">Head</option>
                <option value="president">President</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              className="btn btn-secondary"
              disabled={dataChanged}
            >
              Cancel
            </button>
            <button
              className="btn btn-success"
              disabled={dataChanged || updating}
              onClick={() => handleUpdate()}
            >
              {updating ? (
                <span className="material-symbols-outlined align-middle">refresh</span>
              ) : (
                <>
                  <span className="material-symbols-outlined align-middle me-1">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>

          <hr className="my-4" />

          {/* Account Section */}
          

          <div className="d-flex gap-3 mt-4 flex-wrap">
            <button
              className="btn btn-warning d-flex align-items-center gap-1"
              disabled={resetting}
              onClick={handleResetPassword}
            >
              <span className="material-symbols-outlined">restart_alt</span>
              {resetting ? "Resetting..." : "Reset Password"}
            </button>

            <button
              className={`btn d-flex align-items-center gap-1 ${
                memberInformation.account_status === 0 ? "btn-success" : "btn-danger"
              }`}
              onClick={() => {
                if (memberInformation.account_status) handleArchive();
                else handleReactivate();
              }}
            >
              <span className="material-symbols-outlined">
                {memberInformation.account_status === 0 ? "account_circle" : "account_circle_off"}
              </span>
              {memberInformation.account_status === 0 ? "Reactivate" : "Deactivate"}
            </button>
          </div>
        </div>
      </div>
    </div>
    )
}

export default MemberProfile