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
          <Route path = "/dashboard" element={<Administrator></Administrator>}></Route>
          <Route path = "/department" element={<Department></Department>}></Route>
          <Route path = "/users" element={<UserManagement></UserManagement>}></Route>
          <Route path = "/tasks" element={<CategoryAndTask></CategoryAndTask>}></Route>
          <Route path = "/logs" element={<AuditLogs></AuditLogs>}></Route>
        </Route>

      </Routes>
    </div>
  )
}

export default App
