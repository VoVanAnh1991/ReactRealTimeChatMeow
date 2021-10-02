import React, { useEffect, useRef, useState } from 'react';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '../../services/firebase/firebase';
import { useSelector } from 'react-redux';
import { userIdState, userState } from '../../features/userSlice';
import { onManageRoomState, optionIdState, roomIdState, roomTypeState } from '../../features/roomSlice';
import styled from "styled-components";
import ChatInput from '../common/ChatInput';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import Message from './Message';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import PageLoading from '../features/PageLoading';
import firebase from 'firebase';
import InnerLoading from './InnerLoading';
import UserRoomInfo from './UserRoomInfo';
import { IconButton } from '@material-ui/core';

function UserPage() {
    const user = useSelector(userState);
    const roomId = useSelector(roomIdState);
    const roomType = useSelector(roomTypeState);
    const userId = useSelector(userIdState);
    const optionId = useSelector(optionIdState);
    const onManageRoom = useSelector(onManageRoomState);
    const [roomName, setRoomName] = useState();
    const [showRoomInfo, setShowRoomInfo] = useState(false);
    const [users] = useCollection ( db.collection('users') )
    const [roomDetails] = useDocumentData(
        roomId && db.collection('rooms').doc(roomId) 
    );
    const [userRoomDetails] = useDocumentData(
        roomId && db.collection('userRooms').doc(roomId) 
    );
    const [roomMessages] = useCollection (
        roomId && db.collection('rooms').doc(roomId).collection('messages').orderBy('timestamp')
    )
    const [userRoomMessages] = useCollection (
        roomId && db.collection('userRooms').doc(roomId).collection('messages').orderBy('timestamp')
    )
    const chatRef = useRef(null);
    const userStatusFirestoreRef = db.doc('/status/' + userId);
    const isOnline = {
        lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
        status: "online",
    };
    const isOffline = {
        lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
        status: "offline",
    };
    const setLastVisited = () => {
        (userId && roomId) && db.doc('users/'+userId+'/status/'+roomId).set({
          lastVisited: firebase.firestore.FieldValue.serverTimestamp(),
          roomType,
          roomId,
      })  
    }

    firebase.database().ref('.info/connected').on('value', function(snapshot) {
            userStatusFirestoreRef.set(isOnline);
    });

    window.onbeforeunload = function () {        
        setLastVisited();
        return userStatusFirestoreRef.set(isOffline);
    };   
    window.onunload = function () {
        setLastVisited();
        userStatusFirestoreRef.set(isOffline);
        return userStatusFirestoreRef.set(isOffline);
    }; 

    useEffect(() => {
        chatRef.current?.scrollIntoView({
            behavior: 'auto'
        });
    });
    
    useEffect(() => {
        setShowRoomInfo(false);
    },[roomId, optionId, roomDetails, userRoomDetails]);
    
    useEffect(() => {
        setLastVisited();
    },[roomId, roomType]);

    useEffect(() => {
        roomDetails && setRoomName(roomDetails.roomName);
        if (userRoomDetails) {
            userRoomDetails.roomType !== 'userFriends'?
            setRoomName(userRoomDetails.roomName) 
            : users.docs.forEach(doc => 
                (userRoomDetails.roomUserIds.includes(doc.id) && doc.id !== userId) && (setRoomName(doc.data().nickname))
            )
        };
    },[roomDetails, userRoomDetails, roomId]);
    
    const loading = (<>
        <InnerLoading color={"var(--mid-main)"} size={20}/>
        <InnerLoading color={"var(--mid-main)"} size={20}/>
        <InnerLoading color={"var(--mid-main)"} size={20}/>
        <InnerLoading color={"var(--mid-main)"} size={20}/>
        <InnerLoading color={"var(--mid-main)"} size={20}/>
        <InnerLoading color={"var(--mid-main)"} size={20}/>
        <InnerLoading color={"var(--mid-main)"} size={20}/>
        <InnerLoading color={"var(--mid-main)"} size={20}/>
    </>)
    
    return ( !user?
        <PageLoading/>
        : 
        ( <PageUserContainer id="userPage">
            <Header onSignOut={isOffline}/>
            <Body id="body">
                <Sidebar/>
                <ChatSection> 
                    <ChatHeader>
                        { 
                            !onManageRoom.loading ?
                                onManageRoom.roomName?
                                <><h1><StarBorderIcon/></h1>
                                 <span>{onManageRoom.roomName}</span></>
                                :
                                ((roomDetails && roomMessages) || userRoomMessages)? 
                                    <><h1>
                                        <IconButton  type='submit' onClick = {()=>setShowRoomInfo(!showRoomInfo)}
                                        > <StarBorderIcon style={{zIndex: '999'}}/> </IconButton>
                                        <UserRoomInfo display={showRoomInfo? 'block':'none'} roomId={roomId} roomType={roomType}/>
                                    </h1>   
                                        <span>{roomName}</span>
                                    </>
                                    : roomId? 
                                        <div> {loading} </div>
                                :<div><span>WELCOME!!!!</span></div>
                            : <div>{loading}</div>
                        }
                    </ChatHeader> 
                    {   (roomMessages || userRoomMessages)?
                            (<AllMesseges> {
                                roomType ==='rooms' ?  
                                    roomMessages?.docs.map((mess,index) => {
                                        const messInfo = mess.data()
                                        return (<Message key={roomId+index} users={users} userId={userId} messInfo={messInfo}/>) 
                                    }) 
                                    : 
                                    userRoomMessages?.docs.map((mess,index) => {
                                        const messInfo = mess.data()
                                        return (<Message key={roomId+index} users={users} userId={userId} messInfo={messInfo}/>) 
                                    })
                                } 
                                <ChatBottom ref={chatRef}/>
                            </AllMesseges>)
                            : 
                            <></>
                        
                    }
                    { roomId?
                        roomId.includes('ADMIN')?
                            <></>
                            :
                            <ChatInput roomId={roomId} roomType={roomType} chatRef={chatRef}/>
                        :
                        <></>
                    }
                </ChatSection>
            </Body>
        </PageUserContainer>)
    )
}

