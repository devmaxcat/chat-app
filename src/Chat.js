// This is once the user has been authorized, nothing useful to a do-wronger can be found here so its okay to be on the client.
import { React, createContext, useContext, useEffect, useState, createPortal } from 'react'

import ReactDOM from 'react-dom';

import { RequestContext, UserContext } from "./App";
import Sidebar from './Sidebar/Sidebar';
import Pane from './Pane';
import ProfileDrop from './ProfileDrop'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Call from './Call';
import { io } from "socket.io-client";
import moment from 'moment';
import ProfilePicture, { getAvatarFromUser } from './Shared/ProfilePicture';
import useContextMenu from './Shared/ContextMenu/useContextMenu';
import UserContextMenu from './Shared/ContextMenu/UserContextMenu';
import ActivityIcon from './Profile/ActivityIcon';
export const ClientContext = createContext(null)
export const ChannelsContext = createContext(null)
export const FriendsContext = createContext(null)
export const AlertContext = createContext([])
export const ProfileViewerContext = createContext({})

function setActivityStatus(statusType, user) {
    if (user?.status?.type == -1) {
        return
    }
    fetch(`${process.env.REACT_APP_API_URI}/api/profile/status`, {
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
    console.log('chat render')
    const requester = useContext(RequestContext)
    const navigate = useNavigate()
    const user = useContext(UserContext)
    const location = useLocation()
    const [channels, setChannels] = useState([])
    const [friendRequests, setFriendRequests] = useState([])
    const [client, setClient] = useState(null)
    const [alerts, setAlerts] = useState([])
    const [profileViewer, setProfileViewer] = useState({
        current: null,
        open(user) {
            let me = { ...profileViewer }
            me.current = user
            setProfileViewer(me)
        },
        close() {
            let me = { ...profileViewer }
            me.current = null
            setProfileViewer(me)
        }
    })

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

        setAlerts(alerts.filter((e) => {

            return e.id != alert.id
        }))
        //setAlerts(alerts)
    }

    useEffect(() => {


        const socket = io.connect(process.env.REACT_APP_API_URI, {
            withCredentials: true,
            transports: ['websocket']

        });


        const client = socket

        if (client) {
            let disconnectedAlert;
            function onConnect() {

                if (disconnectedAlert) dismiss(disconnectedAlert)
                setClient(socket)
            }
            function onDisconnect(reason) {
                //setActivityStatus(0)

                disconnectedAlert = alert(new Alert('error', 'Lost connection to the server. Things may not work as expected', 'DISCONNECTED', 0, [new AlertAction('primary', () => window.location.reload(), 'Reload')], 3, 100, 'fa-solid fa-plug-circle-exclamation'))

            }
            function onServerException(error) {

                if (error.redirect) {
                    navigate(error.redirect)
                }
            }
            socket.on('ExceptionOccurred', onServerException);
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
        let cachedMessages = {}
        async function refreshChannels() {
            
            console.trace('MSC REFRESHING CHANNELS')
        
           
            // setActivityStatus(1, user)
            let data = await requester(true, '/api/channel/get', 'GET', true)

            if (!data.error) {
                data.refresh = refreshChannels
                data.changeChannelName = async function (channelid, name, callback) {

                    let data = await requester(true, '/api/channel/update', 'POST', true, {
                        channelid: channelid,
                        name: name
                    })
                    if (!data.error) {

                        if (callback) { callback(data) }

                    }

                }
                data.getMessages = async function (channelid, limit, offset) {
                    console.log('MSC check', cachedMessages, cachedMessages[channelid], channelid)
                    if (cachedMessages[channelid]) {
                 
                        if (new Date().getTime() - cachedMessages[channelid].timestamp < 1000 * 60 * 5) {
                        console.log('MSC RETRIEVED MESSAGES FROM CACHE', cachedMessages[channelid].msgs.msg)
                        return cachedMessages[channelid].msgs
                        }
                    }
                    let msgs = await requester(true, '/api/message/history?' + new URLSearchParams({ channelid, limit, offset }), 'GET', true)
                    console.log(msgs)
                    if (!msgs.error) {

                        data.addCachedMessages(channelid, msgs)
                        return msgs
                    } else {
                        return null
                    }
                }
                data.addCachedMessages = function (channelid, msgs) {
                    console.log('MSC ADDING MESSAGES TO CACHE', msgs);
                    if (!cachedMessages[channelid]) {
                        cachedMessages[channelid] = { msgs: [], timestamp: new Date().getTime() };
                    }
                
                    // Combine the cached messages and new messages, then filter out duplicates
                    const combinedMsgs = [...cachedMessages[channelid].msgs, ...msgs];
                    const uniqueMsgs = combinedMsgs.filter((e, i, a) => a.findIndex((ee) => ee._id == e._id) === i);
                
                    // Sort the messages by createdAt
                    const sortedMsgs = uniqueMsgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                    // Update the cache with the filtered and sorted messages
                    cachedMessages[channelid] = {
                        msgs: sortedMsgs,
                        timestamp: new Date().getTime()
                    };
                };
                data.messageRecieved = function (msg) {
                    data.find(e => e._id == msg.channel_id).lastMessage = msg
                    data.addCachedMessages(msg.channel_id, [msg])
                    setChannels(data)
                    
                }
                data.messagedChanged = function (msg) { }
                data.messagedDeleted = function (msg) { }

                data.leave = async function name(channelid, callback) {
                    let data = await requester(true, '/api/channel/leave', 'POST', true, { channelid })

                    if (!data.error) {

                        if (location.pathname.includes(channelid)) navigate('/me/friends')
                        if (callback) { callback(data) }

                    }
                }
                client.on('MessageRecieved', data.messageRecieved)
                setChannels(data)
            } else {
                setChannels(null)
            }
            return data
        }
        async function refreshFriends() {
            let data = await requester(true, '/api/friend/get', 'GET', true)

            if (!data.error) {
                data.refresh = () => { refreshFriends(); refreshChannels() }
                data.send = async function (to, useid) {

                    let data = await requester(true, '/api/friend/create', 'POST', true, { to: to, useid })
                    if (!data.error) {

                        return {}
                    } else {
                        return data
                    }
                }
                data.asFriendsList = function () { // returns array of user objects that are 100% the current user's friends.
                    let acceptedFriendRequests = data.filter((e) => e.status == 1)
                    let actualFriends = acceptedFriendRequests.flatMap(({ to, from }) => [to, from]).filter(u => u._id !== user._id);
                    return actualFriends
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
                data.getKnownUserById = function (id) {
                    let result = data.find((e) => e.to?._id == id || e.from?._id == id)
                    if (result) {
                        return result.to?._id == id ? result.to : result.from
                    } else {
                        return null
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
            return data
        }
        refreshChannels()
        refreshFriends()
        // function updateChannelOrder(msg) {
        //     let n = [...channels]
        //     let f = n.find(e => e._id == msg.channel_id)
        //     let nn = n.filter(e => e !== f)
        //     nn.unshift(f)
        //     setChannels(nn)
        // }
        //client.on('MessageRecieved', updateChannelOrder)
        let notif;
        client.on('FriendRequest', refreshFriends)
        client.on('ChannelUpdate', refreshChannels)

        const activity = setInterval(() => {
            setActivityStatus(1, user)
            // if window is not focused, set status to away
            if (document.hidden) {
                setActivityStatus(2, user)
            }
        }, 1000 * 60 * .1)

        //client.on('MessageChanged', )


        return () => {
            clearInterval(activity)
            client.off('FriendRequest', refreshFriends)
            client.off('ChannelUpdate', refreshChannels)
            // client.off('MessageRecieved', refreshChannels)

        }

    }, [client]) // location?



    if (!(client && friendRequests && friendRequests.isFriends && channels && channels.refresh)) {
        return (
            <div className='bootstrapper' ><div className="loader-2"></div></div>
        )

    }





    return (
        <ClientContext.Provider value={client}>
            <ChannelsContext.Provider value={channels}>
                <FriendsContext.Provider value={friendRequests}>
                    <ProfileViewerContext.Provider value={profileViewer}>
                        <AlertContext.Provider value={{ alerts, alert, dismiss, Alert, AlertAction }}>
                            <NotificationHandler />
                            <div id='app-outer'>
                                <ProfileViewer></ProfileViewer>
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


                                    <Sidebar></Sidebar>
                                    <Pane></Pane>


                                </div>
                            </div>
                        </AlertContext.Provider>
                    </ProfileViewerContext.Provider>
                </FriendsContext.Provider>
            </ChannelsContext.Provider>
        </ClientContext.Provider>
    )
}

function NotificationHandler() {
    const client = useContext(ClientContext)
    const channels = useContext(ChannelsContext)
    const user = useContext(UserContext)
    useEffect(() => {
        let notif;
        function MessageNotification(data) {
            if (data.author._id != user._id) {
                if (document.hidden) {
                    let notifmsc = channels.find(e => e._id == data.channel_id)

                    if (notif) notif.close();
                    notif = new Notification(notifmsc.type == 0 ? data.author.username : data.author.username + ' | ' + notifmsc.name, { body: data.text_content, requireInteraction: false, icon: getAvatarFromUser(data.author) })

                }

            }
        }
        client.on('MessageRecieved', MessageNotification)
        return () => {
            client.off('MessageRecieved', MessageNotification)
        }

    }, [channels, client])
    return (<></>)
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

function ProfileViewer() {
    let Viewer = useContext(ProfileViewerContext)
    let { handleClick, context } = useContextMenu()

    // this might be updated to accept a user object, then fetch request more info about that particular user
    if (!Viewer.current) {
        return
    }
    let user = Viewer.current
    return (
        <div className='profile-viewer'>
            <div class="profile">
                <div className='top-right-actions' >
                    <i className='action-circle fa-solid fa-ellipsis' onClick={handleClick()}></i>
                    {ReactDOM.createPortal(<UserContextMenu context={context} user={Viewer.current}></UserContextMenu>, document.querySelector('body'))}

                    <i className='action-circle fa-solid fa-x' onClick={Viewer.close}></i>

                </div>

                <div class="bg-img">
                    <img src="https://i0.wp.com/static.vecteezy.com/system/resources/previews/006/852/804/non_2x/abstract-blue-background-simple-design-for-your-website-free-vector.jpg?ssl=1" />

                </div>
                <div class="top">
                    <div class=" pfp">
                        <ProfilePicture entity={user}></ProfilePicture>
                        <ActivityIcon user={user}></ActivityIcon>


                    </div>
                    <div class="name">
                        <div class="display-name">{user.displayName}</div>
                        <div class="username">{user.username}</div>
                    </div>
                </div>
                {user.bio ? (<>
                    <h4>About</h4>
                    <div className='bio'>
                        {user.bio}
                    </div>
                </>) : ''}
                <div>
                    <div>
                        <h5>Date Joined</h5>{moment(user.createdAt).format('LL')}
                    </div>
                </div>
            </div>

        </div>

    )
}


