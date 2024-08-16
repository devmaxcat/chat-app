import React, { useContext } from 'react'

let activityStatusClass = {
    0: 'offline',
    1: 'online',
    '-1': 'none'
}


export default function ActivityIcon({ user }) {
    let statusData = user?.activityStatus
    let idleTime = 1  // Minutes
    idleTime = idleTime * 60 * 1000

    let className;
    if (statusData && statusData.statusType != '-1') {
        if (new Date().getTime() - new Date(statusData.date).getTime() < idleTime ) {
            className = activityStatusClass[statusData.statusType]
        } else {
            className = activityStatusClass[0]
        }
        
    } else {
        className =  activityStatusClass['-1']
    }
   

  return (
    <div class={`activity-status ${className}`}></div>
  )
}
