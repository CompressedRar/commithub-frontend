import { useEffect, useRef, useState } from "react"
import Swal from "sweetalert2"

import "../assets/styles/Register.css"

import { getPositions } from "../services/positionService"
import { registerAccount, checkEmail } from "../services/userService"
import { objectToFormData } from "../components/api"

function Register(){

    const [formData, setFormData] = useState({"position": "none", "department": "staff"})
    const [positions, setPositions] = useState([])
    const [preview, setPreview] = useState(null)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    
    const [emailQuery, setEmailQuery] = useState("")
    const [emailQueryResult, setEmailQueryResult] = useState(null)
    const fileInput = useRef(null)

    useEffect(()=> {
        //console.log(formData)
    }, [formData])

    useEffect(()=> {
        console.log(positions)
    }, [positions])

    useEffect(()=> {
        loadPositions()
    }, [])

    const handleDataSubmission = async (e) => {
        e.preventDefault()
        console.log(confirmPassword, password)
        
        if(!fileInput) {
            Swal.fire({
                title: "Error",
                text: "You must upload a picture.",
                icon:"error"
            })
            return 
        }
        /*
        var pass = document.getElementById("password")
        var confirmPass = document.getElementById("confirmpassword")
        if(pass.value != confirmPass.value){
            Swal.fire({
                title: "Error",
                text: "Passwords must match.",
                icon:"error"
            })
            return
        }*/

        const newFormData = objectToFormData(formData);
        const file = fileInput.current.files[0];
        newFormData.append("profile_picture", file)

        const result = await registerAccount(newFormData).then(data => {
            return data.data
        })
        console.log(result["message"])

        if(result["message"] == "Account creation is successful."){
            Swal.fire({
                title: "Registration Result",
                text: result["message"],
                icon: "success"
            })
            clearAllFields()
        }
        else {
            Swal.fire({
                title: "Registration Result",
                text: result["message"],
                icon: "error"
            })
        }


    }

    const handleDataChange = (e) => {


        setFormData({...formData, [e.target.name]: e.target.value})
    }

    const loadPositions = async () => {
        const result = await getPositions().then(data => {
            return data.data    
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
    };

    function validatePassword(){
        if(password != confirmPassword){
            Swal.fire({
                title: "Error",
                text: "Passwords must match.",
                icon:"error"
            })
        }
    }
    
    //pang check ng password tas pangkulay ng border 
    function checkPassword(){
        
        var pass = document.getElementById("password")
        var confirmPass = document.getElementById("confirmpassword")

        setConfirmPassword(confirmPass.value)
        setPassword(pass.value)

        console.log(pass.value + " " + confirmPass.value)
        console.log(pass.value != confirmPass.value)
        if(pass.value != confirmPass.value){

            pass.style.borderColor = "red"
            confirmPass.style.borderColor = "red"
        }
        else {
            pass.style.borderColor = "green"
            confirmPass.style.borderColor = "green"
        }

    }

    //pang clear ng fields pagsuccessful yung registration

    function clearAllFields() {        
        fileInput.current.value = null
        document.getElementById("email").value = ""
        document.getElementById("first_name").value = ""
        document.getElementById("middle_name").value = ""
        document.getElementById("last_name").value = ""

        document.getElementById("department").value = "computing_studies"
        document.getElementById("position").value = "1"
    }

    //check niya dito if existing na yung email
    useEffect( ()=>{
        
        if(!emailQuery) return
        
        
        var timeOut = setTimeout(async ()=>{
            
            var a = await checkEmail(emailQuery)
            var msg = a.data.message

            if(msg == "Available"){
                setEmailQueryResult(<span style={{color: "green"}}>{msg}</span>)
            }
            else if(msg == "Email was already taken.") {
                setEmailQueryResult(<span style={{color: "red"}}>{msg}</span>)
            }
            else {
                setEmailQueryResult(<span>An error has occured.</span>)
            }
            
        }, 400)

        return ()=>clearTimeout(timeOut)
    }, [emailQuery])

    

    return (
        
        
        <div className="register-container">
            
            <div className="bg-container">
                <img src="nc-splash-new.jpg" alt="" />
            </div>

            <form className="register-form-container" onSubmit={handleDataSubmission}>
                <div className="back-to-login">
                    <a href="/">Back to login page.</a>
                </div>
                <div className="account-information">
                    <h2>Account Information</h2>
                    <label className="profile-container" style={{display:"flex"}} >
                        <label className="profile" style={{backgroundImage: `url('${preview}')`}} >
                            <label >
                                {!preview && 
                                    <label style={{display:"flex", flexDirection: "column", justifyContent:"center", alignItems: "center"}}htmlFor="profile-pic">
                                        <span className="material-symbols-outlined" style={{fontSize:"5rem"}}>add</span>
                                        <span>Add Profile Picture</span>
                                    </label>
                                }
                            </label>
                            <input type="file" name="profile-pic" id="profile-pic" onChange={handleImageChange} ref={fileInput} required accept="image/*" hidden/>
                        </label>
                    </label>

                    <div className="textboxes">
                        <label htmlFor="email" className="email-label">
                            <div>
                                <span>Email Address</span>
                                <span className="required">*</span>
                            </div>
                            <span>
                                {emailQueryResult}
                            </span>
                        </label>
                        <input type="email" id="email" name="email" placeholder="Eg. johndoe@gmail.com"
                        onInput={(e)=>{
                            handleDataChange(e)
                            setEmailQuery(e.target.value)
                        }} 
                        required/>
                    </div>

                    {/* <div className="textboxes">
                        <label htmlFor="password">Password <span className="required">*</span></label>
                        <input type="password" id="password" name="password" placeholder="8 characters or more..."
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                        title="Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."
                        onInput={(e)=>{
                            checkPassword(e)
                            setPassword(e.target.value)
                            handleDataChange(e)
                            
                        }}/>
                    </div>

                    <div className="textboxes">
                        <label htmlFor="confirmpassword">Confirm Password <span className="required">*</span></label>
                        <input type="password" id="confirmpassword" name="confirmpassword" placeholder="8 characters or more"
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                        title="Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."
                        onInput={(e)=>{
                            checkPassword(e)
                            setConfirmPassword(e.target.value)                            
                        }}/>
                    </div>*/}

                    <div className="textboxes">
                        <label htmlFor="first_name">Given Name <span className="required">*</span></label>
                        <input type="first_name" id="first_name" name="first_name" placeholder="Eg. John" onInput={handleDataChange} required/>
                    </div>

                    <div className="textboxes">
                        <label htmlFor="middle_name">Middle Name</label>
                        <input type="middle_name" id="middle_name" name="middle_name" placeholder="Eg. Craig" onInput={handleDataChange} required/>
                    </div>

                    <div className="textboxes">
                        <label htmlFor="last_name">Last Name <span className="required">*</span></label>
                        <input type="last_name" id="last_name" name="last_name" placeholder="Eg. Doe" onInput={handleDataChange} required/>
                    </div>
                    
                    <div className="textboxes">
                        <label htmlFor="department">Department <span className="required">*</span></label>
                        <select name="department" id="department" onInput={handleDataChange}>
                            <option value="computing_studies">College of Computing Studies</option>
                            <option value="education">College of Education</option>
                            <option value="hospitality_management">College of Hospitality Management</option>
                            <option value="administrative">Administrative Office</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>

                    <div className="textboxes">
                        <label htmlFor="position">Position <span className="required">*</span></label>
                        <select name="position" id="position" onInput={handleDataChange}>
                            {positions.map(pos => (
                                <option value = {`${pos.id}`}>{pos.name}</option>
                            ))}
                            
                        </select>
                    </div>
                </div>

                <div className="personal-information">
                    
                    

                    
                </div>
                <div className="submit-container">
                    <input type="submit" value = "Register"/>
                </div>
            </form>
        </div>
    )
}

export default Register