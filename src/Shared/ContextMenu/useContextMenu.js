import { useEffect, useState } from "react"

export default function useContextMenu() {
    const [context, setContext] = useState({
        open: false,
        position: {
            x: 0,
            y: 0
        }
    })

    useEffect(() => {
        if (!context.open) { return }
        document.addEventListener("mouseup", (() => { // This and the event bound in GenericContextMenu.js within ContextItem  must be the same event, I'd use the "click" event but then it doesnt close old context menus, maybe find a solution to migrate towards the click event?
            setContext({
                ...context,
                open: false
            })
        }))
        return () => document.removeEventListener("mouseup", (() => {
            setContext({
                ...context,
                open: false
            })
        })
        )
     
    }, [context])

    const open = (x, y, e) => {
        setContext({
            ...context,
            open: true,
            target: e.currentTarget,
            position: {
               x: (x + 5), y: (y + 2)
            }
        })
    }

    const handleClick = () => {
        return (e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('click')
            open(e.clientX, e.clientY, e)
        }
    }

    return {
        handleClick,
        context,
        open,
        
    }
}


