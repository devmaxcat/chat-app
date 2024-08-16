import { React } from 'react'
import { Link, useLocation } from 'react-router-dom';
import Channels from './Channels';


export default function Sidebar() {
    const location = useLocation()

    return (
        <div id='sidebar'>
            <div className='input-wrapper'>
                <input placeholder='Search...'></input>
            </div>
            <div className='channel-selector'><i class="fa-solid fa-message"></i>+ Create New</div>
            <h3 className='channels-header'>Conversations </h3>
            <Channels></Channels>


            <div className='flex-pusher-vert'></div>

            <Link className={`channel-selector ${location.pathname.includes('friends') ? 'focused' : ''}`} to={"/me/friends"}><i class="fa-solid fa-user-plus"></i>Friends</Link>
            <Link className={`channel-selector ${location.pathname.includes('alerts') ? 'focused' : ''}`} to={"/me/alerts"}><i class="fa-regular fa-rectangle-list"></i>Change Log</Link>
        </div>
    )
}



