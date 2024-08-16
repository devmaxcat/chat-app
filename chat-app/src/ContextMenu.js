import React, { useState } from 'react'

export default function ContextMenuButton({ menu }) {
    const { open, setOpen } = useState(false)
    return (
        <div onContextMenu={setOpen(!open)}>
            {open ? <ContextMenu menu={menu} /> : {}}

        </div>
    )
}

function ContextMenu({ menu }) {
    return (
        <div className='context-menu'>
            {menu.title}
            <ContextItems items={menu.items}></ContextItems>
        </div>

    )
}

function ContextItems({ items }) {
    return (
        items.map((item) => (<ContextItem item={item} />) )
    )
}

function ContextItem({ item }) {
    return (
        <div className='context-item'>
            {item.name}
        </div>
    )
}

function ContextSubMenu() {
    return (
        <></>
    )
}


export class CreateContextItem {
    constructor(name, callback, submenu) {
        this.name = name
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


