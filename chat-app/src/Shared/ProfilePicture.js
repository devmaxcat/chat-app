import React from 'react'
import generateAvatar from 'profile-generator-js' // hey ! I wrote this package!


export function getAvatarFromUser(user = {username: ''}) {
    if (!user.icon) {
        return generateAvatar(user.username)
    } else {
        return user.icon
    }
}

function ProfilePicture({ entity, className, editing, fallbackLetterSize }) {


    const name = entity.username || entity.name;
    
    let source = entity.icon;

        if (!entity.icon && !entity.username) {
            source = '/default-group-pfp.webp'
        } else if (!entity.icon) {
            source = generateAvatar(name)
        }
        return (
            <img className={className} src={source || editing}></img>
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
