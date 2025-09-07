import { useEffect, useState } from "react";
import { authenticateAccount } from "../services/userService";
import { objectToFormData } from "../components/api";
import Swal from "sweetalert2";
import "../assets/styles/Login.css"
import { Navigate } from "react-router-dom";

function Login(){

    const [loginFormData, setLoginFormData] = useState({"email": "", "password":""})
    const [showPassword, setShowPassword] = useState(false)

    useEffect(()=> {
        console.log(loginFormData)
    }, [loginFormData])

    useEffect(()=> {
        //console.log(showPassword)
    }, [showPassword])

    const handleSubmission = async (e) => {
        e.preventDefault()

        
        var convertedData = objectToFormData(loginFormData)
        console.log(convertedData)
        var a = await authenticateAccount(convertedData)

        if(a.data.message == "Authenticated.") {
            localStorage.setItem("token", a.data.token)
            window.location.href = "/admin"
        }
        else {
            Swal.fire({
                title:"Error",
                text: a.data.message,
                icon:"error"
            })
        }

    }

    const handleDataChange = (e) => {
        setLoginFormData({...loginFormData, [e.target.name]: e.target.value})
    }



    return (
        <div className="login-container">
            
            
            <div className="splash-container">
                <img src="nc-splash-new.jpg" alt="" />
                
            </div>
            <div className="login-form-container">
                <span className="logo-slogan">
                    <img src="CommitHub.png" alt="" />
                    
                </span>
                <div className="slogan-container">                    
                    <span style={{fontSize: "2rem"}}>Login to</span>
                    <span>CommitHub</span>
                </div>
                <form action="/" onSubmit={handleSubmission} className="login-form" method="POST">
                    <div className="textboxes">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="johndoe@gmail.com" required
                        onInput={handleDataChange}/>
                    </div>
                    <div className="textboxes">
                        <label htmlFor="password">Password</label>
                        <input type={showPassword? "text": "password"} id="password" name="password" placeholder="Password" required
                        onInput={handleDataChange}/>
                        <span ></span>
                    </div>
                    <div className="tools">
                        <span className="show-password" >
                            <input type="checkbox" id = "showpass" onClick={()=>{setShowPassword(!showPassword)}}/>
                            <label htmlFor="showpass" >Show Password</label>
                        </span>
                        <span className="forgot-password">
                            <a htmlFor="forgotpass">Forgot Password</a>
                        </span>
                    </div>

                    <input type="submit" value={"Login"}/>
                </form>
                    
                <div className="register-container-link">
                    <span>
                        Don't have an account? <a href="/register">Click Here.</a>
                    </span>
                </div>
            </div>

        </div>
    )
}

export default Login