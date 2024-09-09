import React, { useContext, useEffect, useReducer, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { Alert, AlertContext, ChannelsContext, ClientContext, FriendsContext } from '../Chat'
import { RequestContext, UserContext } from '../App'
import MessageSkeletonBuffer from '../MessageSkeletonBuffer'
import ActivityIcon from '../Profile/ActivityIcon'
import UserContextMenu from '../Shared/ContextMenu/UserContextMenu'
import useContextMenu from '../Shared/ContextMenu/useContextMenu'
import GenericSelectionMenu from '../Shared/SelectionMenu/GenericSelectionMenu'
import useSelectionMenu from '../Shared/SelectionMenu/useSelectionMenu'
import User from '../ProfileDrop'



let reachedEnd = false;


function ChannelName({ channel }) {
    const [editing, setEditing] = useState(false);
    const requester = useContext(RequestContext)
    const channels = useContext(ChannelsContext)
    let isEditable = channel.type != 0
    async function updateChannelName(name) {
        let data = await requester(true, '/api/channel/update', 'POST', true, {
            channelid: channel._id,
            name: name
        })
        if (!data.error) {
            setEditing(false)
            channels.refresh()
        }

    }

    useEffect(() => { setEditing(false) }, [channel])


    return (
        <div className='channel-top-name' >
            <img src={channel.icon}></img>
            <span key={channel._id}>
                <div className='input-wrapper disabled-plaintext' onClick={() => { if (channel.type != 0) setEditing(true) }}>
                    {isEditable ?
                        (<input min-width='3rem' className={editing} defaultValue={channel.name} disabled={!editing} onBlur={(e) => { updateChannelName(e.currentTarget.value) }} ></input>)
                        :
                        (<input min-width='3rem' defaultValue={channel.name} disabled={true}></input>)
                    }



                    {/* <div>{channelData.recipients.length} Members</div> */}
                </div>
            </span>
        </div>
    )
}

function ChannelAdd({ channel }) {
    const friends = useContext(FriendsContext).asFriendsList()
    const channels = useContext(ChannelsContext)
    const requester = useContext(RequestContext)
    const navigate = useNavigate()
    const { context, handleClick } = useSelectionMenu()

    let recipients = channel.recipients.map(e => e._id)

    let sortFriends = friends.filter((e) => !recipients.includes(e._id))





    async function onSelectionComplete(values) {
        let data = await requester(true, '/api/channel/add', 'POST', true, {
            channelid: channel._id,
            recipients: values.map((e) => e._id)
        })
        if (data.channel) {
            await channels.refresh()
            navigate('/me/channel/' + data.channel._id)
        }
    }
    return (
        <div>
            <i class="fa-solid fa-user-plus" onClick={handleClick()}></i>
            {context.open ? (<GenericSelectionMenu title={'Add Friends'} list={sortFriends} context={context} onSelectionComplete={onSelectionComplete}></GenericSelectionMenu>) : ('')}
        </div>
    )
}


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
    console.log('HISTORY', history)
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

    const pushTempHistory = function (msg) {
        msg.temporary = true

        setHistory([msg, ...history])
    }


    useEffect(() => { historyReference.current = history }, [history])
    useEffect(() => {



        client.on('MessageRecieved', (data) => {
            // console.log('MessageRecieved', data)
            if (data.channel_id === channelid) {
                setHistory([data, ...historyReference.current.filter(e => !e.temporary)])
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
                    alerts.alert(new Alert('error', data.message, data.error, 0, [], 0, 0, "fa-solid fa-ban"))
                    if (data.error == 'Unauthorized') {
                        navigate('/login')
                    }
                }

            })
        return () => { return }
    }, [client, location, channelid])
    useEffect(() => {
        setHistory([])
    }, [channelid])
    let channelName;
    let channelIconURL;
    if (channelData?.type == 0) {
        let DMUser = channelData.recipients.find((e) => e._id != userData._id)
        channelName = DMUser?.displayName || DMUser?.username
        channelData.name = channelName
        channelIconURL = DMUser?.icon || '/default-user-pfp.webp'
        channelData.icon = channelIconURL
    } else if (channelData) {
        channelName = channelData?.name
        channelIconURL = channelData?.icon || '/default-group-pfp.webp'
        channelData.icon = channelIconURL
    } else {
        return
    }
    return (

        <>
            <div className='pane-topbar'>
                <ChannelName channel={channelData}></ChannelName>

                <ChannelAdd key={channelData._id} channel={channelData}></ChannelAdd>
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

                        {/* {history.length == 0 ? (<div className='no-message-history'><img src={'/static-content/no-message-history.webp'}></img>Send a message!</div>) : ''} */}
                        {history.map((v, i) => (<Message key={v._id} data={v} previous={history[i + 1]} index={i} history={history} />))}
                        {(<div className='no-message-history'>
                            <div className='title'>
                                <img src={channelIconURL}></img>
                                <div>{channelName}</div>
                            </div>

                            Send a message!
                        </div>)}
                        {/* {!reachedEnd ? <MessageSkeletonBuffer key={Math.random()}></MessageSkeletonBuffer> : ''} */}


                    </div>
                    <MessageBar key={channelid} channelid={channelid} pushTempHistory={pushTempHistory}></MessageBar>
                </div>
                <div className='channel-info'>
                    <div className='input-wrapper'>
                        <input placeholder='Search...'></input>
                    </div>
                    {channelData?.type != 0 ?
                        (<>
                            <h4>Members</h4>
                            {channelData?.recipients.map((v, i) => (<ChannelMember key={i} data={v}></ChannelMember>))}
                        </>)
                        :
                        (<></>)}



                </div>

            </div>
        </>
    )
}

