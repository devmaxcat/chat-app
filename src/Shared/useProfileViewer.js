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
        if (context.open)  {
            document.addEventListener("mouseup", (() => {
                console.log('FUCK')
                setContext({
                    ...context,
                    open: false
                })
            }))
        }
        
        return () => {
            document.removeEventListener("mouseup", (() => {
                setContext({
                    ...context,
                    open: false
                })
            }))
        }
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
            console.log('ct click')
            e.stopPropagation()
            open(e.clientX, e.clientY, e)
        }
    }

    return {
        handleClick,
        context,
        open,

    }
}


