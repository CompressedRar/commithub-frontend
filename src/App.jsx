import { useState } from 'react'

import './assets/styles/App.css'

import {Route ,Routes} from 'react-router-dom'

import AuthLayout from './layout/AuthLayout'
import Login from "./pages/Login"
import Register from "./pages/Register"

function App() {
  return (
    <div>
      <Routes element = {<AuthLayout />}>
        <Route path='/' element = {<Login></Login>}></Route>
        <Route path='/register' element = {<Register></Register>}></Route>
      </Routes>

      
    </div>
  )
}

export default App
