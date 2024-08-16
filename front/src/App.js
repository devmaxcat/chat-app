import React, { useEffect, useState, useContext, act } from 'react'
import Chat from './Chat'
import Pane from './Pane'
import Friends from './Pages/Friends';
import Channel from './Pages/Channel';
import { BrowserRouter, Link, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import Settings from './Pages/Settings';
import Auth from './Auth/Auth';
export const UserContext = React.createContext(null)

export default function App() {

    return (
        
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Bootstrapper />}>
                    <Route path='login' element={<Auth />} />
                    <Route path='register' element={<Auth />} />
                    <Route path="/me" element={<Chat />}>
                        <Route index element={<Friends />} />
                        <Route path="friends" element={<Friends />} />
                        <Route path="channel/:channelid" element={<Channel />} />
                        <Route path='settings/:specify' element={<Settings />} />
                        <Route path='settings' element={<Settings />} />

                    </Route>

                </Route>

            </Routes>
        </BrowserRouter>



    )
}

function Bootstrapper() { // Ensures the client has accurate data from the server, otherwise the application might compare certain values wrong.
    const navigate = useNavigate()
    const location = useLocation()

    const [userData, setuserdata] = useState(null)
    const [loading, setLoading] = useState(false)

    async function updateUserContext() {
        setLoading(false)
        let res = await fetch('http://localhost:443/api/auth/self', {
            method: 'GET',
            credentials: 'include'
        })
        let data = await res.json()

        if (!data.error) {
            data.refreshUser = updateUserContext
            setuserdata(data)
        } else if (data.error == 'Unauthorized') {

            setuserdata({ error: 'Unauthorized', refreshUser: updateUserContext })
        }
        setLoading(true)

    }

    useEffect(() => {
        updateUserContext()
    }, [])

    if (location.pathname.includes('/me') && userData?.error) {
        navigate('/login')
    }
    if (loading) {
        return (
            <UserContext.Provider value={userData}>
                <Outlet></Outlet>
            </UserContext.Provider>

        )
    } else {
        return (

            <div className='bootstrapper' ><div className="loader"></div></div>


        )
    }

}







const dquery = function (query) {
    return document.querySelector(query)
}