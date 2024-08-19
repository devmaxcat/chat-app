import React, { useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { Alert, AlertContext, ChannelsContext, ClientContext } from '../Chat'
import { UserContext } from '../App'
import MessageSkeletonBuffer from '../MessageSkeletonBuffer'
import ActivityIcon from '../Profile/ActivityIcon'


let reachedEnd = false;


export default function Channel() {
    const { channelid } = useParams()
    const alerts = useContext(AlertContext)
    const [history, setHistory] = useState([])
    const historyReference = useRef(history)
    const location = useLocation()
    const channels = useContext(ChannelsContext)
    const channelData = channels.find((e) => e._id == channelid)
    const navigate = useNavigate()
    let userData = useContext(UserContext)

    const client = useContext(ClientContext)

    let gettingHistory = false;

    function getLastKnownMessage() {
        return history[history.length - 1]
    }






    // client.listen('MessageDelete', (data) => {
    //     if (data.channel_id === channelid) {
    //         let newHistory = [...history].splice(history.findIndex((e) => e._id == data._id), 1)
    //         setHistory(newHistory)
    //     }
    // }, 'channellistener_deleted')


    useEffect(() => { historyReference.current = history }, [history])
    useEffect(() => {



        client.on('MessageRecieved', (data) => {
            console.log('MessageRecieved', data)
            if (data.channel_id === channelid) {
                setHistory([data, ...historyReference.current])
            }
        })
        
        fetch('http://localhost:443/api/message/history?' + new URLSearchParams({ channelid: channelid }), {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data.error) {
                    setHistory(data)
                } else {
                    alerts.alert(new Alert('error', data.error, data.message))
                    if (data.error == 'Unauthorized') {
                        navigate('/login')
                    }
                }

            })
        return () => { return }
    }, [client, location, channelid])
    let channelName;
    let channelIconURL;
    if (channelData?.type == 0) {
        let DMUser = channelData.recipients.find((e) => e._id != userData._id)
        channelName = DMUser?.displayName || DMUser?.username
        channelIconURL = DMUser?.icon || '/default-user-pfp.webp'
    } else {
        channelName = channelData?.name
        channelIconURL = channelData?.icon || '/default-group-pfp.webp'
    }
    return (

        <>
            <div className='pane-topbar'>
                <div className='channel-top-name'>
                    <img src={channelIconURL}></img>
                    <div>
                        <div min-width='3rem' className='empty-skeleton-text'>{channelName}</div>
                        {/* <div>{channelData.recipients.length} Members</div> */}
                    </div>

                </div>

            </div>

            <div className='channel'>

                <div className='messages-outer'>


                    <div className='messages' onScroll={(event) => {
                        //console.log(event.target.scrollTop, (event.target.scrollHeight - event.target.clientHeight) * -1)
                        if (Math.abs(event.target.scrollTop) > (event.target.scrollHeight - event.target.clientHeight) - 300 && gettingHistory == false) {
                            gettingHistory = true;
                            fetch('http://localhost:443/api/message/history?' + new URLSearchParams({ channelid: channelid, cursorid: getLastKnownMessage()._id }), {
                                method: 'GET',
                                credentials: 'include'
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    gettingHistory = false;
                                    if (data.length != 0) {
                                        setHistory([...history, ...data])
                                        reachedEnd = true;
                                    }

                                })
                        }
                    }}>
                        { history.length == 0 ? (<div>Send a message!</div>) : '' }
                        {history.map((v, i) => (<Message key={v._id} data={v} previous={history[i + 1]} index={i} history={history} />))}
                        {/* {!reachedEnd ? <MessageSkeletonBuffer key={Math.random()}></MessageSkeletonBuffer> : ''} */}


                    </div>
                    <div className='input-wrapper message-bar'>
                        <input placeholder='Type a message' onKeyPress={(event) => {
                            if ((event.key) === "Enter") {
                                event.preventDefault();

                                fetch('http://localhost:443/api/message/create', {
                                    headers: {
                                        'content-type': 'application/json'
                                    },
                                    method: 'POST',
                                    credentials: 'include',
                                    body: JSON.stringify({ text_content: event.target.value, channel_id: channelid })
                                })
                                    .then((res) => res.json())
                                    .then((data) => {
                                        event.target.value = ''
                                        console.log('sending message ...', data.text_content, client)
                                        client.emit('MessageSent', data)
                                    })

                            }
                        }} ></input>
                    </div>
                </div>
                <div className='channel-info'>
                    <div className='input-wrapper'>
                        <input placeholder='Search...'></input>
                    </div>
                    <h4>Members</h4>
                    {channelData?.recipients.map((v, i) => (<ChannelMember key={i} data={v}></ChannelMember>))}


                </div>

            </div>
        </>
    )
}

var moment = require('moment');

let lastRenderedMessage = null
function Message({ data, previous, index, history }) {

    let MessageIconURL;





    let time = moment(data.createdAt)
    let now = moment()
    let displaytime;

    if (time.format('d') == now.format('d')) {

        displaytime = time.fromNow()
    }
    else if (Number(time.format('D')) == now.format('D') - 1) displaytime = 'Yesterday ' + time.format(' LT')
    else if (now.format('ww') == now.format('ww')) displaytime = time.format('dddd LT')
    else displaytime = time.format('L LT ')

    MessageIconURL = data.author?.icon || '/default-user-pfp.webp'

    // if the last message was sent by the same person and it hasn't been more than 5 minutes, then combine the messages together.
    if ((previous?.author._id == data.author._id) && (new Date(data.createdAt).getTime() - new Date(previous?.createdAt).getTime() < 300000) && (index != history.length - 1)) {


        return (
            <div className='message collapsed'>
                <div className='gutter'></div>
                <div>
                    <div>
                        {data.text_content}
                    </div>
                </div>
            </div>
        )

    } else {

        return (
            <div className='message'>
                <div>
                    <img src={MessageIconURL}></img>
                </div>
                <div>
                    <div className='bar'>
                        <div className='name'>
                            {data.author.displayName || data.author.username}
                        </div>
                        <div className='time'>
                            {displaytime}
                        </div>
                    </div>
                    <div>
                        {data.text_content}
                    </div>
                </div>
            </div>
        )
    }



}


function ChannelMember({ data }) {
    return (
        <div className='profile-small'>
            <div className='pfp'>
                <img src={data?.icon || '/default-user-pfp.webp'}></img>
                <ActivityIcon user={data} />
            </div>

            {data.displayName || data.username}
        </div>

    )
}
