import React, { useEffect, useState, useContext, act } from 'react'
import Chat from './Chat'
import Pane from './Pane'
import Friends from './Pages/Friends';
import Channel from './Pages/Channel';
import { BrowserRouter, Link, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import Settings from './Pages/Settings';
import Auth from './Auth/Auth';
import Home from './Static/Pages/Home';

const requester = async function (isApi, resourceUri, method, expectJson, body) {

    let URL = isApi ? 'http://localhost:443' + resourceUri : resourceUri
    let response;
    console.log(URL)
    try {
        let res = await fetch(URL, {
            method,
            credentials: isApi ? 'include' : 'omit',
            body: body ? JSON.stringify(body) : null,
            headers: {
                'content-type': 'application/json'
            }
        })
        if (expectJson) {
            let data = await res.json()
            if (data?.error == 'Unauthorized') {

            }
            response = data
        } else {
            response = res
        }


    } catch {
        response = { error: 'Fetch failed', status: 500 }
        console.error('Something went wrong, fetch to: "' + URL + '" Failed.')
    }
    return response
}
requester.isImgUrl = async function (url) {
    if (url?.includes('data:image/')) {
        return true
    }
    let external = fetch(url, { method: 'HEAD' }).then(res => {
        return res.headers.get('Content-Type').startsWith('image')
    }, error => {})

    return external
}
requester.extractUrls = function (str) {
    return str.split(' ').map(substr => {
        let url;
        
        try {
          url = new URL(substr);
          
          return substr
        } catch (_) {
          
          return;  
         
        }
    });
}
requester.testURL = function(str) {
        
        let url;
        
        try {
          url = new URL(str);
          console.log(str, true)
          return true
        } catch (_) {
            console.log(str, false)
          return false;  
         
        }
      
}

export const UserContext = React.createContext(null)
export const ModalService = React.createContext({})
export const RequestContext = React.createContext(requester)

export default function App() {


    return (


        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Bootstrapper />}>
                    <Route path='/' element={<Home />} />
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
    const requester = useContext(RequestContext)
    const [userData, setuserdata] = useState(null)
    const [loading, setLoading] = useState(false)
    const [modals, setModals] = useState([])

    function addModal(modal, callback) {

        let n = [...modals]
        n.push(modal);
        setModals(n)
    }
    function dismissModal() {
        let n = [...modals];
        n.shift();
        console.log(modals, n)
        setModals(n)
    }

    async function updateUserContext() {
        setLoading(false)
        let data = await requester(true, '/api/auth/self', 'GET', true)
        if (!data.error) {
            data.refresh = updateUserContext
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
            <ModalService.Provider value={{ modals, addModal, dismissModal }}>
                <UserContext.Provider value={userData}>

                    <Outlet></Outlet>
                    <ModalWindow modal={modals[0]} />
                </UserContext.Provider>
            </ModalService.Provider>
        )
    } else {
        return (
            <div className='bootstrapper' ><div className="loader"></div></div>
        )
    }

}

export class Modal {
    constructor(title, description, actions) {
        Object.assign(this, { title, description, actions });

        if (actions?.length == 0 || !actions) {
            this.actions = [new ModalAction('Close')]
        }
    }
}

export class ModalAction {
    constructor(label, callback, style) {
        Object.assign(this, { label, callback, style });

    }
}

function ModalWindow({ modal }) {
    if (!modal) {
        return
    }
    return (
        <div className='modal-outer'>
            <div className='modal'>
                <div className='title'>
                    {modal.title}
                </div>
                <div className='description'>
                    {modal.description}
                </div>
                <div className='action-bar'>
                    {modal.actions.map((a => (<ModalActionButton key={Math.random()} action={a}></ModalActionButton>)))}
                </div>

            </div>
        </div>

    )
}

function ModalActionButton({ action }) {
    let modalService = useContext(ModalService)
    if (action.callback == 'dismiss') {
        action.callback = modalService.dismissModal
    }
    return (
        <div className={`action-button ${action.style}`} onClick={() => { action.callback(modalService.dismissModal) }}>
            {action.label}
        </div>
    )
}