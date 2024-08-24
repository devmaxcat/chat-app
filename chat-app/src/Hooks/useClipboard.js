import React, { useEffect, useState } from 'react'

function useClipboard() {
    const [clipboard, setClipboard] = useState(navigator.clipboard)

    async function permission(params) {
        let r = await navigator.permissions.query({ name: 'clipboard-read' });
        let w = await navigator.permissions.query({ name: 'clipboard-write' });

        if (r.state != 'granted') {

        }
        if (w.state != 'granted') {
            
        }
        
    }
    

    useEffect(() => {
        document.addEventListener("selectionchange", () => {
            selection = document.getSelection()
          });
    }, [])
   


    return clipboard
    
}

export default useClipboard
