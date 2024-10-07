import React, { useReducer, useState } from 'react'

function valueReducer(values, action) {

    switch (action.type) {
        case true: {
            if (!values.find((e) => e === action.value))
                return [
                    ...values,
                    action.value
                ]
            return values
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
        default: {
            console.error('No action provided.')
        }
    }
}

export default function GenericSelectionMenu({ list, title, context, onSelectionComplete, action }) {
    const [query, setQuery] = useState('')
    const [values, dispatch] = useReducer(valueReducer, [])

    const sortedArray = list.sort((a, b) => b.username.indexOf(query) - a.username.indexOf(query)).filter((e) => e.username.indexOf(query) != -1);


    function handleSelection(state, value) {
        setQuery('')
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

                <span tabIndex={sortedArray.length + 1} className='material-symbols-outlined' onClick={() => context.close()}>close</span>
            </div>
            <div className='input-wrapper'>

                <div className='dropdown-selections'>

                    {values.map((e) => (<span className='dropdown-selection'><img src={e.icon}></img> {e.username} <span onClick={(event) => { handleSelection(false, e) }} class="x material-symbols-outlined">
                        close
                    </span></span>))}
                </div>

                <input
                tabIndex={1}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.code === 'Enter') {
                            handleSelection(true, sortedArray[0])
                        }
                        if (e.code === 'Backspace' && query === '') {
                            
                            handleSelection(false, values[values.length-1])
                            setQuery(values[values.length-1].username)
                            
                        }
                    }}
                    placeholder="Search..."
                />

            </div>
            <div className='values'>
                {sortedArray.map((user, index) => (
                    <div tabIndex={index + 1} key={user._id} onKeyDown={(e) => {
                        if (e.code === 'Enter') {
                            handleSelection('toggle', user)
                        }}} className='profile-small' onClick={() => handleSelection('toggle', user)}>
                        <input type='checkbox' checked={values.some((e) => e === user)}></input>
                        <img className='pfp' src={user.icon}></img>
                        <div className='name'>
                            {user.username}
                        </div>
                    </div>))}

            </div>

            <button tabIndex={sortedArray.length} className='action-button' onClick={() => onSelectionComplete(values)}>{action}</button>
        </div>

    )
}