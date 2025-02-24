import React, { useState } from 'react'
import generateAvatar, { AvatarOptions } from 'profile-generator-js' // hey ! I wrote this package!
import useContextMenu from './ContextMenu/useContextMenu'
import UserContextMenu from './ContextMenu/UserContextMenu'


export function getAvatarFromUser(user = { username: '' }) {
    if (!user.icon) {
        return generateAvatar(user.username)
    } else {
        return user.icon
    }
}

let cachedAvatars = {}

function ProfilePicture({ entity, className, editing, fallbackLetterSize, includeContextMenu }) {
    let {
        handleClick,
        context,
        open
    } = useContextMenu()
    let [sourceFinal, setSourceFinal] = useState('')
    
    console.log(entity)
    const name = entity.username || entity.name;

    let source = entity.icon;

    if (sourceFinal || cachedAvatars[name]) {
        source = sourceFinal || cachedAvatars[name]
    } else {
        if (!entity.icon && !entity.username) {
            //source = generateAvatar(entity.name, '', undefined, true)
            source = null;
            generateAvatar(name, '', { size: 500, customIcon: '/user-groups.svg' }).then((res) => {
                cachedAvatars[name] = res
                setSourceFinal(res)
            })
        } else if (!entity.icon) {
            source = generateAvatar(name, undefined, undefined, true)
            cachedAvatars[name] = source
        }

    }
    return (
        <>
            <img onClick={(e) => {
                let rect = e.currentTarget.getBoundingClientRect()
                open(rect.right - 5, rect.bottom - 5, e.currentTarget)
                return
            }} data-entity={entity.icon} className={className} src={source || editing}></img>
            {
                includeContextMenu ? <UserContextMenu user={entity} context={context} /> : <></>
            }
        </>

    )
    // } else {
    //     return (
    //         <div className='fallback-picture pfp'>
    //             <div className='letter' style={{ fontSize: fallbackLetterSize + 'em' }}>
    //                 {name.slice(0, 1).toUpperCase()}
    //             </div>

    //             <div className='img' style={{ backgroundColor: color }}></div>
    //         </div>

    //     )
    // }

}

export default ProfilePicture
