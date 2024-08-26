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
        document.addEventListener("mouseup", (() => {
            setContext({
                ...context,
                open: false
            })
        }))
    }, [])

    const open = (x, y, e) => {
        setContext({
            ...context,
            open: true,
            target: e.currentTarget,
            position: {
                x, y
            }
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
        
    }
}


