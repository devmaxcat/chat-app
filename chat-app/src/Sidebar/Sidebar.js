import { React, useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
import Channels from './Channels';
import Searcher from '../Shared/Searcher';
import CreateChannel from './CreateChannel';


export default function Sidebar() {
    const location = useLocation()
    const [searching, setSearching] = useState(false)
    let onSearch = function (state) {
        setSearching(state)
    }

    return (
        <div id='sidebar'>
            <Searcher onSearch={onSearch}>
                <div className={`sidebar-mover-opposite ${searching}`}>
                    Search for users and channels
                    <div>
                        DISCOVER MENU
                    </div>
                </div>
            </Searcher>
            <div className={`sidebar-mover ${searching}`}>
                <CreateChannel></CreateChannel>
                <h3 className='channels-header'>Conversations </h3>
                <div className='sidebar-opposites'>
                    <div>
                    <Channels></Channels>
                    </div>
                    <div>
                   
                    <Link className={`channel-selector ${location.pathname.includes('friends') ? 'focused' : ''}`} to={"/me/friends"}><i class="fa-solid fa-users"></i>Friends</Link>
                    {/* <Link className={`channel-selector ${location.pathname.includes('forum') ? 'focused' : ''}`} to={"/me/friends"}><i class="fa-solid fa-comments"></i>Forums</Link> */}
                    <Link className={`channel-selector ${location.pathname.includes('alerts') ? 'focused' : ''}`} to={"/me/alerts"}><i class="fa-regular fa-rectangle-list"></i>Change Log</Link>
                    </div>
                   




                  
                </div>

            </div>


        </div>
    )
}



