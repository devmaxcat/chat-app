import React, { act, useContext, useReducer, useState } from 'react'
import { FriendsContext } from '../Chat'

export default function CreateChannel() {
    const friends = useContext(FriendsContext).asFriendsList()
    return (
        <>
            <div className='channel-selector'><i class="fa-solid fa-message"></i>+ Create New</div>
            <div>

                <UserSelectionMenu users={friends}></UserSelectionMenu>
            </div>
        </>

    )
}

function UserSelectionMenu({ users }) {
    let template = (user, _selector, handleSelection, values) => {

        return (

            <div key={user._id} className='profile-small'>
                <_selector value={user} handleSelection={handleSelection} values={values}></_selector>
                <img className='pfp' src={user.icon}></img>
                <div className='name'>
                    {user.username}
                </div>
            </div>

        )
    }
    return (
        <GenericSelectionMenu template={template} list={users}></GenericSelectionMenu>
    )
}

function valueReducer(values, action) {
    switch (action.type) {
        case true: {
            if (!values.find((e) => e === action.value))
                return [
                    ...values,
                    action.value
                ]
        }
        case false: {
            return values.filter((e) => e !== action.value)
        }
    }
}

function _selector({ value, handleSelection, values }) {
    const [checked, setChecked] = useState(values.some((e) => e === value))

    function handleChange(e) {
        console.log(!checked)
        setChecked(!checked)
        handleSelection(!checked, value)
    }
    console.log(checked)
    return (
        <>
            <div>
                {checked}
            </div>

            <div>

                <input type='checkbox' checked={checked} onChange={handleChange}></input>
            </div>
        </>

    )
}

function GenericSelectionMenu({ template, list }) {
    const [query, setQuery] = useState('')
    const [values, dispatch] = useReducer(valueReducer, [])
    const sortedArray = list.sort((a, b) => b.username.indexOf(query) - a.username.indexOf(query)).filter((e) => e.username.indexOf(query) != -1);

    function handleSelection(state, value) {
        dispatch({
            type: state,
            value: value
        })
    }



    return (

        <div className='selection-modal'>
            <div className='input-wrapper'>
               
                <div className='dropdown-selections'>
                
                {values.map((e) => (<span className='dropdown-selection'> {e.username}</span>))}
                </div>
               
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                />

            </div>
            {sortedArray.map((e) => template(e, _selector, handleSelection, values))}
            
        </div>

    )
}

// Template child key should be equal to its value
