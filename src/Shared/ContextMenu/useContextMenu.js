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
        function close(e) {
            console.log('uh')
            setContext({
                ...context,
                open: false
            })
        }
        if (context.open) {
            document.addEventListener("mouseup", close)
        }
        return () => document.removeEventListener("mouseup", close)

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


