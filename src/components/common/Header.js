import React, { useState } from 'react'
import { removeUser, userIdState, userState } from '../../features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import firebase from 'firebase';
import { auth, db } from '../../services/firebase/firebase';
import styled from "styled-components";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import BackspaceIcon from '@material-ui/icons/Backspace';
import NotificationsActiveIcon  from '@material-ui/icons/NotificationsActive';
import { removeRoomOption } from '../../features/roomSlice';

function Header({PageSignIn, onSignOut}) {
    const [modal, setModal] = useState({isShown: false});
    const userId = useSelector(userIdState);
    const user = useSelector(userState);
    const dispatch = useDispatch();
    const userStatusFirestoreRef = db.doc('/status/' + userId);

    const sendTaskToAdmin = () => {
        const task = prompt('Send Question to Admin:');
        if (task) {
            db.collection('adminTeam').doc('tasks').collection('ongoingTasks').add({
                from: 'user',
                task,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: userId,
                user: user.username,
            });
            alert(`Thank you! Your question is sent to our Admin Team. \n We will respond as soon as posible!`);
        }
    }

    return (
        <>
            <HeaderContainer>
                <HeaderRight>
                    { !PageSignIn && <NotificationsActiveIcon onClick={()=>setModal({isShown: true})}
                        style={ {display: 1===1?'none' :'block', backgroundColor: 'red'} } /> 
                    }

                    <HelpOutlineIcon onClick={sendTaskToAdmin}/>
                
                    <InfoOutlinedIcon onClick={() => 
                        alert(`*** About Meow Chat *** \n Võ Vân Anh @ 2021 \n`)}/>

                    { !PageSignIn && <ExitToAppIcon style={{backgroundColor: 'var(--dark-main)'}} 
                        onClick={()=>{ const askOnSignOut = window.confirm('Sign Out?');
                        if (askOnSignOut) {
                            dispatch(removeUser());
                            dispatch(removeRoomOption());
                            auth.signOut();
                            userStatusFirestoreRef.set(onSignOut)
                            alert("You've Signed Out")}
                        }}/>
                    }

                </HeaderRight>

            </HeaderContainer>
            <SettingModal style={ modal.isShown? {visibility: 'visible'} : {visibility: 'hidden'}}>
                <BackspaceIcon onClick={() =>setModal({isShown: false})}/>
            </SettingModal>
        </>
    )
}

export default Header

const HeaderContainer = styled.div `
    position: fixed;
    width: 100%;
    height: 33px;
    background-color: transparent;
    align-self: flex-start;
    align-items: center;
    z-index: 999;
    padding: 3px 3px;
`

const HeaderRight = styled.div `   
    position: absolute;
    display: flex;
    right: 5px;
    border-radius: 20px;
    margin: 0 5px;
    padding: 0 5px;
    background-color: rgba(133, 91, 101, 40%);

    > .MuiSvgIcon-root {
        cursor: pointer;
        margin: 5px 2px;
        padding: 2px;
        opacity: initial;
        color: white;
        background-color: var(--mid-main);;
        border-radius: 50%;
        font-size: 20pt;
    }
`

const SettingModal = styled.div `
    display: flex;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index:9999;

    background-color: rgba(50, 20, 20, 70%);
    > .MuiSvgIcon-root {
        right: 0;
        color: white;
        font-size: 20pt;
    }
`