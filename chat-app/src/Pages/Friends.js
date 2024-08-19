import React, { useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ClientContext, Alert, AlertContext, FriendsContext } from '../Chat'
import { ModalService, UserContext } from '../App'
import ContextMenuButton, { ContextMenu, CreateContextItem, CreateMenu } from '../ContextMenu'
import { MenuTemplates } from '../ContextMenu'
import useContextMenu from '../Shared/ContextMenu/useContextMenu'
import UserContextMenu from '../Shared/ContextMenu/UserContextMenu'

export default function Friends() {
    const friendReqs = useContext(FriendsContext)
    const location = useLocation()
    const client = useContext(ClientContext)
    const userData = useContext(UserContext)
    const alerts = useContext(AlertContext)
    const [filter, setFilter] = useState('AllFriends')

    if (!friendReqs.isFriends) {
        return
    }




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
    const friends = useContext(FriendsContext)
    const [responseError, setResponseError] = useState('')
    return (
        <div className='add-friend'>
            <div className='input-w-button'>
                <div className='input-wrapper'>
                    <input autoComplete='off' placeholder='Enter username or ID' id='friend-request-input' ></input>
                </div>
                <button className={`action-button ${responseError ? 'shake-error' : ''}`} onClick={async () => {
                    setResponseError('')
                    let response = await friends.send(document.querySelector('#friend-request-input').value)
                    if (response?.error) { setResponseError(response.message) }
                }}  >SEND</button>
            </div>
            <div className='error w-button'>{responseError}</div>
        </div>
    )
}




function Friend({ data }) {
    const userData = useContext(UserContext)
    const friends = useContext(FriendsContext)
    const {
        handleClick,
        context,
        open,
    } = useContextMenu()

    if (data.status == 0) {
        if (data.from._id == userData._id) {
            // outgoing
            return (

                <div className='friend' onContextMenu={handleClick()}>
                    <UserContextMenu user={data.to} context={context} />
                    <div className='profile-small'>
                        <div className='pfp'>
                            <img src={data.to?.icon || '/default-user-pfp.webp'}></img>

                        </div>

                        {data.to.username}
                    </div>
                    <div className='buttons'>
                        <span className='round-button' onClick={() => { friends.respond(data._id, 3) }}>
                            <i class="fa-regular fa-circle-xmark"></i>
                        </span>
                    </div>

                </div>

            )
        } else {
            // incoming
            return (
                <div className='friend' onContextMenu={handleClick()}>
                    <UserContextMenu user={data.from} context={context} />
                    <div className='profile-small'>
                        <div className='pfp'>
                            <img src={data.from?.icon || '/default-user-pfp.webp'}></img>

                        </div>
                        {data.from.username}
                    </div>
                    <div className='buttons'>
                        <span className='round-button' onClick={() => { friends.respond(data._id, 1) }}>
                            <i class="fa-solid fa-circle-check"></i>
                        </span>
                        <span className='round-button secondary' onClick={() => { friends.respond(data._id, 2) }}>
                            <i class="fa-regular fa-circle-xmark"></i>
                        </span>
                    </div>

                </div>
            )
        }
    } else {
        let friendedUser = data.from._id == userData._id ? data.to : data.from
        return (
            <div className='friend' onContextMenu={handleClick()}>
                <UserContextMenu user={friendedUser} context={context} />
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
