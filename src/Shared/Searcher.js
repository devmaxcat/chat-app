import React, { act, useContext, useEffect, useState } from 'react'
import { RequestContext } from '../App';
import ProfilePicture from './ProfilePicture';
import { ChannelsContext } from '../Chat';
import { ChannelItem } from '../Sidebar/Channels';

const Searcher = ({ onSearch, children }) => {
    const requester = useContext(RequestContext)
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false)
    const [active, setActive] = useState(false)

    const channels = useContext(ChannelsContext)

    onSearch = onSearch || function () { }
    useEffect(() => {
        onSearch(active)
    }, [active])

    useEffect(() => {
        if (!active) {
            setResults([])
            return
        }

        if (query.length > 0) {
            // setLoading(true);

            // requester(true, `/api/user/search?query=${query}?limit=5`, 'GET', true).then((response) => {
            //     //setLoading(false);
            //     if (response) {
            //         setResults(response);

            //     }
            // })
            if (query === 'hidden') {
                setResults(channels.filter((e) => window.localStorage.getItem(`prefersHidden_${e._id}`) == 'true'))
                return
            }
            let filteredChannels = channels.filter((e) => e.name.includes(query) || e.recipients.find((m) => m.username.includes(query)))
            setResults(filteredChannels)

        } else {
            setResults(channels);
        }

    }, [query, active]);

    return (
        <div className='searcher' onFocusCapture={() => { setActive(true) }}>
            <div className='input-wrapper'>
                <span class="search-input-icon material-symbols-outlined">
                    search
                </span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search channels..."
                    onKeyDown={(e) => {
                        if (e.code === 'Backspace' && query === '') {
                            e.target.blur()
                            setActive(false)

                        }

                    }
                    }
                />
                <span onClick={() => { setActive(false); setQuery('') }} style={{ display: active ? 'block' : 'none' }} class="searcher-close-icon material-symbols-outlined">
                    close
                </span>
               
            </div>
            {children}
            {loading ? <div className='loader'></div> : ''}
            {results.map(item => {

                if (true) {
                    return <ChannelItem key={item._id} data={item} alwaysShow={true}></ChannelItem>

                }
            })}


        </div>
    );
};

export default Searcher;
