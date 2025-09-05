import { useEffect } from "react";
import "../assets/styles/Login.css"

function Login(){
    return (
        <div className="login-container">
            
            <img src="nc-splash.png" alt="" id="splash"/>
            <div className="splash-container">
                
            </div>

            <div className="login-form-container">
                <span className="logo-slogan">
                    <img src="CommitHub.png" alt="" />
                                         
                </span>
                <div className="slogan-container">                    
                    <span style={{fontSize: "2rem"}}>Login to</span>
                    <span>CommitHub</span>
                </div>
                <form action="" className="login-form" method="POST">
                    <div className="textboxes">
                        <label htmlFor="email-address">Email Address</label>
                        <input type="email" id="email-address" name="password" placeholder="johndoe@gmail.com"/>
                    </div>
                    <div className="textboxes">
                        <label htmlFor="email-address">Password</label>
                        <input type="password" id="password" name="password" placeholder="Password"/>
                    </div>
                    <div className="tools">
                        <span className="show-password">
                            <input type="checkbox" id = "showpass"/>
                            <label htmlFor="showpass">Show Password</label>
                        </span>
                        <span className="forgot-password">
                            <a htmlFor="forgotpass">Forgot Password</a>
                        </span>
                    </div>

                    <input type="submit" value={"Login"}/>
                </form>
                
                <div className="register-container">
                    <span>
                        Don't have an account? <a href="">Click Here.</a>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Login