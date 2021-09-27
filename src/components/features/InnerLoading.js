import React from 'react'
import { LoopingRhombusesSpinner } from 'react-epic-spinners'

function InnerLoading({color,size}) {
    return (
        <LoopingRhombusesSpinner color={color? color : 'white'} size={size?.valueOf()}/>
    )
}

export default InnerLoading