import './assets/styles/App.css'

import {Route ,Routes} from 'react-router-dom'

import AuthLayout from './layout/AuthLayout'
import Login from "./pages/Login"
import LoginPage from "./pages/LoginPage"
import Register from "./pages/Register"
import Administrator from './pages/Administrator'
import AdminLayout from './layout/AdminLayout'
import Logout from './components/Logout'
import Department from './pages/Department'
import UserManagement from './pages/UserManagement'
import CategoryAndTask from './pages/CategoryAndTask'
import AuditLogs from './pages/AuditLogs'
import FacultyLayout from './layout/FacultyLayout'
import Unauthorized from './pages/Unauthorized'
import Faculty from './pages/Faculty'
import HeadLayout from './layout/HeadLayout'
import HeadDepartment from './pages/HeadDepartment'
import PendingReviews from './components/DepartmentComponents/PendingReviews'
import PendingApprovals from './components/DepartmentComponents/PendingApprovals'
import PresPendingApprovals from './components/DepartmentComponents/PresPendingApprovals'
import PresPendingReviews from './components/DepartmentComponents/PresPendingReviews'
import HeadPendingReviews from './components/DepartmentComponents/HeadPendingReviews'
import PresidentLayout from './layout/PresidentLayout'
import MasterOPCR from './pages/MasterOPCR'
import Positions from './pages/Positions'
import NotFound from './pages/NotFound'
import SystemSettings from './pages/SystemSettings'
import OtherIPCR from './components/Faculty/OtherIPCR'
import OtherEditOPCR from './components/DepartmentComponents/OtherEditOPCR'
import OtherDraftedOPCR from './components/DepartmentComponents/OtherDraftedOPCR'
import Analytics from './pages/Analytics'
import ChangeForgotPassword from './pages/ChangeForgotPassword'


function App() {
  return (
    <div>
      <Routes>
        <Route path="*" element={<NotFound />} />

        <Route element = {<AuthLayout />}>
          <Route path='/' element = {<LoginPage></LoginPage>}></Route>
          <Route path='/forgot-password/:token' element = {<ChangeForgotPassword></ChangeForgotPassword>}></Route>
          <Route path='/register' element = {<Register></Register>}></Route>
          <Route path='/create' element = {<Register ></Register>}></Route>
          <Route path='/logout' element = {<Logout></Logout>}></Route>
        </Route>

        <Route element = {<AdminLayout></AdminLayout>}>
          <Route path = "/sadmin/dashboard" element={<Administrator></Administrator>}></Route>
          <Route path = "/sadmin/analytics" element={<Analytics></Analytics>}></Route>
          <Route path = "sadmin/department" element={<Department></Department>}></Route>
          <Route path = "/sadmin/users" element={<UserManagement></UserManagement>}></Route>
          <Route path = "/sadmin/tasks" element={<CategoryAndTask></CategoryAndTask>}></Route>
          <Route path = "/sadmin/logs" element={<AuditLogs></AuditLogs>}></Route>
          <Route path = "/sadmin/ipcr" element={<Faculty></Faculty>}></Route>
          <Route path = "/sadmin/ipcr/:ipcr_id" element={<OtherIPCR></OtherIPCR>}></Route>
          <Route path = "/sadmin/opcr/:opcr_id" element={<OtherEditOPCR></OtherEditOPCR>}></Route>
          <Route path = "/sadmin/drafted/:opcr_id" element={<OtherDraftedOPCR></OtherDraftedOPCR>}></Route>
          <Route path = "/sadmin/review" element={<PresPendingReviews></PresPendingReviews>}></Route>
          <Route path = "/sadmin/approve" element={<PresPendingApprovals></PresPendingApprovals>}></Route>
          <Route path = "/sadmin/master" element={<MasterOPCR></MasterOPCR>}></Route>
          <Route path = "/sadmin/positions" element={<Positions></Positions>}></Route>
          <Route path = "/sadmin/settings" element={<SystemSettings></SystemSettings>}></Route>
        </Route>

        <Route element = {<PresidentLayout></PresidentLayout>}>
          <Route path = "/ad/dashboard" element={<Administrator></Administrator>}></Route>
          <Route path = "/ad/analytics" element={<Analytics></Analytics>}></Route>
          <Route path = "/ad/department" element={<Department></Department>}></Route>
          <Route path = "/ad/tasks" element={<CategoryAndTask></CategoryAndTask>}></Route>
          <Route path = "/ad/ipcr" element={<Faculty></Faculty>}></Route>
          <Route path = "/ad/review" element={<PresPendingReviews></PresPendingReviews>}></Route>
          <Route path = "/ad/approve" element={<PresPendingApprovals></PresPendingApprovals>}></Route>
          <Route path = "/ad/master" element={<MasterOPCR></MasterOPCR>}></Route>
        </Route>

        <Route element = {<HeadLayout></HeadLayout>}>
          <Route path = "/head/ipcr/:ipcr_id" element={<OtherIPCR></OtherIPCR>}></Route>
          <Route path = "/head/opcr/:opcr_id" element={<OtherEditOPCR></OtherEditOPCR>}></Route>
          <Route path = "/head/drafted/:opcr_id" element={<OtherDraftedOPCR></OtherDraftedOPCR>}></Route>
          <Route path = "/head/department" element={<HeadDepartment></HeadDepartment>}></Route>
          <Route path = "/head/analytics" element={<Analytics></Analytics>}></Route>
          <Route path = "/head/tasks" element={<CategoryAndTask></CategoryAndTask>}></Route>
          <Route path = "/head/review" element={<HeadPendingReviews></HeadPendingReviews>}></Route>
          <Route path = "/head/ipcr" element={<Faculty></Faculty>}></Route>
        </Route>

        <Route element = {<FacultyLayout></FacultyLayout>}>
          <Route path = "/faculty/ipcr" element={<Faculty></Faculty>}></Route>
        </Route>

        <Route path = "/unauthorized" element={<Unauthorized></Unauthorized>}></Route>

      </Routes>
    </div>
  )
}

export default App
