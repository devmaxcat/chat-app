import { useEffect, useState } from "react"

export default function useSelectionMenu() {
    const [context, setContext] = useState({
        open: false,
        position: {
            x: 0,
            y: 0
        },
        close: function () {
            setContext({...this, open: false})
        }
    })


    const open = (x, y, e) => {
        setContext({
            ...context,
            open: true,
            position: {
                x, y
            }
        })
    }

    const close = () => {
        setContext({
            ...context,
            open: false,
        })
    }

    const handleClick = () => {
        return (e) => {
            
            open(e.clientX, e.clientY, e)
        }
    }

    return {
        handleClick,
        context,
        open,
        close,
        
    }
}


