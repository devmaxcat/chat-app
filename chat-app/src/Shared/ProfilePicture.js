import React from 'react'
function stringToColor(str) {
   
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
        color += ("00" + ((hash >> (i * 8)) & 0xFF).toString(16)).slice(-2);
    }
    return color;
}


function generateAvatar(
    text,
    foregroundColor = "white",
 
) {
    const canvas = document.createElement("canvas");
    
    const context = canvas.getContext("2d");

    canvas.width = 200;
    canvas.height = 200;

    // Draw background
    context.fillStyle = stringToColor(text.toUpperCase());
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = " 90px Arial";
    context.fillStyle = foregroundColor;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text.slice(0,1).toUpperCase(), canvas.width / 2, canvas.height / 1.8);
   
    return canvas.toDataURL("image/png");

}

export function getAvatarFromUser(user) {
    if (!user.icon) {
        return generateAvatar(user.username)
    } else {
        return user.icon
    }
}

function ProfilePicture({ entity, className, editing, fallbackLetterSize }) {


    const name = entity.username || entity.name;
    const color = stringToColor(name);
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
