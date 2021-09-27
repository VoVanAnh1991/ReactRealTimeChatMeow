import React, {useEffect, useState} from 'react';
import './App.css';
// import SignIn from './components/features/SignIn';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import PageUser from './components/features/PageUser';
import PageNotFound from './components/features/PageNotFound';
import Auth from './auth/Auth';
import styled from "styled-components";

function App() {
  return (
    <div className="App">
      <Router>
        <Auth>
          <Switch>
            <Route exact path="/">
              <PageUser/>
            </Route>
            <Route path="*">
              <PageNotFound/>
            </Route>
          </Switch>
        </Auth>
        <ViewTooSmallContainer>
          <ViewTooSmall>
            <h1>This web app <br/>is available <br/>for resolutions <br/>from 800x600
              <h2>Please try again <br/> with following options: <br/>*Maximizing your screen*,<br/>*Landscape mode*<br/>or *Another device*</h2>
            </h1>
          </ViewTooSmall>
        </ViewTooSmallContainer>
      </Router>
    </div>
  );
}

export default App;

const ViewTooSmallContainer = styled.div `
  @media screen and (max-width: 700px)
    { display: flex; }

  position: fixed;
  top: 0;
  display: none;
  font-family: 'Lucida Grande', Verdana, sans-serif;
  width: 100vw;
  min-height: 100vh;
  z-index: 99999;
  justify-content: center;
  align-content: center;
`
const ViewTooSmall = styled.div `
  align-items: center;  
  display:flex;
  width: 60vh;
  margin: auto;
  height: 60vh;
  background: white;
  border: 2vh solid var(--light-main);
  border-radius: 4vh;
  padding: 8vh;
  text-align: center;
  box-shadow: 0 1vh 1vh rgba(0, 0, 0, 0.25);
  > h1 {
    width: 100%;
    font-size: 3vh;
    color: var(--dark-main);
    text-decoration: none;
    > h2 {
      line-height: 5vh;
      width: 100%;
      font-size: 3.3vh;
      color: var(--mid-main);
    }
  }  
 
`