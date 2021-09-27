import React from 'react'
import styled from 'styled-components'
import { SemipolarSpinner } from 'react-epic-spinners'

function PageLoading({marginBottom, color}) {
    return (
        <LoadingContainer>     
               <SemipolarSpinner id="spinner1" 
               style={marginBottom && {marginBottom: marginBottom}} color={color? color : 'var(--dark-main)'} size={"300"}/>
               <SemipolarSpinner id="spinner2" color={color? color : 'var(--dark-main)'} size={"250"}/>
        </LoadingContainer>
    )
}

export default PageLoading

const LoadingContainer = styled.div`
    height: 100vh;
    display: grid;
    place-items: center;
    width: 100%;
    > #spinner2 {
            display: none;
        }
`