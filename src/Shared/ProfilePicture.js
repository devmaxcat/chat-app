import React, { useState } from 'react'
import generateAvatar, { AvatarOptions } from 'profile-generator-js' // hey ! I wrote this package!


export function getAvatarFromUser(user = { username: '' }) {
    if (!user.icon) {
        return generateAvatar(user.username)
    } else {
        return user.icon
    }
}

function ProfilePicture({ entity, className, editing, fallbackLetterSize }) {
    let [sourceFinal, setSourceFinal] = useState('')

    console.log(entity)
    const name = entity.username || entity.name;

    let source = entity.icon;

    if (sourceFinal) {
        source = sourceFinal
    } else {
        if (!entity.icon && !entity.username) {
            //source = generateAvatar(entity.name, '', undefined, true)
            source = null;
            generateAvatar(name, '', {size: 500, customIcon:'/user-groups.svg'}).then((res) => {
                setSourceFinal(res)
            })
        } else if (!entity.icon) {
            source = generateAvatar(name, undefined, undefined, true)
        }
       
    }
    return (
        <img data-entity={entity.icon} className={className} src={source || editing}></img>
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
