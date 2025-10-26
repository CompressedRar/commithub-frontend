import { useState } from 'react'

import './assets/styles/App.css'

import {Route ,Routes} from 'react-router-dom'

import AuthLayout from './layout/AuthLayout'
import Login from "./pages/Login"
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
import NotFound from './pages/NotFound'



function App() {
  return (
    <div>
      <Routes>
        <Route path="*" element={<NotFound />} />
        
        <Route element = {<AuthLayout />}>
          <Route path='/' element = {<Login></Login>}></Route>
          <Route path='/register' element = {<Register></Register>}></Route>
          <Route path='/create' element = {<Register ></Register>}></Route>
          <Route path='/logout' element = {<Logout></Logout>}></Route>  
        </Route>
      
        <Route element = {<AdminLayout></AdminLayout>}>
          <Route path = "/admin/dashboard" element={<Administrator></Administrator>}></Route>
          <Route path = "admin/department" element={<Department></Department>}></Route>
          <Route path = "/admin/users" element={<UserManagement></UserManagement>}></Route>
          <Route path = "/admin/tasks" element={<CategoryAndTask></CategoryAndTask>}></Route>
          <Route path = "/admin/logs" element={<AuditLogs></AuditLogs>}></Route>
          <Route path = "/admin/ipcr" element={<Faculty></Faculty>}></Route>
          <Route path = "/admin/review" element={<PresPendingReviews></PresPendingReviews>}></Route>
          <Route path = "/admin/approve" element={<PresPendingApprovals></PresPendingApprovals>}></Route>
          <Route path = "/admin/master" element={<MasterOPCR></MasterOPCR>}></Route>
        </Route>

        <Route element = {<PresidentLayout></PresidentLayout>}>
          <Route path = "/president/dashboard" element={<Administrator></Administrator>}></Route>
          <Route path = "/president/department" element={<Department></Department>}></Route>
          <Route path = "/president/tasks" element={<CategoryAndTask></CategoryAndTask>}></Route>
          <Route path = "/president/ipcr" element={<Faculty></Faculty>}></Route>
          <Route path = "/president/review" element={<PresPendingReviews></PresPendingReviews>}></Route>
          <Route path = "/president/approve" element={<PresPendingApprovals></PresPendingApprovals>}></Route>
          <Route path = "/president/master" element={<MasterOPCR></MasterOPCR>}></Route>
        </Route>

        <Route element = {<HeadLayout></HeadLayout>}>
          <Route path = "/head/department" element={<HeadDepartment></HeadDepartment>}></Route>
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
