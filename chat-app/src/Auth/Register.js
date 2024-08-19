import { useContext, useState } from "react"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { useForm, SubmitHandler, set } from "react-hook-form"

import { RequestContext, UserContext } from "../App"


export default function Register() {
    const navigate = useNavigate()

    const userData = useContext(UserContext)
    const requester = useContext(RequestContext)
    const [responseError, setResponseError] = useState('')
    const [busy, setBusy] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm()

    const onSubmit = async (form) => {
        setBusy(true)
        setResponseError('')
        let data = await requester(true, '/api/auth/register', 'POST', true, { username: form.username, password: form.password })
        setBusy(false)
        if (!data.error) {
            await userData.refreshUser()
            navigate('/me')
        } else {
            setResponseError(data.message)

        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='form auth'>
            <h1>Signup</h1>
            <p className='form-description' >Get connected... for free!</p>
            <label>Email</label>
            <div className='input-wrapper'>
                <input type='email' id='displayname' aria-invalid={errors.email ? "true" : "false"} {...register("email", { required: 'An email is required' })}></input>

            </div>
            <span className='form-validator-text'>{errors.email?.message}</span>

            <label>Display Name</label>
            <div className='input-wrapper'>
                <input id='displayname'  {...register("displayname", { required: 'A display name is required' })}></input>
            </div>
            <span className='form-validator-text'>{errors.displayname?.message}</span>

            <label>Username</label>
            <div className='input-wrapper'>
                <input id='username'  {...register("username", { required: 'A username is required' })}></input>
            </div>
            <span className='form-validator-text'>{errors.username?.message}</span>


            <label>Password</label>
            <div className='input-wrapper'>
                <input id='password'  {...register("password", { required: 'A password is required' })}></input>
            </div>
            <span className='form-validator-text'>{errors.password?.message}</span>

            <button className='action-button' disabled={busy}> 
                <span className="hide-disable">
                    Register
                </span>

                <div className="loader"></div>
            </button>


            <div className='error w-button'>{responseError}</div>
            <div className='divider-text'><span>OR</span></div>
            <div className='oauth-provider'>
                <p>Imagine OAuth2 providers here</p>
            </div>
            <div className='oauth-provider'>
                <p>and here</p>
            </div>

            <span className='auth-wrong-menu'>Already have an account? <Link to={'/login'}>Login.</Link></span>
        </form>
    )
}

