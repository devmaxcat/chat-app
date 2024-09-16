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
        "All": (e) => 1 == 1,
        "DM": (e) => e.type == 0,
        "Group": (e) => e.type == 1,
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



function ChannelItem({ data }) {
    let userData = useContext(UserContext)
    let channelName;
    let channelIconURL;
    let extraclass;
    const {
        handleClick,
        context,
        open,
    } = useContextMenu()
    const location = useLocation()

    if (location.pathname.includes(`me/channel/${data._id}`)) {
        extraclass = 'focused'
    }
    let DMUser;
    if (data?.type == 0) {
        DMUser = data.recipients.find((e) => e._id != userData._id)
        channelName = DMUser?.displayName || DMUser.username
        channelIconURL = DMUser?.icon || '/default-user-pfp.webp'
    } else {
        DMUser = { activityStatus: { statusType: -1 } }
        channelName = data.name
        channelIconURL = data?.icon || '/default-group-pfp.webp'
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
                    <img src={channelIconURL}></img>
                    <ActivityIcon user={DMUser} />
                </div></div>
            <div className='input-wrapper disabled-plaintext'>
                <input className='title' defaultValue={channelName} disabled>
                </input>
            </div>

        </Link>


    )
}
