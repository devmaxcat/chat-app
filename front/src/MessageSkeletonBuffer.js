import React, { useEffect, useState } from 'react'

let totalFakes = 15;

function IntInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function EmptyString(length) {
    let result = '';
    let counter = 0;
    while (counter < length) {
        result += '_'
        counter += 1;
    }
    return result;
}


let randomSizes = [EmptyString(IntInterval(12, 19)),  EmptyString(IntInterval(8, 12)), EmptyString(IntInterval(25, 50)), EmptyString(IntInterval(25, 50)) [IntInterval(5, 10),IntInterval(3, 7)]]


export default function MessageSkeletonBuffer() {
    const [list, setList] = useState([])

    useEffect(() => {
        let template = []
        template.push('start')

        for (let i = 0; i < totalFakes; i++) {
            if (IntInterval(0, 2) == 0) {
                template.push(['start', ...randomSizes])

            } else if (IntInterval(0, 5) == 0) {
                template.push(['image', ...randomSizes])
            } else {
                template.push(['continue', ...randomSizes])
            }

        }
        setList(template)
    }, [])



    return (

        <div className='message-skeleton-buffer' >
            {list.map((e) => {
                if (e[0] == 'start') return (<FakeMessageHead e={e}></FakeMessageHead>)
                if (e[0] == 'continue') return (<FakeMessageCollapsed e={e}></FakeMessageCollapsed>)
                if (e[0] == 'image') return (<FakeMessageImage e={e}></FakeMessageImage>)
            })}

        </div>



    )
}

function FakeMessageHead({ e }) {
    return (<div className='message'>
        <div className='left'>
            <div className='img'></div>
        </div>
        <div className='right'>
            <div className='bar'>
                <div className='name'>
                    {e[1]}
                </div>
                <div className='time'>
                    {e[2]}
                </div>
            </div>
            <div>
                {e[3]}
            </div>
        </div>
    </div>)
}

function FakeMessageImage({ e }) {
    return (
        <div className='message collapsed'>
            <div className='gutter'></div>
            <div>
                <div className='content-image' style={{width: e[4][0],height: e[4][1]}}>

                </div>
            </div>
        </div>
    )
}

function FakeMessageCollapsed({ e }) {
    return (
        <div className='message collapsed'>
            <div className='gutter'></div>
            <div>
                <div >
                    {e[2]}
                </div>
            </div>
        </div>
    )
}

