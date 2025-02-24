import { React, useState, useEffect, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChannelsContext, ClientContext, FriendsContext } from '../Chat'
import { ModalService, UserContext } from '../App'
import ActivityIcon from '../Profile/ActivityIcon'
import ContextMenuButton, { MenuTemplates } from '../ContextMenu'
import Friends from '../Pages/Friends'
import useContextMenu from '../Shared/ContextMenu/useContextMenu'
import UserContextMenu from '../Shared/ContextMenu/UserContextMenu'
import GroupDMContextMenu from '../Shared/ContextMenu/GroupDMContextMenu'
import ImageWrapper from '../Shared/ImageWrapper'
import ProfilePicture from '../Shared/ProfilePicture'


export default function Channels() {
    const channels = useContext(ChannelsContext)
    const client = useContext(ClientContext)



    let [sortedChannels, setSortedChannels] = useState(channels.sort((a, b) => a.lastActiveTime > b.lastActiveTime))

    function updateChannelOrder(data) {
        if (data) { }

    }

    useEffect(() => {
        setSortedChannels(channels)

        client.on('MessageRecieved', updateChannelOrder)
        return () => client.off('MessageRecieved', updateChannelOrder)
    }, [channels])


    const [filter, setFilter] = useState('All')

    const filters = {
        "All": (e) => 1 == 1 && e,
        "DM": (e) => e.type == 0 && e,
        "Group": (e) => e.type == 1 && e,
    }


    let filteredChannels = sortedChannels.filter(filters[filter])

    return (
        <>
            <div className='filter-tabs'>
                <div onClick={() => setFilter('All')} className={`tab ${filter == 'All' ? 'selected' : ''}`}>All</div>
                <div onClick={() => setFilter('DM')} className={`tab ${filter == 'DM' ? 'selected' : ''}`}>DMs</div>
                <div onClick={() => setFilter('Group')} className={`tab ${filter == 'Group' ? 'selected' : ''}`}>Groups</div>

            </div>
            <div id='channels'>

                {filteredChannels.map((v) => { return <ChannelItem key={v._id} data={v}></ChannelItem> })}
            </div>
        </>

    )
}



export function ChannelItem({ data, alwaysShow }) {
    let userData = useContext(UserContext)
    let hidden = window.localStorage.getItem(`prefersHidden_${data._id}`) == 'true'

    let channelName;
    let channelIconURL;
    let extraclass = '';
    const {
        handleClick,
        context,
        open,
    } = useContextMenu()
    const location = useLocation()

    if (location.pathname.includes(`me/channel/${data._id}`)) {
        extraclass += ' focused'
    }
    if (data.unread > 0) {
        extraclass += ' unread'
    }
    let DMUser;
    if (data?.type == 0) {
        DMUser = data.recipients.find((e) => e._id != userData._id)
        channelName = DMUser?.displayName || DMUser.username
        channelIconURL = DMUser?.icon || '/default-user-pfp.webp'
    } else {
        DMUser = { name: data.name, icon: data?.icon, activityStatus: { statusType: -1 } }
        channelName = data.name
        channelIconURL = data?.icon || '/default-group-pfp.webp'
    }

    if (hidden && !data.unread && !alwaysShow && !location.pathname.includes(`me/channel/${data._id}`)) {
        return
    }

    return (

        <Link className={`channel-selector ${extraclass}`} to={'/me/channel/' + data._id} onContextMenu={handleClick()}>
            {data?.type == 0 ?
                (<UserContextMenu user={DMUser} context={context} />)
                :
                (<GroupDMContextMenu channel={data} context={context} />)
            }

            <div class="profile-small">
                <div class="pfp">
                    <ProfilePicture entity={DMUser}></ProfilePicture>

                    <ActivityIcon user={DMUser} />
                </div></div>
            <div>
                <div className='input-wrapper disabled-plaintext'>
                    <span class="material-symbols-outlined visibility-off" hidden={!hidden ? 'hidden' : ''}>
                        visibility_off
                    </span>
                    <input className='title' defaultValue={channelName} disabled>
                    </input>

                    {/* {data.unread} */}
                </div>
                <ChannelLastMessage data={data}></ChannelLastMessage>
            </div>


            <div className='top-right-actions' >
                <button className='action-circle fa-solid fa-ellipsis' onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    let rect = e.currentTarget.getBoundingClientRect()
                    open(rect.right - 5, rect.bottom - 5, e.currentTarget)
                    return
                }}></button>




            </div>

        </Link>


    )
}

function ChannelLastMessage({ data }) {
    let friends = useContext(FriendsContext)
    let user = useContext(UserContext)
    let sender = friends.getKnownUserById(data.lastMessage?.author)?.username || data.lastMessage?.author?.username
    let content = data.lastMessage?.text_content || ''
    if (!content.trim().length > 0) {
        if (data.lastMessage?.media) {
            content = `*${data.lastMessage?.media.length} attachments*`
        }
    }


    let text = `${sender}:  ${content}`
    if (data.meetingParticipants?.length > 0) {
        if (data.meetingParticipants.find((e) => e._id == user._id)) {
            return (
                <div className='last-message'>
                    <span className='active'>
                        In Call
                    </span> {text}
                </div>

            )
        } else {
            return (
                <div className='last-message'>
                    <span className='italic'>Call ({data.meetingParticipants.length})</span> {text}
                </div>
            )
        }
    }
    return (
        <div className='last-message'>
            {text}
        </div>
    )
}
