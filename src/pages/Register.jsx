import { useEffect } from "react"
import "../assets/styles/Register.css"


function Register(){
    return (
        <div className="register-container">
            <div className="bg-container">
                <img src="nc-splash-new.jpg" alt="" />
            </div>

            <form className="register-form-container">
                <div className="back-to-login">
                    <a href="/">Back to login page.</a>
                </div>
                <div className="account-information" style={{gridTemplateRows: "1fr 1.9fr 1fr 1fr 1fr"}}>
                    <h2>Account Information</h2>
                    <div className="profile-container" style={{display:"flex"}}>
                        <div className="profile">
                            <img src="" alt="" />
                            <label htmlFor="profile-pic">
                                <span>Add</span>
                                <span>Profile</span>
                                <span>Picture</span>
                            </label>
                            <input type="file" name="profile-pic" id="profile-pic" hidden/>
                        </div>
                    </div>

                    <div className="textboxes">
                        <label htmlFor="email-address">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="Eg. johndoe@gmail.com"/>
                    </div>

                    <div className="textboxes">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="8 characters or more..."
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                        title="Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."/>
                    </div>

                    <div className="textboxes">
                        <label htmlFor="confirmpassword">Confirm Password</label>
                        <input type="password" id="confirmpassword" name="confirmpassword" placeholder="8 characters or more"
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                        title="Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."/>
                    </div>

                    





                </div>

                <div className="personal-information">
                    <h2>Personal Information</h2>
                    <div className="textboxes">
                        <label htmlFor="email-address">Given Name</label>
                        <input type="email" id="email" name="email" placeholder="Eg. johndoe@gmail.com"/>
                    </div>
                    <div className="textboxes">
                        <label htmlFor="email-address">Middle Name</label>
                        <input type="email" id="email" name="email" placeholder="Eg. johndoe@gmail.com"/>
                    </div>
                    <div className="textboxes">
                        <label htmlFor="email-address">Last Name</label>
                        <input type="email" id="email" name="email" placeholder="Eg. johndoe@gmail.com"/>
                    </div>
                    <div className="textboxes">
                        <label htmlFor="department">Department</label>
                        <select name="department" id="department">
                            <option value="none">None</option>
                            <option value="computing_studies">College of Computing Studies</option>
                            <option value="education">College of Education</option>
                            <option value="hospitality_management">College of Hospitality Management</option>
                            <option value="administrative">Administrative Office</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>

                    <div className="textboxes">
                        <label htmlFor="position">Position</label>
                        <select name="position" id="position">
                            <option value="none">None</option>
                            
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