var moment = require('moment');

let lastRenderedMessage = null
function Message({ data, previous, index, history }) {
    const requester = useContext(RequestContext)

    const [embeds, setEmbeds] = useState(function () {
        let embedded = []
        if (data.media) {

            for (let media of data.media) {
                if (media.resource_type == "image") {
                    embedded.push(media)

                }
                if (media.resource_type == "raw") {
                    embedded.push(media)

                }
            }

        }
        return embedded
    }())
    let MessageIconURL;
    // Linked based embedding.
    // useEffect(() => {


    //     (requester.extractUrls(data.text_content) || []).forEach(async URLstr => {
    //         console.log(URLstr)
    //         if (await requester.isImgUrl(URLstr)) {
    //             console.log(URLstr, 'is image')
    //             setEmbeds([...embeds, { type: 'image', url: URLstr }])
    //         } else {
    //             console.log(URLstr, 'not image')
    //         }
    //     });
    // }, [])






    let time = moment(data.createdAt)
    let now = moment()
    let displaytime;
    let componentizedText = data.text_content.split(' ').map((e) => {
        if (requester.testURL(e)) {

            return (<a target='_blank' href={e}> {e} </a>)

        } else {
            return " " + e + " "
        }

    })
    if (time.isSame(moment(), 'day')) {

        displaytime = time.fromNow()
    }
    else if (time.isSame(moment().subtract(1, 'days'), 'day')) displaytime = 'Yesterday at ' + time.format(' LT')
    //else if (time.isSame(moment(), 'week')) displaytime = time.format('dddd LT')
    else displaytime = time.format('L LT ')

    MessageIconURL = data.author?.icon || '/default-user-pfp.webp'


    // if the last message was sent by the same person and it hasn't been more than 5 minutes, then combine the messages together.
    if ((previous?.author._id == data.author._id) && (new Date(data.createdAt).getTime() - new Date(previous?.createdAt).getTime() < 300000) && (index != history.length - 1)) {


        return (
            <div className={`message collapsed ${data.temporary ? 'temp' : ''}`}>
                <div className='gutter'></div>
                <div>
                    <div>
                        {componentizedText}

                    </div>
                    <div className='attachments'>
                    {embeds.map((e) => { return (<MessageEmbed embed={e} />) })}
                    </div>

                </div>
            </div>
        )

    } else {
        if (data.temporary) console.log('remptoary rendner', data)
        return (
            <div className={`message ${data.temporary ? 'temp' : ''}`}>
                <div className='pfp'>
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
                        {componentizedText}

                    </div>
                    <div className='attachments'>
                    {embeds.map((e) => { return (<MessageEmbed embed={e} />) })}
                    </div>
                    
                </div>
            </div>
        )
    }



}

