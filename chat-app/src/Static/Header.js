import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../App'

function Header() {
    const userData = useContext(UserContext)
    console.log(userData)
    return (

        <div id='header'>
            <div className='logo animated'><a>C</a><a>h</a><a>a</a><a>t</a> <a>A</a><a>p</a><a>p</a>
            </div>
            <div className='header-right'>
                <Link>Support</Link>
                <Link>Developers</Link>
                {
                    userData?.error ?
                        (<>
                            <Link className='button button-primary' to={'/login'}>Login</Link>
                            <Link className='button button-primary' to={'/register'}>Signup</Link>
                        </>)
                        :
                        (<>
                            <Link to={'/me/friends'} className='pfp'>
                                <img src={userData.icon}></img>
                            </Link>
                        </>)

                }



            </div>

        </div>
    )
}

export default Header
