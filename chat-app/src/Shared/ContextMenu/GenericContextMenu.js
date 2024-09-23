import React, { useEffect } from 'react'
import useUserSelection from '../../Hooks/useUserSelection'

document.oncontextmenu = function (e) {
  if (!(e.shiftKey)) {
    e.preventDefault()
  }
}

export default function GenericContextMenu({ buttons, title, context }) {
  const selection = useUserSelection()


  let selectionText = selection.toString()

  buttons = [...buttons,
  // Copy text
  {
    label: '_DIVIDER',
    hidden: selection.type != 'Range'
  },
  {
    label: 'Copy',
    keybind: 'CTRL+C',
    callback: () => {
      console.log('write')
      navigator.clipboard.writeText(selectionText)
    },
    hidden: selection.type != 'Range'
  }
  ]


  useEffect(() => {
    if (context.open) {
      context.target?.classList.add('f-force')
    } else {
      context.target?.classList.remove('f-force')
    }
    return () => {context.target?.classList.remove('f-force')}
    
  }, [context])






  // copyTextItem.decay = true
  // menu.items.push(copyTextItem)



  if (context.open == false) {
    return (<></>)
  }

  return (
    <div className='context-menu' style={{ left: context.position.x + 3, top: context.position.y + 3 }}>
      <div className='title'>
        {title}
      </div>
      {buttons.map((item, i) => (<ContextItem key={i} item={item} />))}
    </div>
  )
}

function ContextItem({ item }) {
  if (!item || item.hidden == true) {
    return
  }

  if (item.label == '_DIVIDER') {
    return (
      <hr>

      </hr>
    )
  }

  return (
    <div className='context-item'  onMouseUp={(e) => { item.callback() }}> 
      <div className='context-label-container'>
        {item.label}
        <div className='context-keybind'>
          {item.keybind}
        </div>

      </div>

    </div>
  )
}