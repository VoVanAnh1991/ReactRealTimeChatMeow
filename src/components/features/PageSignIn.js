import React, { useEffect, useRef, useState } from 'react';
import firebase from 'firebase';
import { useDispatch, useSelector } from 'react-redux';
import { auth, db, ggProvider } from '../../services/firebase/firebase';
import { setLoading, loadingState, setSignIn } from '../../features/userSlice';
import styled from "styled-components";
import imgLogo from "../../images/Logo.png";
import imgSignUp from "../../images/Homepage-SignUp.png";
import imgSignInManual from "../../images/Homepage-SignIn.png";
import imgSignInGG from "../../images/Homepage-SignInGG.png";
import imgSubmitBtn from "../../images/Submit.png";
import InnerLoading from './InnerLoading';
import Header from '../common/Header';

function SignIn() {
  const [existedData,setExistedData] = useState({users: [], emails: []}); 
  useEffect(() => {
    dispatch(setLoading({loading: false}));
    let existedUsernames=[], existedEmails=[];
    db.collection('users').get().then(query=> {
      if (query.docs.length > 0) {
        query.forEach(user =>{
          existedUsernames = [...existedUsernames, user.data().username];
          existedEmails = [...existedEmails, user.data().email];
        }) 
      }
      setExistedData({users: existedUsernames, emails: existedEmails});
    })
  },[])

  const Refs = {username: useRef(null), password: useRef(null), newUsername: useRef(null), password1: useRef(null), password2: useRef(null), email: useRef(null)};
  const [view, setView] = useState('HomepageView')
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signUpInfo, setSignUpInfo] = useState({username: '', password1: '', password2: '', email: ''})
  const [errorMsg, setErrorMsg] = useState({text: '', isErrorMsgShown: 'hidden'})
  const [validateSignUp, setValidateSignUp] = useState({
    isInvalid: true,
    reStyleBtn: {filter: 'grayscale(100%)', pointerEvents: 'none'}});
  const [validateSignIn, setValidateSignIn] = useState({
    isInvalid: true,
    reStyleBtn: {filter: 'grayscale(100%)', pointerEvents: 'none'}});
  const dispatch = useDispatch();
  const loading = useSelector(loadingState);

  const toggleView = (e) => {
    switch (e.target.name) {
      case 'SignUpView':
        setErrorMsg({text: `Please enter all information above to Sign Up.`, isErrorMsgShown:'visible'});
        break;
      default:
        setUsername('');
        setPassword('');
        setSignUpInfo({username: '', password1: '', password2: '', email: ''});
        setErrorMsg({isErrorMsgShown:'hidden'});
    };
    setView(e.target.name);
  } 
  //SignUp
  const onValidateSignUp = () => {
    let newUser = Refs.newUsername.current.value;
    let password1 = Refs.password1.current.value;
    let password2 = Refs.password2.current.value;
    let newEmail = Refs.email.current.value;
    
    newUser.includes(' ')?
      (setErrorMsg({text: "Username can't content a space.", isErrorMsgShown:'visible'})): 
      (newUser!=='' && (existedData.users.includes(newUser)) || newUser.startsWith('gg.'))?
        (setErrorMsg({text: "This username is not available.", isErrorMsgShown:'visible'})): 
        (newUser!=='' && password1!==password2 && (password1!=='' || password2!=='')) ?
          setErrorMsg({text: "Passwords wasn't matched.", isErrorMsgShown:'visible'}) :
            (newUser==='' || password1==='' || password2==='' ) ?
              setErrorMsg({text: `Please enter all the above fields.`, isErrorMsgShown:'visible'}) :
              !newEmail.includes('@')? 
              setErrorMsg({text: "Email address must include '@'.", isErrorMsgShown:'visible'}) : 
                existedData.emails.includes(newEmail) ?
                  setErrorMsg({text: "This email is not available.", isErrorMsgShown:'visible'}) : 
                  setErrorMsg({text: '', isErrorMsgShown: 'hidden'}) ;

    ( existedData.users.includes(newUser) || existedData.emails.includes(newEmail) || newUser.includes(' ')
    || newUser==='' || password1==='' || password2==='' || password1!== password2 || newEmail==='' || !newEmail.includes('@'))? 
      setValidateSignUp({
        isInvalid: true, 
        reStyleBtn: {filter: 'grayscale(100%)', pointerEvents: 'none'}}) : 
      setValidateSignUp ({
        isInvalid: false})
  }
  
  const setPasswords = (e) => {
      e.target.name==="password1"? 
        setSignUpInfo({...signUpInfo, password1: e.target.value}): 
        setSignUpInfo({...signUpInfo, password2: e.target.value});
      onValidateSignUp();
  }
  //submit
  const onSignUpSubmit = (e) => {
    e.preventDefault();
    dispatch(setLoading({loading: true}));
    db.collection('users').add({
      nickname: signUpInfo.username,
      displayName: signUpInfo.username,
      password: signUpInfo.password1,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      email: signUpInfo.email,
      username: signUpInfo.username,
      avatar: 'https://my-meow-chat.web.app/static/media/Logo.ca25a2e2.png',
    }).then( () => {
      e? toggleView(e) : toggleView('Home'); 
      setErrorMsg({text:`${signUpInfo.username} is created!`, isErrorMsgShown:'visible'})
      dispatch(setLoading({loading: false}));
    })
  }

  const onSignInManualSubmit = () => {
    if (password==='') {
      setErrorMsg({text:"Please enter all the above fields.", isErrorMsgShown:'visible'})
    }
    else {
      dispatch(setLoading({loading: true}));
      db.collection('users')
      .where("username",'==',username)
      .where("password",'==',password)
      .get()
      .then((query) => {
        if (query.docs.length > 0) {
            query.forEach((user) => {
              dispatch( setSignIn( {user: user.data(), userId: user.id } ))
            })
        } else {
          setErrorMsg({text:"Username & password is incorrect.", isErrorMsgShown:'visible'});
        }
        dispatch(setLoading({loading: false}));
      })
    }
  }

  //html
  const switchView = (view) => {
    switch (view) {
      case 'SignUpView':
        return(<form onSubmit={onSignUpSubmit}>
          <Input>
            <input
            className="signUpInput" placeholder="Username" value={signUpInfo.username}  
            ref={Refs.newUsername} onKeyDown={e =>  e.key === "Enter" &&  Refs.password1.current.focus()}
            onChange={e => {setSignUpInfo({...signUpInfo, username: e.target.value.toLowerCase()}); onValidateSignUp()}}
            />
          </Input>
          <Input>
            <input className="signUpInput" name="password1" placeholder="Password" type="password"
              ref={Refs.password1} value={signUpInfo.password1} 
              onChange={setPasswords}
              onKeyDown={e =>  e.key === "Enter" &&  Refs.password2.current.focus()}
              onClick={()=>setSignUpInfo({...signUpInfo, password1: ''})}
              />
          </Input>
          <Input>
            <input className="signUpInput" name="password2" placeholder="Re-enter Password" type="password"
              ref={Refs.password2} value={signUpInfo.password2}
              onChange={setPasswords}
              onKeyDown={e =>  e.key === "Enter" &&  Refs.email.current.focus()}
              onClick={()=>setSignUpInfo({...signUpInfo, password2: ''})}
            />
          </Input>
          <Input>
            <input className="signUpInput" name="email" type="email" placeholder="Email"
              ref={Refs.email} value={signUpInfo.email} 
              onChange={e => {setSignUpInfo({...signUpInfo, email: e.target.value.toLowerCase()}) ; onValidateSignUp()}}
            />
          </Input>
          <Button style={validateSignUp.reStyleBtn}>
            <button className="coolBeans submitBtn" type="submit" disabled={validateSignUp.isInvalid}> 
              {
                loading? (<div><InnerLoading/></div>) :
                (<img alt="" src={imgSubmitBtn} name="SignInManualView" onClick={onSignUpSubmit}/>)
              }
            </button>
          </Button>
          <Button>
            <button className="goToBtn" onClick={toggleView} type="button">Back</button>
          </Button>
        </form>);
      case 'SignInManualView':
        return( <form>
          <Input>
            <input className="signInManualInput" name="username"  placeholder="Username"
              ref={Refs.username} value={username} onChange={e => setUsername(e.target.value.toLowerCase())}
              onFocus={() => setErrorMsg({isErrorMsgShown: 'hidden'})}
              onKeyDown={e =>  e.key === "Enter" &&  Refs.password.current.focus()}
            />
          </Input>
          <Input>
              <input className="signInManualInput" name="password"  placeholder="Password" type="password" 
              ref={Refs.password} onClick={()=> setPassword('')} onFocus={()=>setErrorMsg({isErrorMsgShown: 'hidden'})} value={password}
              onChange={e => {
                setPassword(e.target.value);
                e.target.value===''? 
                  setValidateSignIn({ isInvalid: true, reStyleBtn: {filter: 'grayscale(100%)', pointerEvents: 'none'}}): 
                  setValidateSignIn ({isInvalid: false}) }}
                onKeyDown={e =>  e.key === "Enter" &&  onSignInManualSubmit()}
            />
            </Input>
          <Button style={validateSignIn.reStyleBtn}>
            <button className="coolBeans submitBtn" type="button" onClick={onSignInManualSubmit}
             disabled={validateSignIn.isInvalid} > 
              {
                loading? (<div><InnerLoading/></div>) : (<img alt="" src={imgSubmitBtn}/>)
              }
            </button>
          </Button>
          <Button>
            <button className="goToBtn" type="button" name="SignUpView"
            onClick={toggleView} >Sign Up</button>
            <button className="goToBtn" type="button" 
            onClick={toggleView} >Back</button>
          </Button>
        </form>);
      default:
        return(<>
          <Button>
            <button className="coolBeans signUpBtn"  type="button">
              <img alt="" src={imgSignUp} name="SignUpView" onClick={toggleView}/>
            </button>
          </Button>
          <Button>
            <button className="coolBeans signInBtn"  type="button">
              <img alt="" src={imgSignInManual} name="SignInManualView" onClick={toggleView}/>
            </button>
          </Button>
          <Button>
            <button className="coolBeans signInBtn"  type="button">
              <img alt="" src={imgSignInGG} name="SignInGGView" 
              onClick= {() => auth.signInWithPopup(ggProvider).catch(error => alert(error.message))}/>
            </button>
          </Button>
        </>);
    };
  }

  return ( 
    <SignInContainer> 
      <Header PageSignIn={true}/>      
      <InnerContainer>
        { (view !== "SignUpView")?
          <LogoHome alt="" src={imgLogo}/>
          :
          <Logo alt="" src={imgLogo}/>
        }
        <InfoContainer>
            {switchView(view)}
        </InfoContainer>

        <ErrorMsgContainer>
          <ErrorMsg style={{visibility: errorMsg.isErrorMsgShown}}> {errorMsg.text} </ErrorMsg>
        </ErrorMsgContainer>
      </InnerContainer>
    </SignInContainer>
  )
}

