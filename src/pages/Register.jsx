import { useEffect, useRef, useState } from "react"
import "../assets/styles/Register.css"

import { getPositions } from "../services/positionService"
import { registerAccount } from "../services/userService"
import { objectToFormData } from "../components/api"

function Register(){

    const [formData, setFormData] = useState({"position": "none", "department": "staff"})
    const [positions, setPositions] = useState([])
    const [preview, setPreview] = useState(null)
    const fileInput = useRef(null)

    useEffect(()=> {
        console.log(formData)
    }, [formData])

    useEffect(()=> {
        console.log(positions)
    }, [positions])

    useEffect(()=> {
        loadPositions()
    }, [])

    const handleDataSubmission = async (e) => {
        e.preventDefault()
        const newFormData = objectToFormData(formData);
        const file = fileInput.current.files[0];
        newFormData.append("profile_picture", file)

        console.log("submitting")
        console.log(newFormData)
        const result = await registerAccount(newFormData).then(data => {
            return data.data
        })

        console.log(result)

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

    return (
        
        
        <div className="register-container">
            
            <div className="bg-container">
                <img src="nc-splash-new.jpg" alt="" />
            </div>

            <form className="register-form-container" onSubmit={handleDataSubmission}>
                <div className="back-to-login">
                    <a href="/">Back to login page.</a>
                </div>
                <div className="account-information" style={{gridTemplateRows: "1fr 1.9fr 1fr 1fr 1fr"}}>
                    <h2>Account Information</h2>
                    <div className="profile-container" style={{display:"flex"}}>
                        <div className="profile" style={{backgroundImage: `url('${preview}')`}}>
                            <label htmlFor="profile-pic" >
                                {!preview && <span>Add Profile Picture</span>}
                            </label>
                            <input type="file" name="profile-pic" id="profile-pic" onChange={handleImageChange} ref={fileInput} accept="image/*" hidden/>
                        </div>
                    </div>

                    <div className="textboxes">
                        <label htmlFor="email">Email Address <span className="required">*</span></label>
                        <input type="email" id="email" name="email" placeholder="Eg. johndoe@gmail.com" onInput={handleDataChange}/>
                    </div>

                    <div className="textboxes">
                        <label htmlFor="password">Password <span className="required">*</span></label>
                        <input type="password" id="password" name="password" placeholder="8 characters or more..."
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                        title="Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."
                        onInput={handleDataChange}/>
                    </div>

                    <div className="textboxes">
                        <label htmlFor="confirmpassword">Confirm Password <span className="required">*</span></label>
                        <input type="password" id="confirmpassword" name="confirmpassword" placeholder="8 characters or more"
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                        title="Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."/>
                    </div>
                </div>

                <div className="personal-information">
                    <h2>Personal Information</h2>
                    <div className="textboxes">
                        <label htmlFor="first_name">Given Name <span className="required">*</span></label>
                        <input type="first_name" id="first_name" name="first_name" placeholder="Eg. John" onInput={handleDataChange}/>
                    </div>
                    <div className="textboxes">
                        <label htmlFor="middle_name">Middle Name</label>
                        <input type="middle_name" id="middle_name" name="middle_name" placeholder="Eg. Craig" onInput={handleDataChange}/>
                    </div>
                    <div className="textboxes">
                        <label htmlFor="last_name">Last Name <span className="required">*</span></label>
                        <input type="last_name" id="last_name" name="last_name" placeholder="Eg. Doe" onInput={handleDataChange}/>
                    </div>
                    <div className="textboxes">
                        <label htmlFor="department">Department <span className="required">*</span></label>
                        <select name="department" id="department" onInput={handleDataChange}>
                            <option value="none">None</option>
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
                <div className="submit-container">
                    <input type="submit" value = "Register"/>
                </div>
            </form>
        </div>
    )
}

export default Register