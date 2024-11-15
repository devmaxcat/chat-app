import React from 'react'
function stringToColor(str) {
    console.log('strrr', str)
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

function ProfilePicture({entity, className, editing, fallbackLetterSize}) {
  
    
    const name = entity.username || entity.name;
    const color = stringToColor(name);
    let source = entity.icon;
    if (entity.icon || editing || !entity.username) {
        if (!entity.icon && !entity.username) {
            source = '/default-group-pfp.webp'
        }
        return (
            <img className={className} src={source || editing}></img>
        )
    } else {
        return (
            <div className='fallback-picture pfp'>
                <div className='letter' style={{fontSize: fallbackLetterSize + 'em'}}>
                {name.slice(0,1).toUpperCase()}
                </div>
               
                <div className='img' style={{backgroundColor: color}}></div>
            </div>
            
        )
    }
   
}

export default ProfilePicture
