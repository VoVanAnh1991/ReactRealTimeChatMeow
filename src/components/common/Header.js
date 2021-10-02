import React, { useEffect, useState } from 'react'
import { removeUser, userIdState, userState } from '../../features/userSlice';
import { haveNotiState, removeRoomOption, roomIdState, roomTypeState, setHaveNoti } from '../../features/roomSlice';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { auth, db } from '../../services/firebase/firebase';
import firebase from 'firebase';
import styled from "styled-components";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import NotificationsActiveIcon  from '@material-ui/icons/NotificationsActive';
import InnerLoading from '../features/InnerLoading';
import Notification from './Notification';

function Header({PageSignIn, onSignOut}) {
    const dispatch = useDispatch();
    const userId = useSelector(userIdState);
    const roomId = useSelector(roomIdState);
    const roomType = useSelector(roomTypeState);
    const user = useSelector(userState);
    const haveNoti = useSelector(haveNotiState);
    const [modalIsShown, setModalIsShown] = useState(false);
    const [notiRoomsState, setNotiRoomsState] = useState();
    const [loading, setLoading] = useState(true);
    
    const userStatusFirestoreRef = db.doc('/status/' + userId);
    const [lastVisitedStatuses] = useCollectionData( db.collection('users/'+ userId + '/status') );
    const [watchingRooms] = useCollectionData( db.collection('rooms') );
    const [watchingUserRooms] = useCollectionData( userId &&
        db.collection('userRooms').where('roomUserIds','array-contains',userId)
    );
    
    const setLastVisited = () => {
        (userId && roomId) && db.doc('users/'+userId+'/status/'+roomId).set({
            lastVisited: firebase.firestore.FieldValue.serverTimestamp(),
            roomType,
            roomId,
        }) 
    }
    
    useEffect(() => {
        !notiRoomsState && dispatch ( setHaveNoti(false) );
        (!haveNoti && modalIsShown) && toggleModal();
    },[notiRoomsState, haveNoti])
    
    useEffect(() => {
        setLoading(true);
        let thisUserAllRooms = [];
        let notificatedRooms = [];
        if (watchingRooms && watchingUserRooms && lastVisitedStatuses) {
            let roomStatuses = lastVisitedStatuses.map(status => status.roomId);
            thisUserAllRooms = [...watchingRooms, ...watchingUserRooms]
            thisUserAllRooms.forEach((room,index) => {
                if (roomStatuses.includes(room.roomId)) {
                    let statusIndex = roomStatuses.indexOf(room.roomId);
                    thisUserAllRooms[index].lastVisited = lastVisitedStatuses[statusIndex].lastVisited;
                }
                else {
                    thisUserAllRooms[index].lastVisited = thisUserAllRooms[index].timestamp;
                }
            })

            notificatedRooms = thisUserAllRooms.filter(room => (room.lastVisited < room.lastChanged && room.roomId !== roomId));
            if (notificatedRooms.length > 0) 
                {   
                    setNotiRoomsState(notificatedRooms);
                }
            else { 
                setNotiRoomsState(null);
            };    
        }
        setLoading(false);
    },[watchingRooms, watchingUserRooms, lastVisitedStatuses])
    
    const toggleModal = () => {
        if (modalIsShown)
        {   
            let topping=null;
            let position=0;
            let element=document.getElementById("modal");
            clearInterval(topping);
            const modalUp = () => {
                if ( position === -60 ) clearInterval(topping);
                else {
                    position = position-10;
                    element.style.top = position + "vh";
                }                
            }
            topping = setInterval(modalUp, 40)
            setModalIsShown(false);
        } else {
            let downing = null;
            let position = -60;
            let element = document.getElementById("modal");
            clearInterval(downing);
            const modalDown = () => {
                if ( position === 0 )  clearInterval(downing);
                else {
                    position = position+10;
                    element.style.top = position + "vh";
                }
            }
            downing = setInterval(modalDown, 40);
            setModalIsShown(true);
        }
    }

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
                    { (!PageSignIn && haveNoti ) && <NotificationsActiveIcon onClick={toggleModal}
                        style={ {backgroundColor: 'red'} } /> 
                    }

                    <HelpOutlineIcon onClick={sendTaskToAdmin}/>
                
                    <InfoOutlinedIcon onClick={() => 
                        alert(`*** About Meow Chat *** \n Võ Vân Anh @ 2021 \n`)}/>

                    { !PageSignIn && <ExitToAppIcon style={{backgroundColor: 'var(--dark-main)'}} 
                        onClick={()=>{ const askOnSignOut = window.confirm('Sign Out?');
                        setLastVisited();
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

            <ShowingModal id="modal">
                <NotificationsContainer>
                    {
                        !loading?
                            notiRoomsState?
                                notiRoomsState.map( (room,index) =>
                                    <Notification key={'noti-'+index} notification={room}/>
                                )
                                :
                                <Notification/>
                                
                            : 
                            <SpinnerContainer>
                                <InnerLoading size={30} />
                                <InnerLoading size={30} />
                                <InnerLoading size={30} />
                            </SpinnerContainer>
                    }

                </NotificationsContainer>
            </ShowingModal>
        </>
    )
}

export default Header

const SpinnerContainer = styled.div `
    display: flex;
    justify-content: center;
    margin-top: 30px;
`

const HeaderContainer = styled.div `
    position: fixed;
    width: 100%;
    height: 33px;
    background-color: transparent;
    align-self: flex-start;
    align-items: center;
    z-index: 1;
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

const ShowingModal = styled.div `
    display: flex;
    justify-content: center;
    position: fixed;
    right: 170px;
    top: -60vh;
    width: 30vw;
    height: 50vh;
    z-index: 99;
    border-radius: 0 0 20px 20px;
    background-color: rgba(133, 91, 101, 60%);
    transition: height 0.5s ease-in-out;
    overflow: hidden;
    padding: 0 10px 10px;
`

const NotificationsContainer = styled.div `
    height: 100%;
    width: 100%;
    border-radius: 0 0 15px 15px;
    background-color: rgba(133, 91, 101, 80%);
    overflow: scroll;
    overflow-x: hidden;
    
    ::-webkit-scrollbar {
        width: 10px;
    }
    
    ::-webkit-scrollbar-track {

    }

    ::-webkit-scrollbar-thumb {
        background: var(--light-main);
        border-radius: 7px;
        :hover {
            background: var(--mid-main)
        }
    }
`
