import "../assets/styles/UserManagement.css"
import MemberTable from "../components/UsersComponents/MemberTable";

function UserManagement(){
    return (
        <div className="user-management">
            <MemberTable></MemberTable>
        </div>
    )
}
 
export default UserManagement