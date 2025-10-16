
import { Outlet , useLocation} from "react-router-dom";

function AuthLayout({children}){
    const location = useLocation();
  console.log("AuthLayout active, current route:", location.pathname);
    return (
        <div>
            <Outlet />
        </div>
    )
}

export default AuthLayout