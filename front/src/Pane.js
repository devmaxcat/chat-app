import React, { useState } from 'react'

import { Outlet, Link } from "react-router-dom";


export default function Pane() {
  
    return (
        <div id='pane'>
           <Outlet></Outlet>
        </div>
    )
}

function Topbar() { // Display information about current pane focus
    return (
        <div>

        </div>
    )
}