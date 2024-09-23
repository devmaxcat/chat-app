import React, { useReducer, useState } from 'react'

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
        case 'toggle': {
            if (!values.find((e) => e === action.value)) {
                action.type = true
                return valueReducer(values, action)
            } else {
                action.type = false
                return valueReducer(values, action)
            }
        }
    }
}

export default function GenericSelectionMenu({ list, title, context, onSelectionComplete, action }) {
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
            <div className='top'>
                <div className='row'>
                    <h3>{title}</h3>
                    <p>Select Recipients</p>
                </div>

                <i className='fa-solid fa-x' onClick={() => context.close()}></i>
            </div>
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
            <div className='values'>
                {sortedArray.map((user) => (
                    <div key={user._id} className='profile-small' onClick={() => handleSelection('toggle', user)}>
                        <input type='checkbox' checked={values.some((e) => e === user)}></input>
                        <img className='pfp' src={user.icon}></img>
                        <div className='name'>
                            {user.username}
                        </div>
                    </div>))}

            </div>

            <button className='action-button' onClick={() => onSelectionComplete(values)}>{action}</button>
        </div>

    )
}