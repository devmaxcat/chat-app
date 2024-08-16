import React, { useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ClientContext, Alert, AlertContext } from '../Chat'
import { UserContext } from '../App'

export default function Friends() {
    const [friendReqs, setFriendReqs] = useState([])
    const friendRequestReference = useRef(friendReqs)
    const client = useContext(ClientContext)
    const location = useLocation()
    const userData = useContext(UserContext)
    const alerts = useContext(AlertContext)
    const navigate = useNavigate()
    const [filter, setFilter] = useState('AllFriends')

    useEffect(() => { friendRequestReference.current = friendReqs }, [friendReqs])
    useEffect(() => {
        function refresh(data) {
            console.log('friend req', data)
            fetch('http://localhost:443/api/friend/get', {
                headers: {
                    'content-type': 'application/json'
                },
                method: 'GET',
                credentials: 'include',
            })
                .then((res) => res.json())
                .then((data) => {


                    if (!data.error) {
                        setFriendReqs(data)
                    } else {
                        alerts.alert(new Alert('error', data.error, data.message))
                    }
                })
        }
        refresh()


        client.on('FriendRequestRecieved', refresh)
        
        return () => {
            client.off('FriendRequestRecieved', refresh)
            
        }
    }, [client, location])





    let filteredList;
    let AllFriends = friendReqs.filter((e) => e.status == 1);
    let Pending = friendReqs.filter((e) => e.status == 0 && e.from._id == userData._id)
    let Requests = friendReqs.filter((e) => e.status == 0 && e.from._id != userData._id)
    if (filter === 'AllFriends') {
        filteredList = AllFriends
    } else if (filter === 'Pending') {
        filteredList = Pending

    } else if (filter === 'Requests') {
        filteredList = Requests
    }
    else {
        filteredList = []
    }

    return (
        <div>
            <h1>Friends</h1>
            <div className='filter-tabs'>
                <div onClick={() => setFilter('AllFriends')} className={`tab ${filter == 'AllFriends' ? 'selected' : ''}`}>All ({AllFriends.length})</div>
                <div onClick={() => setFilter('Requests')} className={`tab ${filter == 'Requests' ? 'selected' : ''}`}>Requests ({Requests.length})</div>
                <div onClick={() => setFilter('Pending')} className={`tab ${filter == 'Pending' ? 'selected' : ''}`}>Pending ({Pending.length})</div>

                <div onClick={() => setFilter('AddFriend')} className={`tab green ${filter == 'AddFriend' ? 'selected' : ''}`}><i class="fa-solid fa-plus"></i> Add Friend</div>
            </div>
            <div>

            </div>
            {filteredList.map((v) => <Friend key={v._id} data={v} />)}

            {filter == 'AddFriend' ?
                (<AddFriendSubMenu />
                )
                :
                (<></>)
            }
        </div>

    )
}


function AddFriendSubMenu() {
    const client = useContext(ClientContext)
    const [responseError, setResponseError] = useState('')
    return (
        <div className='add-friend'>
            <div className='input-w-button'>
                <div className='input-wrapper'>
                    <input autoComplete='off' placeholder='Enter username or ID' id='friend-request-input' ></input>
                </div>
                <button className={`action-button ${responseError ? 'shake-error' : ''}`} onClick={() => {
                    setResponseError('')
                    fetch('http://localhost:443/api/friend/create', {
                        headers: {
                            'content-type': 'application/json'
                        },
                        method: 'POST',
                        credentials: 'include',
                        body: JSON.stringify({ to: document.querySelector('#friend-request-input').value })
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            if (!data.error) {
                              
                                  
                          
                                client.emit('FriendRequestSent', data.request)
                               

                            } else {
                                setResponseError(data.message)
                            }

                        })
                }}  >SEND</button>
            </div>


            <div className='error w-button'>{responseError}</div>


        </div>
    )
}

function UpdateExistingRequest(id, status, client) {

    fetch('http://localhost:443/api/friend/respond', {
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ id, status })
    })
        .then((res) => res.json())
        .then((data) => {
            if (!data.error) {
                client.emit('FriendRequestSent', data.request)
            } else {
                
            }

        })
}


function Friend({ data }) {
    const userData = useContext(UserContext)
    const client = useContext(ClientContext)
    if (data.status == 0) {
        if (data.from._id == userData._id) {
            // outgoing
            return (
                <div className='friend'>
                    <div className='profile-small'>
                        <div className='pfp'>
                            <img src={data.to?.icon || '/default-user-pfp.webp'}></img>

                        </div>

                        {data.to.username}
                    </div> <span className='round-button' onClick={() => { UpdateExistingRequest(data._id, 3, client) }}>
                        cancel
                    </span>
                </div>
            )
        } else {
            // incoming
            return (
                <div className='friend'>
                    <div className='profile-small'>
                        <div className='pfp'>
                            <img src={data.from?.icon || '/default-user-pfp.webp'}></img>

                        </div>
                        {data.from.username}
                    </div>
                    <span className='round-button' onClick={() => { UpdateExistingRequest(data._id, 1, client) }}>
                        accept
                    </span>
                    <span className='round-button' onClick={() => { UpdateExistingRequest(data._id, 2, client) }}>
                        decline
                    </span>
                </div>
            )
        }
    } else {
        let friendedUser = data.from._id == userData._id ? data.to : data.from
        return (
            <div className='friend'>
                <div className='profile-small'>
                    <div className='pfp'>
                        <img src={friendedUser?.icon || '/default-user-pfp.webp'}></img>

                    </div>
                    {friendedUser.username}
                </div>
            </div>
        )
    }

}
