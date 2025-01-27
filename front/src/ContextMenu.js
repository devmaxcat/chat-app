import React, { useEffect, useState } from 'react'
import { Modal, ModalAction } from './App'



export default function ContextMenuButton({ children, menu, className }) {
    const [open, setOpen] = useState(false)
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })
    useEffect(() => {
        document.addEventListener("mouseup", (() => {
            setOpen(false)
        }))
    }, [setOpen])

    function opener(e) {

        let selection = window.getSelection()
        let text = selection.toString()
        if (selection.type == 'Range') {
            console.log(menu)
            let copyTextItem = new CreateContextItem('Copy', () => {
                navigator.clipboard.writeText(text)
            })
            // copyTextItem.decay = true
            // menu.items.push(copyTextItem)
        }
        e.preventDefault();
        setOpen(true);
        setCoordinates({ x: e.clientX, y: e.clientY });

    }

    return (
        <div className={className + ` ${open ? 'hover' : ''}`} onContextMenu={opener}>
            {open ? (<ContextMenu menu={menu} coordinates={coordinates} />) : ''}
            {children}
        </div>
    )
}

function ContextMenu({ menu, coordinates }) {
    return (
        <div className='context-menu' style={{ left: coordinates.x + 10, right: coordinates.y }} onMouseUp={(e) => e.stopPropagation()}>
            <div className='title'>
                {menu.title}
            </div>

            <ContextItems items={menu.items}></ContextItems>
        </div>

    )
}

function ContextItems({ items }) {
    return (
        items.map((item) => (<ContextItem key={Math.random()} item={item} />))
    )
}

function ContextItem({ item }) {
    if (!item) {
        return
    }

    return (
        <div className='context-item' onClick={(e) => { e.stopPropagation(); console.log('meow1'); item.callback() }}>
            {item.label}
        </div>
    )
}

function ContextSubMenu() {
    return (
        <></>
    )
}


export class CreateContextItem {
    constructor(label, callback, submenu) {
        this.label = label
        this.callback = callback
        this.submenu = submenu
    }
}

export class CreateMenu {
    constructor(items, title) {
        this.items = items
        this.title = title
    }
}

export const MenuTemplates = {
    otherUser: (otheruser, client, modalservice, friends) => {
        if (!friends) {
            return
        }
       
        let unfriend = () => {
            modalservice.addModal(new Modal('CONFIRM', `Are you sure you want to unfriend ${otheruser?.displayName}?\n\nThey will not be notified.`, [new ModalAction('Cancel', 'dismiss', 'secondary-grey'), new ModalAction('Confirm', (dismisser) => { client.emit('FriendRequestRemove', { otherid: otheruser }); dismisser() }, 'red')]));
        }
        let addfriend = () => {
            friends.send(otheruser._id, true)
        }
        let {isfriends, result} = friends.isFriends(otheruser._id)
        // let isfriends = false
        // let result = {}

        let friendButton = new CreateContextItem(isfriends ? 'Remove Friend' : (result?.status == 0 ? 'Request Pending' : 'Add Friend'), isfriends ? unfriend : addfriend)
        return new CreateMenu([new CreateContextItem('Profile'), new CreateContextItem('Message'), friendButton, new CreateContextItem('Copy User ID')], '')
    }

}



