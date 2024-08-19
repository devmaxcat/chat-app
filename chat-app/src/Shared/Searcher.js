import React, { act, useContext, useEffect, useState } from 'react'
import { RequestContext } from '../App';

const Searcher = ({onSearch, children}) => {
    const requester = useContext(RequestContext)
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false)
    const [active, setActive] = useState(false)
    onSearch = onSearch || function () {}
    useEffect(() => {
        onSearch(active)
    }, [active])

    useEffect(() => {

        if (query.length > 0 ) {
           // setLoading(true);
          
            requester(true, `/api/user/search?query=${query}?limit=5`, 'GET', true).then((response) => {
                //setLoading(false);
                if (response) {
                    setResults(response);

                }
            })

        } else {
          
            setResults([]);
        }

    }, [query]);

    return (
        <div className='searcher' onFocusCapture={() => {setActive(true)}}>
            <div className='input-wrapper'>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                />
                <i style={{display: active ? 'block':'none'}} onClick={() => {setActive(false); setQuery('')}} class="fa-solid fa-x"></i>
            </div>
            {children}
            {loading ? <div className='loader'></div> : ''}
            {results.map(item => (
                <div className='friend list-profile' onClick={() => { setQuery(item.username); setResults(results.filter((e) => e == item)) }} >

                    <div key={item._id} className='profile-small' >
                        <div className='pfp'>
                            <img src={item.icon || '/default-user-pfp.webp'}></img>

                        </div>
                        {item.username}
                    </div>
                </div>
            ))}
            

        </div>
    );
};

export default Searcher;
