import { useLocation } from "react-router"
import Login from "./Login"
import Register from "./Register"

export default function Auth() {
    const location = useLocation()
    return (
        <div className='authenticate'>
            {location.pathname.includes('login')
                ?
                (
                    <>
                        <Login></Login>
                        <div className='authpage-logo logo'>
                            Chat App
                        </div>
                    </>
                )
                :
                (
                    <>

                        <div className='authpage-logo logo'>
                            Chat App
                        </div>
                        <Register></Register>
                    </>
                )}

        </div>
    )

}
