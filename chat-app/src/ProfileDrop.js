import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { UserContext } from "./App";
import { Link } from "react-router-dom";
import ActivityIcon from "./Profile/ActivityIcon";

export default function User() {
    const navigate = useNavigate()
    const user = useContext(UserContext);

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div className={`profile-dropdown ${isOpen}`} onClick={() => {
                setIsOpen(!isOpen)
            }}>
                <div className="smallname">
                    <img src={user.icon}></img>
                    {user ? user.displayName || user.username : ''}
                </div>

                <i class="fa-solid fa-chevron-down"></i>
                <div className={`profile-dropdown-menu`}>
                    <div className='profile-small w-interact'>
                      
                        <div className='pfp'>
                            <img src={user?.icon || '/default-user-pfp.webp'}></img>
                            <ActivityIcon user={user} />
                        </div>

                        {user.displayName || user.username}
                    </div>
                  

                    <Link to={'/me/settings/profile'} className="action-button">
                        Edit Profile
                    </Link>
                    <button className="action-button secondary-grey">
                        Copy User ID
                    </button>
                    <button className="action-button secondary-grey" onClick={() => {
                        fetch('http://localhost:443/api/auth/logout', {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'content-type': 'application/json'
                            },
                        })
                            .then((response) => response.json())
                            .then((data) => {

                                navigate('/login')
                                window.location.reload()
                            })
                    }}>
                        Logout
                    </button>
                </div>
            </div>

        </>
    )
}


