import React, { Suspense, useState } from 'react'

export default function ImageWrapper({ source, size, fallback, shouldNotFail, className }) { // if shouldFail is true then if the image fails to load it will display a failed load icon, otherwise it will just show the fallback.
    return (
      
            <ImageInner source={source} size={size} className={className}></ImageInner>
       

    )
}

function ImageLoading({ className, source, size }) {
    return (
        <img className={className + ' loading'} style={{
            width: size?.x,
            height: size?.y
        }}></img>
    )
}

function ImageInner({ className, source, size }) {
    const [errored, setErrored] = useState(false)
    
   
    if (!errored) {
        return (
            <img onError={() => setErrored(true)} className={className} src={source} style={{
                width: size?.x,
                height: size?.y
            }}></img>
        )
    } else {
        return (
            <img className={className + ' error'} style={{
                width: size?.x,
                height: size?.y
            }}></img>
        )
    }
   
}


