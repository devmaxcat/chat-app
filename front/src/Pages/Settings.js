import React, { useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { UserContext } from '../App'
import { useForm } from 'react-hook-form'
import { Alert, AlertAction, AlertContext } from '../Chat'
import moment from 'moment'
import { Link } from 'react-router-dom'

const converter = {
    'profile': <TProfile />,
    'account': <TAccount />,
    'activity': <TActivityStatus />
}

export default function Settings() {
    const { specify } = useParams()
    const [tab, setTab] = useState(converter[specify])
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        setTab(converter[specify] || <TAccount />)
    }, [location])

    return (
        <div className='settings'>
            <div className='settings-sidebar'>
                <h2>Settings</h2>
                <Link className='channel-selector' to='/me/settings/account' >Account</Link>
                <Link className='channel-selector' to='/me/settings/profile' >Profile</Link>
                <Link className='channel-selector' to='/me/settings/activity' >Activity Status</Link>
            </div>
            <div>
                {tab}
            </div>
        </div>
    )
}
// Tabs
export function TAccount() {

    return (
        <div className='form'>
            <h3>Account</h3>
            <div>Account Info</div>
        </div>
    )
}

export function TProfile() {
    const userData = useContext(UserContext)
    const alerts = useContext(AlertContext)

    const [responseError, setResponseError] = useState('')
    const [profileEditImage, setProfileEditImage] = useState(userData.icon)

    const saveAlert = useRef(null)
    const editing = useRef(false)

    const {
        register,
        handleSubmit,
        watch,
        reset,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: {
            displayName: userData.displayName || userData.username,
            bio: userData.bio
        }

    })

    const [formValues, setFormValues] = useState(getValues())

    const onSubmit = async (event) => {
        const profileEditForm = document.getElementById('profileEditForm')
        setResponseError('')

        fetch('http://localhost:443/api/profile/update', {
            method: 'POST',
            credentials: 'include',
            headers: {

            },
            body: new FormData(profileEditForm),
        })
            .then((response) => response.json())
            .then(async (data) => {
                editing.current = false;
                if (!data.error) {
                    userData.refreshUser()
                } else {
                    setResponseError(data.message)
                }
            })
    }
    console.log(userData.joindate)
    useEffect(() => { // Watches input updates
        const subscription = watch((value, { name, type }) => {
            setFormValues(value)
            if (editing.current == false) { // Give a message to save when the form is altered
                saveAlert.current = alerts.alert(new Alert('info', 'Want to save your changes?', '', 0, [new AlertAction('primary', handleSubmit(onSubmit), 'Save'), new AlertAction('secondary', (owner) => { reset(); setProfileEditImage(userData.icon); editing.current = false; alerts.dismiss(owner) }, 'Discard')], 3, 200, 'fa-solid fa-floppy-disk'))
                editing.current = true
            }
        });
        return () => { subscription.unsubscribe(); alerts.dismiss(saveAlert) };

    }, [watch])


    return (
        <>
            <form className='form' id='profileEditForm' >
                <h3>Profile</h3>
                <div className='profile'>
                    <div className='bg-img'>
                        <img src='https://i0.wp.com/static.vecteezy.com/system/resources/previews/006/852/804/non_2x/abstract-blue-background-simple-design-for-your-website-free-vector.jpg?ssl=1'></img>
                    </div>
                    <div className='top'>
                        <div className='pfp-editor pfp' onClick={() => { document.querySelector('input[name="icon"]').click() }}>
                            <img src={profileEditImage} ></img>
                            <input name='icon' type='file' {...register("icon", {
                                onChange: (event) => { var reader = new FileReader(); reader.onload = (event) => { setProfileEditImage(event.target.result) }; reader.readAsDataURL(event.target.files[0]); }
                            })}></input>
                        </div>
                        <div className='name'>
                            <div className='display-name'>
                                {formValues.displayName}
                            </div>
                            <div className='username'>
                                {userData.username}
                            </div>
                        </div>
                    </div>
                    {formValues.bio ? (<>
                        <h4>About</h4>
                        <div className='bio'>
                            {formValues.bio}
                        </div>
                    </>) : '' }


                    <div>
                        <div>
                            <h5>Date Joined</h5>
                            {moment(userData.joindate).format('LL')}
                        </div>
                    </div>
                </div>
                <label>Display Name</label>
                <div className='input-wrapper'>
                    <input name='displayName' id='displayName'  {...register("displayName", { required: false })}></input>
                </div>
                <label>Bio</label>

                <div className='input-wrapper'>
                    <textarea {...register("bio", {})} name='bio' id='bio'  >

                    </textarea>

                </div>
                <span className='form-validator-text'>{errors.forEac}</span>
            </form>
        </>
    )


}


function TActivityStatus() {
    return (
        <h3>Activity Status</h3>
    )
}