import React, { useEffect, useState } from 'react'

function useUserSelection() {
    const [selection, setSelection] = useState(document.getSelection())
   
    useEffect(() => {
        document.addEventListener("selectionchange", () => {
            console.log('event recieved')
            setSelection(document.getSelection())
          });
    }, [])
    

    return selection
}

export default useUserSelection
