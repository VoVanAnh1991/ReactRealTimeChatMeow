import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

function PageNotFound() {
    return (
        <PageNotFoundContainer>
            <InnerContainer>
                <h1>PAGE NOT FOUND</h1>
                <Link to="/">Go Back</Link>
            </InnerContainer>
        </PageNotFoundContainer>
    )
}

export default PageNotFound
const PageNotFoundContainer = styled.div`
    font-family: 'Lucida Grande', Verdana, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    min-height: 100vh;
`

const InnerContainer = styled.div `
    font-size: 20pt ;
    margin: auto;
    width: 240px;
    height: 365px;
    background: white;
    border: 10px solid var(--light-main);
    border-radius: 20px;
    padding: 20px 30px;
    text-align: center;
    box-shadow: 0 3px 3px rgba(0, 0, 0, 0.25);

    > h1, > .Link {
        color: var(--dark-main);
        text-decoration: none;
    }  
`;