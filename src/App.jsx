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
import EditIPCR from './components/Faculty/EditIPCR'


function App() {
  return (
    <div>
      <Routes>
        
        <Route element = {<AuthLayout />}>
          <Route path='/' element = {<Login></Login>}></Route>
          <Route path='/register' element = {<Register></Register>}></Route>
          <Route path='/create' element = {<Register admin = {true}></Register>}></Route>
          <Route path='/logout' element = {<Logout></Logout>}></Route>  
        </Route>
      
        <Route element = {<AdminLayout></AdminLayout>}>
          <Route path = "/admin/dashboard" element={<Administrator></Administrator>}></Route>
          <Route path = "admin/department" element={<Department></Department>}></Route>
          <Route path = "/admin/users" element={<UserManagement></UserManagement>}></Route>
          <Route path = "/admin/tasks" element={<CategoryAndTask></CategoryAndTask>}></Route>
          <Route path = "/admin/logs" element={<AuditLogs></AuditLogs>}></Route>
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
