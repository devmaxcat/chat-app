import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import useUserSelection from '../../Hooks/useUserSelection'

document.oncontextmenu = function (e) {
  if (!(e.shiftKey)) {
    e.preventDefault()
  }
}

export default function GenericContextMenu({ buttons, title, context }) {
  const selection = useUserSelection()
  const ref = useRef()
  const [safePosition, setSafePosition] = useState({ x: 0, y: 0 })

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
    // if (context.open) {
    //   context.target?.classList.add('f-force')
    // } else {
    //   context.target?.classList.remove('f-force')
    // }
    return () => {context.target?.classList.remove('f-force')}
    
  }, [context])

  useEffect(() => {
    if (context.open == false) {
      return
    }

    let x = context.position.x
    let y = context.position.y

    let rect = ref.current.getBoundingClientRect()

    if (x + rect.width > window.innerWidth) {
      x = window.innerWidth - rect.width
    }

    if (y + rect.height > window.innerHeight) {
      y = window.innerHeight - rect.height
    }
    ref.current.style.left = x + 'px'
    ref.current.style.top = y + 'px'
    setSafePosition({ x, y })

  }, [context])






  // copyTextItem.decay = true
  // menu.items.push(copyTextItem)

  let safeX


console.log('context', context)
  if (context.open == false) {
    return (<></>)
  }
  console.log('opened ')


  return ReactDOM.createPortal(
    <div ref={ref} className='context-menu'>
      <div className='title'>
        {title}
      </div>
      {buttons.map((item, i) => (<ContextItem key={i} item={item} />))}
    </div>, document.querySelector('body')
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
    <div className='context-item'   onMouseUp={(e) => { item.callback() }}> 
      <div className='context-label-container'>
        {item.label}
        <div className='context-keybind'>
          {item.keybind}
        </div>

      </div>

    </div>
  )
}