export default SignIn;

//Style
const SignInContainer = styled.div `
  overflow: hidden;
  font-family: 'Lucida Grande', Verdana, sans-serif;
  height: 100vh;
  display: grid;
  place-items: center;

  @media screen and (max-width: 700px) { 
    display: none; 
  }
`;

const LogoHome = styled.img `
  height: 170px;
  margin-bottom: 13px;

  @media screen and (max-height: 450px) { 
    height: 115px;
    margin-bottom: 7px;
  }
`
const Logo = styled.img `
  height: 100px;
  margin-bottom: 7px;

  @media screen and (max-height: 450px) { 
    height: 70px;
    margin-bottom: 5px;
  }
`

const InnerContainer = styled.div `
  position: relative;
  font-size: 0;
  margin: auto;
  width: 240px;
  height: 365px;
  background: var(--light-main);
  border: 10px solid white;
  border-radius: 20px;
  padding: 20px 30px;
  text-align: center;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.25);

  @media screen and (max-height: 450px) { 
    width: 170px;
    height: 250px;
    border: 7px solid white;
    border-radius: 14px;
    padding: 14px 21px;
    text-align: center;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.25);
  }
`;

const ErrorMsgContainer = styled.div `
  position: absolute;
  top: 425px;
  right: -65px;
  height: fit-content;
  width: 430px;
  display: flex;
  justify-content: center;

  @media screen and (max-height: 450px) { 
    top: 280px;
    right: -45px;
    width: 300px;
  }
`;