function MessageEmbed({ embed, progress }) {
    return (
        <div className='embed'>

            {
                function () {
                    if (embed.resource_type == 'image' && embed.url.includes('.pdf')) {
                        return (
                            <div className='message-file-embed'>
                                <div>
                                    <div className='row space-between'>
                                        <div>{embed?.context?.custom?.original_name || embed.display_name}</div>
                                        <a target='_blank' className='fa-solid fa-arrow-up-right-from-square grey' ></a>
                                    </div>
                                    <embed src={embed.url}></embed>
                                    <div className='row'>
                                    <a target='_blank' download={embed?.context?.custom?.original_name || embed.display_name} href={embed.url} className='fa-solid fa-download' ></a>
                                        <div>{embed.bytes + ' bytes'}</div>
                                      
                                    </div>

                                </div>


                            </div>

                        )

                    }
                    else if (embed.resource_type == 'image') {
                        return (

                            <img className='message-media-image' src={embed.url}></img>
                        )
                    }

                    else if (true) {
                        return (
                            <a href={embed.secure_url} className='raw'>
                                <div>
                                    <div>{embed?.context?.custom?.original_name || embed.display_name}</div>
                                    <div>{embed.bytes + ' bytes'}</div>
                                </div>


                                <a className='fa-solid fa-download' ></a>
                            </a>


                        )
                    }
                }()
            }
        </div>
    )



}


function ChannelMember({ data }) {
    const {
        handleClick,
        context,
        open,
    } = useContextMenu()
    return (
        <div className='profile-small w-interact' onContextMenu={handleClick()}>
            <UserContextMenu user={data} context={context} />
            <div className='pfp'>
                <img src={data?.icon || '/default-user-pfp.webp'}></img>
                <ActivityIcon user={data} />
            </div>

            {data.displayName || data.username}
        </div>

    )
}

function messageMediaReducer(values, action) {
    switch (action.type) {
        case 'add': {
            return [...values, action.data]

        }
        case 'remove': {
            return values.filter(e => e !== action.data)
        }
        case 'reset': {
            return []
        }
        default: {
            throw Error('Unknown Action.')
        }

    }
}

function MessageBar({ channelid, pushTempHistory }) {
    const [media, mediaDispatcher] = useReducer(messageMediaReducer, [])
    const [uploadState, setUploadState] = useState(-1)
    const userData = useContext(UserContext)

    return (
        <div className='input-wrapper message-bar'>
            <div className='attached-media'> {
                media.map(file => (
                    <div className='message-media-preview'>

                        <i className='fa-solid fa-x' onClick={() => mediaDispatcher({ type: 'remove', data: file })}>
                            <svg style={{ '--progress': uploadState }} width="250" height="250" viewBox="0 0 250 250" class="circular-progress">
                                <circle class="bg"></circle>
                                <circle class="fg"></circle>
                            </svg>
                        </i>
                        <img src={URL.createObjectURL(file)}></img>
                    </div>
                ))}
            </div>
            <textarea placeholder='Type a message' onPasteCapture={(e) => {
                if (e.clipboardData.files[0]) {
                    mediaDispatcher({ type: 'add', data: e.clipboardData.files[0] })
                }

            }} onKeyPress={(event) => {
                if ((event.key) === "Enter") {
                    let formdata = new FormData()
                   // pushTempHistory({ author: userData, channel_id: formdata.get('channel_id'), text_content: formdata.get('text_content'), media: media.map((e) => { return { secure_url: URL.createObjectURL(e), url: URL.createObjectURL(e), resource_type: 'image' } }), createdAt: new Date().toISOString() })
                    formdata.append('text_content', event.target.value)
                    formdata.append('channel_id', channelid)
                    for (let file of media) {
                        formdata.append(file.name, file);
                    }
                   
                   

                    event.preventDefault();
                    const xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function (event) {
                        if (event.lengthComputable) {
                            const percentComplete = (event.loaded / event.total) * 100;
                            setUploadState(percentComplete)
                            console.log(Math.round(percentComplete))
                        }
                    })
                    xhr.upload.addEventListener('load', function () {
                        console.log('Upload complete!');

                    });

                    xhr.upload.addEventListener('error', function () {
                        console.log('Upload failed!');
                    });

                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                mediaDispatcher({ type: 'reset' })

                                event.target.value = ''
                            } else {

                            }
                        }
                    };
                    xhr.open('POST', 'http://localhost:443/api/message/create', true);
                    xhr.withCredentials = true
                    xhr.send(formdata)

                }
            }} ></textarea>
        </div>
    )
}
