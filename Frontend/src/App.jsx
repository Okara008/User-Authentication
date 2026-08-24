import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router'
import './App.css'
import Profile from './pages/Profile.jsx'
import Admin from './pages/Admin.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'

const App = () => {
return(<>
    <BrowserRouter>
		<Routes>
			<Route path='/' element={<Signup/>}/>
			<Route path='/login' element={<Login/>}/>
			<Route path='/Profile' element={<Profile/>}/>
			<Route path='/Admin' element={<Admin/>}/>
		</Routes>
    </BrowserRouter>
</>)
}

export default App
