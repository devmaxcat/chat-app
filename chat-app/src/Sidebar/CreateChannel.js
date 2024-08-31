import React, { act, useContext, useReducer, useState } from 'react'
import { ChannelsContext, FriendsContext } from '../Chat'
import { RequestContext } from '../App'
import { useNavigate } from 'react-router'
import GenericSelectionMenu from '../Shared/SelectionMenu/GenericSelectionMenu'
import useSelectionMenu from '../Shared/SelectionMenu/useSelectionMenu'

export default function CreateChannel() {
    const {handleClick, context} = useSelectionMenu()
   
    const friends = useContext(FriendsContext).asFriendsList()
    return (
        <>
            <div onClick={handleClick()} className='channel-selector'><i class="fa-solid fa-message"></i>+ Create New</div>
            {context.open ? (<UserSelectionMenu context={context} users={friends}></UserSelectionMenu>) : ''}
        </>

    )
}

function UserSelectionMenu({ users, context }) {
    const navigate = useNavigate()
    const channels = useContext(ChannelsContext)
    const requester = useContext(RequestContext)

    async function onSelectionComplete(values) {
        let data = await requester(true, '/api/channel/create', 'POST', true, {
            recipients: values.map(function (obj) {
                return obj._id;
            })
        })
        if (data.channel) {
            await channels.refresh()
            navigate('/me/channel/' + data.channel._id)
        }
    }
    return (
        <GenericSelectionMenu context={context} title={'Create Channel'} list={users} onSelectionComplete={onSelectionComplete}></GenericSelectionMenu>
    )
}







// Template child key should be equal to its value
