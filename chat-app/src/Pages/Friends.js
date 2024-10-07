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

    function returnEmptyIf0(a) {
        if (a == 0) {
            return 'NONE'
        } else
            return a
    }

    return (
        <div className='friends-outer'>
            <h1>Friends</h1>

            <div className='friends-inner'>
                <div className='friends-list'>
                    <div className='filter-tabs more-space'>
                        <div onClick={() => setFilter('AllFriends')} className={`tab ${filter == 'AllFriends' ? 'selected' : ''}`}>All</div>
                        <div onClick={() => setFilter('Requests')} badge={returnEmptyIf0(Requests.length)} className={`tab badge ${filter == 'Requests' ? 'selected' : ''}`}>Requests</div>
                        <div onClick={() => setFilter('Pending')} badge={returnEmptyIf0(Pending.length)} className={`tab badge secondary ${filter == 'Pending' ? 'selected' : ''}`}>Pending</div>
                    </div>
                    <div>
                        {filteredList.map((v) => <Friend key={v._id} data={v} />)}
                    </div>
                </div>





                <AddFriendSubMenu />


            </div>

        </div>

    )
}


function AddFriendSubMenu() {
    const client = useContext(ClientContext)
    const friends = useContext(FriendsContext)
    const [responseError, setResponseError] = useState('')
    

    async function send() {
        if (responseError !== 'LOADING') {
            setResponseError('LOADING')
            let response = await friends.send(document.querySelector('#friend-request-input').value)
            if (response?.error) { setResponseError(response.message) } else {setResponseError('')}
        }
    }

    return (

        <div className='add-friend'>

            <div className='input-w-button'>
                <div className='input-wrapper'>
                    <i className="material-symbols-rounded">
                        person_add
                    </i>
                    <input autoComplete='off' placeholder='Enter username or ID' id='friend-request-input' onKeyDown={(e) => { if (e.code == 'Enter') send(); else {setResponseError('')} }} ></input>
                    <button onClick={send} disabled={responseError == 'LOADING'} className='action-button'>
                        <i className={`material-symbols-rounded enabled-only ${responseError ? 'shake-error' : ''}`}>
                            send

                        </i>
                        <div className='loader disabled-only'></div>
                    </button>

                </div>
            </div>
            <div className='error w-button'>{responseError !== 'LOADING' ? responseError : ''}</div>
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
                    <div className='action-bar'>
                        <button className='action-button secondary-grey' onClick={() => { friends.respond(data._id, 3) }}>
                            Cancel
                        </button>
                    
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
                            <i class="material-symbols-outlined">
                                check_circle
                            </i>
                        </span>
                        <span className='round-button secondary' onClick={() => { friends.respond(data._id, 2) }}>
                           
                            <i class="material-symbols-outlined">
                                cancel
                            </i>
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
