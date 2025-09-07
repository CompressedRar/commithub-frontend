import { Navigate } from "react-router-dom"

function Logout(){
    localStorage.removeItem("token")
    return <Navigate to = "/"></Navigate>
}

export default Logout