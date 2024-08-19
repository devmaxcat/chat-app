import React from 'react'

document.oncontextmenu = function (e) {
  if (!(e.shiftKey)) {
    e.preventDefault()
  }
}

export default function GenericContextMenu({ buttons, title, context }) {
  console.log(context)
  if (context.open == false) {
    return (<></>)
  }
  
  return (
    <div className='context-menu' style={{left: context.position.x + 3, top: context.position.y + 3}}>
      <div className='title'>
        {title}
      </div>
      {buttons.map((item, i) => (<ContextItem key={i} item={item} />))}
    </div>
  )
}

function ContextItem({ item }) {
  if (!item) {
    return
  }

  return (
    <div className='context-item' onMouseUp={(e) => e.stopPropagation()} onClick={(e) => {  item.callback() }}>
      {item.label}
    </div>
  )
}