const ErrorMsg = styled.div `
  font-size: 14pt;
  color: var(--dark-main);
  background: white;
  border: 6px solid var(--light-main);
  border-radius: 15px;
  padding: 6px 13px;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.25);

  @media screen and (max-height: 450px) { 
    font-size: 12pt;
    color: var(--dark-main);
    background: white;
    border: 5px solid var(--light-main);
    border-radius: 10px;
    padding: 4px 9px;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.25);
  }
`;

const InfoContainer = styled.div `
  margin: 0;
  padding: 3px 0 0 0;
  height: 20px;

  @media screen and (max-height: 450px) { 
    padding: 2px 0 0 0;
    height: 14px;  
  }
`;

const Button = styled.div `
    display: flex;
    justify-content: center;
    border-radius: 20px;
    margin: 0 0 10px 0;
    padding: 0;
  
  > button {
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    position: relative;
    border: none;
    transition: transform 0.2s, background-color 0.2s;
    outline: none;
    border-radius: 20px;
  }

  > button::after, button::before {
    border-radius: 2px;
  }
    
  > .signUpBtn {
    width: 230px;
    background-color: var(--mid-main);
    img {
      object-fit: contain;
      padding: 8px;
      height: 40px;
    }
  }
  
  > .signInBtn {
    width: 230px;
    background-color: white;
    img {
      object-fit: contain;
      padding: 8px;
      height: 33px;
    }
  }

  > .submitBtn {
      width: 100px;
      margin-top: 5px;

    > img {
      object-fit: contain;
      padding: 2px;
      height: 33px;
    }

    > div {
      display: flex;
      align-items: center;
      padding: 2px;
      height: 33px;
    }

    background-color: var(--mid-main);
  }

  > .goToBtn {
    font-weight: bold;
    font-size: 13.5pt;
    color: var(--mid-main);
    background-color: transparent;
    margin: 0 10px;
    text-decoration-line: underline;
  }

  > .coolBeans {
    border-radius: 130px;
    overflow: hidden;
    position: relative;
    transition: 0.1s transform ease-in-out;
    will-change: transform;
    z-index: 0;
  }
  
  > .signUpBtn::after, .submitBtn::after {
    background-color: brown;
  }
  
  > .signInBtn::after {
    background-color: #FAFAD2;
  }

  > .coolBeans::after {
    border-radius: 20px;
    content: '';
    display: block;
    height: 100%;
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-100%, 0) rotate(10deg);
    transform-origin: top left;
    transition: 0.2s transform ease-out;
    will-change: transform;
    z-index: -1;
  }

  > .coolBeans:hover {
    transform: scale(1.05);
    will-change: transform;
  }

  > .coolBeans:hover::after {
    transform: translate(0, 0);
  }
  
  > .goToBtn:hover {
    color: white;
    transform: translate(0, 0);
  }

  @media screen and (max-height: 450px) { 
      border-radius: 14px;
      margin: 0 0 5px 0;
    
    > button {
      border-radius: 14px;
    }

    > button::after, button::before {
      border-radius: 1.4px;
    }
      
    > .signUpBtn {
      width: 160px;
      margin-top: 1px;
      img {
        padding: 6px;
        height: 28px;
      }
    }
    
    > .signInBtn {
      width: 160px;
      margin-top: 2px;
      img {
        padding: 6px;
        height: 23px;
      }
    }

    > .submitBtn {
        margin-top: 2px;

      > img, div {
        padding: 1px;
        height: 30px;
      }
    }

    > .goToBtn {
      font-size: 12pt;
      margin-top: 0;
    }
  }
`;

const Input = styled.div `
  position: relative;
  display: flex;
  justify-content: center;
  
> input {
  text-align: center;
  font-weight: bolder; 
  color: var(--dark-main);
  font-size: 13pt;
  background: white;
  border-radius: 20px;
  display: flex;
  width: fit-content;
  width: 230px;
  justify-content: center;
  border: none;
  outline: none;
  margin: 4px 0;
}

.signUpInput {
  padding: 10px;
}

.signInManualInput {
  margin: 6px 0;
  padding: 13px 0;
}

> input::placeholder {
  color: var(--dark-main);
  font-weight: normal; 
}

> input::-ms-input-placeholder {
  color: var(--dark-main);
  font-weight: normal; 
}

@media screen and (max-height: 450px) {
  
  > input {
    width: 100%;
    font-size: 12pt;
    border-radius: 20px;
    margin: 2.8px 0;
  }
  
  .signUpInput {
    padding: 4px 0;
  }
  
  .signInManualInput {
    margin: 3px 0;
    padding: 7px 0;
    }
  }
`;