export default UserPage

const PageUserContainer = styled.div `
    @media screen and (max-width: 700px)
        { display: none; }

    font-family: 'Lucida Grande', Verdana, sans-serif;
    font-size: 12pt;
    background-color: rgba(255, 190, 191, 4%);

`

const ChatHeader = styled.div `
    display: flex;
    height: var(--chat-header);
    padding: 5px 10px;
    border-bottom: 2px solid var(--dark-main);
    background-color: rgba(255, 255, 255, 50%);
    color: var(--dark-main);
    word-break: break-word;

    > h1 {
        flex: 0.05;
        height: 100%;
        width: 100%;
        padding: 0 10px;
        margin: 3px 0;
    }

    > h1>p {
        height: 100%;
        font-size: 12px;
    }

    >span {
        overflow: hidden;
        height: 100%;
        margin-top: 5px;
        font-weight: bold;
        margin-left:20px;
        font-size: 28pt;
        text-shadow: 2px 2px white;
    }

    > div {
        display: flex;
        width: 80%;
        justify-content: center;
        font-weight: bold;
        margin-left:20px;
        margin: 7px auto;
        font-size: 30pt;
        text-shadow: 2px 2px white;
        text-align: center;
        align-items:center;
    }

    > h1> .MuiButtonBase-root {
        cursor: pointer;
        color: white;
        background-color: var(--dark-main);
        border-radius: 50%;
        padding: 3px;
        margin-right: 5px;
        margin-top: 5px;
        font-size: 30pt;

        :hover {
            background-color: var(--mid-main);
        }
    }

`

const Body = styled.div `
    width: 100%;
    display: flex;
    align-self: flex-start;
`

const ChatSection = styled.div `
    width: var(--chat-section-width);
    flex-wrap: wrap;
    overflow: hidden;
    height: 0%;
`

const ChatBottom = styled.div `
    position: relative;
    padding-bottom: var(--chat-bottom);
    height: 1px;
`
const AllMesseges = styled.div `
    width: 100%;
    height: calc(100vh - var(--chat-input) - var(--chat-header) - var(--chat-bottom));
    overflow-y: scroll;
    overflow-x: hidden;
    
    ::-webkit-scrollbar {
        width: 13px;
        /* height: 30px; */
    }

    ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.5);
        border-radius: 99999;
    }

    ::-webkit-scrollbar-thumb {
        background: var(--light-main);
        opacity: 0.5;
        border-radius: 7px;
        
        :hover {
            background: var(--mid-main)
        }
    }
`