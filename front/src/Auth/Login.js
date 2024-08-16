import { useContext, useState } from "react"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { useForm, SubmitHandler, set } from "react-hook-form"

import { UserContext } from "../App"



export default function Login() {
    const navigate = useNavigate()

    const userData = useContext(UserContext)
    const [responseError, setResponseError] = useState('')

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm()

    const onSubmit = (data) => {
        setResponseError('')
        fetch('http://localhost:443/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ username: data.username, password: data.password })
        })
            .then((response) => response.json())
            .then(async (data) => {
                if (!data.error) {
                    await userData.refreshUser()
                    navigate('/me')
                } else {
                    setResponseError(data.message)

                }


            })

    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='form auth'>
            <h1>Login</h1>
            <p className='form-description' >Stay connected!</p>


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

            <input type='submit' className='action-button'></input>
            <div className='error w-button'>{responseError}</div>
            <div className='oauth'>
                <div className='divider-text'><span>OR</span></div>
                <div className='oauth-provider'>
                    <p>Imagine OAuth2 providers here</p>
                </div>
                <div className='oauth-provider'>
                    <p>and here</p>
                </div>
            </div>

            <span className='auth-wrong-menu'>No account? <Link to={'/register'}>Create one.</Link></span>
        </form>
    )
}