import { Navigate } from "react-router-dom"

function ProtectedRoute({children}){
    const token = localStorage.getItem("token")
    token? {children}: <Navigate to="/"></Navigate>
}

export default ProtectedRoute