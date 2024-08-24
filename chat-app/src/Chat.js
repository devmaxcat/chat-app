// This is once the user has been authorized, nothing useful to a do-wronger can be found here so its okay to be on the client.
import { React, createContext, useContext, useEffect, useState } from 'react'
import { RequestContext, UserContext } from "./App";
import Sidebar from './Sidebar/Sidebar';
import Pane from './Pane';
import ProfileDrop from './ProfileDrop'
import { Link, useLocation } from 'react-router-dom';
import Call from './Call';
import { io } from "socket.io-client";
export const ClientContext = createContext(null)
export const ChannelsContext = createContext(null)
export const FriendsContext = createContext(null)
export const AlertContext = createContext([])

function setActivityStatus(statusType) {
    fetch('http://localhost:443/api/profile/status', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ statusType })
    })
}



export class Alert {
    constructor(severity, message, title, timeout, actions, behavior, priority, icon) {
        this.id = Math.random().toString(36).slice(2, 9) + new Date().getTime().toString(36);
        this.message = message
        this.title = title
        this.severity = severity
        this.priority = priority
        this.timeout = timeout
        this.actions = actions || []
        this.behavior = behavior
        this.icon = icon
        // 0 = can be dismissed, will auto dismiss if there is a timeout
        // 1 = cannot be dismissed until after timeout has expired
        // 2 = cannot be dismissed by user (use case: make the user choose an action or show while disconnected from server)
        return this
    }


}

export class AlertAction {
    constructor(type, func, text) {
        this.type = type || 'primary' // changes appearance of button
        this.callback = func // what should happen when user clicks button
        this.text = text
    }
}

export default function Chat() {
    const requester = useContext(RequestContext)
    const user = useContext(UserContext)
    const location = useLocation()
    const [channels, setChannels] = useState([])
    const [friendRequests, setFriendRequests] = useState([])
    const [client, setClient] = useState(null)
    const [alerts, setAlerts] = useState([])

    function alert(alert) {
        let newArray = [alert, ...alerts]
        newArray.sort((a, b) => a.priority < b.priority)
        setAlerts(newArray)
        return alert.id
    }
    function dismiss(alert) { // alert object or alert id
        if (typeof alert === 'string') {
            alert = { id: alert }
        }
        //alert.dismissed = true
        console.log(alerts, alert, alert.id)
        setAlerts(alerts.filter((e) => {
            console.log(e.id, alert.id, e.id != alert.id);
            return e.id != alert.id
        }))
        //setAlerts(alerts)
    }

    useEffect(() => {


        const socket = io.connect('http://localhost:443', {
            withCredentials: true,
            transports: ['websocket']

        });
        console.log(socket)

        const client = socket

        if (client) {
            let disconnectedAlert;
            function onConnect() {
                console.log('Connected');
                if (disconnectedAlert) dismiss(disconnectedAlert)
                setClient(socket)
            }
            function onDisconnect(reason) {
                //setActivityStatus(0)
                console.log('Disconnected from the server: ' + reason); // reload application
                disconnectedAlert = alert(new Alert('error', 'Lost connection to the server. Things may not work as expected', 'DISCONNECTED', 0, [new AlertAction('primary', () => window.location.reload(), 'Reload')], 3, 100, 'fa-solid fa-plug-circle-exclamation'))

            }

            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);

            return () => {
                socket.off('connect', onConnect);
                socket.off('disconnect', onDisconnect);

            };
        }
        setClient(socket)

    }, [])

    useEffect(() => {
        if (!client) { return }
        async function refreshChannels() {
            setActivityStatus(1)
            let data = await requester(true, '/api/channel/get', 'GET', true)

            if (!data.error) {
                data.refresh = refreshChannels
                setChannels(data)
            } else {
                setChannels(null)
            }
        }
        async function refreshFriends() {
            let data = await requester(true, '/api/friend/get', 'GET', true)

            if (!data.error) {
                data.refresh = refreshFriends
                data.send = async function (to, useid) {
                    console.log(to)
                    let data = await requester(true, '/api/friend/create', 'POST', true, { to: to, useid })
                    if (!data.error) {
                      
                        return {}
                    } else {
                        return data
                    }
                }
                data.remove = async function (userId) {
                    let data = await requester(true, '/api/friend/unfriend', 'POST', true, { userId })
                    if (!data.error) {
                       
                        return {}
                    } else {
                        return data
                    }
                }
                data.respond = async function (id, status) {
                    let data = await requester(true, '/api/friend/respond', 'POST', true, { id, status })
                    if (!data.error) {
                       
                        return {}
                    } else {
                        return data
                    }
                }
                data.isFriends = function (otherid) {
                    let result = data.find((e) => ((e.from?._id == user?._id && e.to?._id == otherid) || (e.to?._id == user._id && e.from?._id == otherid)))
                    if (result && result.status == 1) {
                        return { isfriends: true, result }
                    } else {
                        return { isfriends: false, result }
                    }
                }
                setFriendRequests(data)
            } else {
                //alerts.alert(new Alert('error', data.error, data.message))
            }

        }
        refreshChannels()
        refreshFriends()
        client.on('FriendRequest', refreshFriends)
      
        return () => {
            client.off('FriendRequest', refreshFriends)
           

        }
    }, [location, client])

    if (!(client && friendRequests && friendRequests.isFriends && channels)) {
        return
    }

    return (
        <ClientContext.Provider value={client}>
            <ChannelsContext.Provider value={channels}>
                <FriendsContext.Provider value={friendRequests}>
                    <AlertContext.Provider value={{ alerts, alert, dismiss, Alert, AlertAction }}>
                        <div id='app-outer'>
                            <div className='alerts-container'>
                                {alerts.slice(0, 3).map((e) => <Alerts key={e.id} alert={e}></Alerts>)}
                            </div>

                            <div id='topbar'>
                                <div className='logo animated'><a>C</a><a>h</a><a>a</a><a>t</a> <a>A</a><a>p</a><a>p</a>
                                </div>
                                <div className='topbar-right'>
                                    <Link className="fa-solid fa-gear i-link settings" to={'/me/settings'}></Link>
                                    <ProfileDrop></ProfileDrop>

                                </div>

                            </div>
                            <div id='chat'>
                                <Call></Call>

                                <Sidebar></Sidebar>
                                <Pane></Pane>


                            </div>
                        </div>
                    </AlertContext.Provider>
                </FriendsContext.Provider>
            </ChannelsContext.Provider>
        </ClientContext.Provider>
    )
}

function Alerts({ alert }) {
    const alertsContext = useContext(AlertContext)

    return (
        <div className={`alert ${alert.severity} ${alert?.dismissed ? 'dismissed' : ''}`}>

            <div className='left'>
                <i className={alert.icon}></i>
                <div>

                    <div className='title'>
                        {alert.title}
                    </div>

                    {alert.message}
                </div>
            </div>

            <div className='right'>
                <div className='action-bar'>
                    {alert.actions.map((e, i) => (
                        <button key={alert.id + i} className={`action-button ${e.type == 'secondary' ? 'secondary' : ''}`} onClick={() => { e.callback(alert.id) }}>{e.text}</button>
                    ))}
                </div>
                <div className='dismiss'>
                    {alert.behavior !== 3 ? <i className='fa-solid fa-x' onClick={() => { alertsContext.dismiss(alert) }}></i> : ''}
                </div>
            </div>

        </div>

    )
}


