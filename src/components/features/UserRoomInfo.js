import { ButtonGroup, IconButton } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import styled from 'styled-components';
import firebase from 'firebase';
import { db } from '../../services/firebase/firebase';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import AddCircleRoundedIcon  from '@material-ui/icons/AddCircleRounded';
import { enterRoom, setOnManageRoom } from '../../features/roomSlice';
import { useDispatch, useSelector } from 'react-redux';
import { userIdState, userState } from '../../features/userSlice';
import { EditRounded, MeetingRoomRounded, RemoveCircleRounded } from '@material-ui/icons';

function UserRoomInfo({display, roomId, roomType}) {
    const user = useSelector(userState);
    const userId = useSelector(userIdState);
    const [roomUsers, setRoomUsers] = useState();
    const [roomUserInfos, setRoomUserInfos] = useState();
    const [pendingUsers, setPendingUsers] = useState();
    const [pendingUserInfos, setPendingUserInfos] = useState();
    const roomRef = db.doc("userRooms/"+roomId);
    const roomMessagesRef = db.collection("userRooms/"+roomId+"/messages");
    const [userRoomData] = useDocumentData(roomId && db.doc('userRooms/'+roomId));
    const [usersInfo] = useCollection(db.collection('users/'));
    const dispatch = useDispatch();
    
    useEffect(() => {
        if (roomType !== 'rooms' && roomType !== 'userKeepbox') {
            if (userRoomData) {
                setRoomUsers(userRoomData.roomUserIds);
                setPendingUsers(userRoomData.pendingIds);
            } 
        }
    },[roomId,userRoomData])
    
    useEffect(() => {
        let dummyArray=[];
        if (usersInfo && roomUsers) {
            usersInfo.docs.forEach(doc => {
                let [...rooms] = roomUsers;
                if(rooms.includes(doc.id)) {
                    dummyArray.push({username: doc.data().username , nickname: doc.data().nickname})
                }
            })
            setRoomUserInfos(dummyArray);
        }
    },[roomUsers])

    useEffect(() => {
        let dummyArray=[];
        if (usersInfo && pendingUsers) {
            usersInfo.docs.forEach(doc => {
                let [...pending] = pendingUsers;
                if(pending.includes(doc.id)) {
                    dummyArray.push({username: doc.data().username , nickname: doc.data().nickname})
                }
            })
            setPendingUserInfos(dummyArray);
        }
    },[pendingUsers])

    const actionMessage= (e)=>{
        roomMessagesRef.add({
        message: `${user.username} ${e}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userId: userId,
    })}

    const setLastVisited = (id,visitedRoomId) => {
        (id && visitedRoomId) && db.doc('users/'+id+'/status/'+visitedRoomId).set({
            lastVisited: firebase.firestore.FieldValue.serverTimestamp(),
            roomType,
            roomId: visitedRoomId,
        }) 
    }

    const deleteRoom = () => {
        setOnManageRoom({loading: true})
        let isDelete = window.confirm('Delete this room? All messages will be deleted forever.');
        if (isDelete) {
            dispatch(enterRoom({roomId: null, roomType: null}));
            db.collection('userRooms').doc(roomId).collection('messages').get().then(messages => {
                messages.forEach(message => {
                  db.doc('userRooms/'+roomId+'/messages/'+message.id).delete()
                })
            db.collection('userRooms').doc(roomId).delete();
        })}
    }

    const removeMember = () => {
        let removedUsername = prompt("Please enter removed member's username");
        if(removedUsername){
            let removedId;
            usersInfo.docs.forEach(doc => {
                if (doc.data().username === removedUsername)
                {
                    removedId = doc.id;
                    return;
                }
                return;
            })

            if (userRoomData.roomUserIds.includes(removedId)){
                roomRef.update({
                    roomUserIds: [...userRoomData.roomUserIds.filter(id => id !== removedId)]
                })
                .then(
                    actionMessage(`has removed ${removedUsername} out of this room.`)
                )
            } else if (userRoomData.pendingIds.includes(removedId)) {
                roomRef.update({
                    pendingIds: [...userRoomData.pendingIds.filter(id => id !== removedId)]
                })
            } else {
                alert(removedUsername+` is not in this room.`)
            }
        }
        
    }

    const addMember = () => {
        let newMember = prompt("Please enter your friend's username");
        let existedId;
        if (newMember) {
            usersInfo.docs.forEach(doc => {
                if (doc.data().username === newMember)
                {
                    existedId = doc.id;
                    return;
                }
                return;
            })
            
            if (!existedId) alert('Username is not existedId')
            else {
                let allUserIds=[...userRoomData.roomUserIds,...userRoomData.pendingIds];
                if (newMember && allUserIds.includes(existedId)) alert("\" " + newMember + " \" is already in this Room.")
                else {
                    setLastVisited(existedId,roomId);
                    db.collection('userRooms').doc(roomId).update({ pendingIds: [...userRoomData.pendingIds, existedId]});
                };
            }
        }    
    }

    const editName = () => {
        let newName = prompt('Please enter new room-name',userRoomData.roomName);
        if (newName) {
            roomRef.update({ roomName: newName })
            .then(userRoomData.roomType!=="userKeepbox" && actionMessage(`has changed room-name into ${newName}.`));
        }
    }

    const leaveRoom = () => {
        roomRef.update({ roomUserIds: userRoomData?.roomUserIds.filter(id => id !== userId)})
            .then(()=>{
                dispatch(enterRoom({roomId: null, roomType: null}));
                actionMessage(`has left this room.`)
            });
    }

    return ( <> 
        { roomType==='rooms'?
            <UserRoomInfoContainer style={{display: display}} >
                <InfoDetails><p>This is a public room for every Meow's users.</p></InfoDetails>
            </UserRoomInfoContainer>
            :
            roomType==='userKeepbox'?
                <UserRoomInfoContainer style={{display: display}} >
                    <ButtonGroup
                            size="small"
                            aria-label="contained button group"
                            variant="text"
                        >
                        <IconButton  style={{color: 'CornflowerBlue'}} 
                        > <EditRounded onClick={editName} style={{fontSize: '22pt'}}/> </IconButton>
                        <IconButton onClick={deleteRoom} style={{color: 'indianred'}} 
                        > <DeleteForeverIcon style={{fontSize: '22pt'}}/> </IconButton>
                    </ButtonGroup>

                    <InfoDetails><span>Personal Keepbox.</span></InfoDetails>
                </UserRoomInfoContainer>
                :
                roomType==='userRooms'?
                    <UserRoomInfoContainer style={{display: display}} >
                        <ButtonGroup
                            size="small"
                            aria-label="contained button group"
                            variant="text"
                        >
                            <IconButton  style={{color: 'CornflowerBlue'}} 
                            > <EditRounded onClick={editName} style={{fontSize: '22pt'}}/> </IconButton>
                            <IconButton style={{color: 'mediumseagreen'}} 
                            > <AddCircleRoundedIcon onClick={addMember} style={{fontSize: '22pt'}}/> </IconButton>
                            { userRoomData?.createdBy !== user.username &&
                                <IconButton style={{color: 'indianred'}} 
                                > <MeetingRoomRounded onClick={leaveRoom} style={{fontSize: '22pt'}}/> </IconButton>
                            }
                            { userRoomData?.createdBy === user.username &&
                                <IconButton onClick={removeMember} style={{color: 'orange'}} 
                                > <RemoveCircleRounded style={{fontSize: '22pt'}}/> </IconButton>
                            }
                            { userRoomData?.createdBy === user.username &&
                                <IconButton onClick={deleteRoom} style={{color: 'indianred'}} 
                                > <DeleteForeverIcon style={{fontSize: '22pt'}}/> </IconButton>
                            }
                        </ButtonGroup>
                        
                        <InfoDetails> User List
                            {
                                roomUserInfos?.map(user => 
                                    <li key={user.username}>{ user.nickname }<br/> 
                                    {
                                        user.nickname !== user.username &&
                                        <span>@ username: {user.username}</span>
                                    }    
                                    {userRoomData.createdBy === user.username && <i>(admin)</i>}
                                    </li>)
                            }
                        </InfoDetails>
                        <InfoDetails> { pendingUsers?.length > 0 && <b>Pending Invitations</b>}
                            {   pendingUsers &&
                                pendingUserInfos?.map(user => 
                                    <li key={user.username}>{ user.nickname } <br/> 
                                    {
                                        user.nickname !== user.username &&
                                        <span>@ username: {user.username}</span>
                                    }    
                                    </li>)
                            }

                        </InfoDetails>
                    </UserRoomInfoContainer>
                    :
                    <UserRoomInfoContainer style={{display: display}} >
                        <ButtonGroup
                            size="small"
                            aria-label="contained button group"
                            variant="text"
                        >
                            <IconButton onClick={deleteRoom} style={{color: 'indianred'}} 
                            > <DeleteForeverIcon style={{fontSize: '22pt'}}/> </IconButton>  
                        </ButtonGroup>
                        <InfoDetails> User List
                            {
                                roomUserInfos?.map(user => 
                                    <li key={'members-'+user.username}> { user.nickname } <br/> 
                                    {
                                        user.nickname !== user.username &&
                                        <span>@ username: {user.username}</span>
                                    }    
                                    </li>)
                            }
                        </InfoDetails>
                    </UserRoomInfoContainer>
                
                
        } </>
    )
}

export default UserRoomInfo

const UserRoomInfoContainer = styled.div `
    position: relative;
    position: absolute;
    font-size: 16pt;
    margin-top: 5px;
    margin-left: 20px;
    width: 350px;
    max-height: 365px;
    overflow: scroll;
    overflow-x: hidden;
    background: white;
    border: 5px solid var(--dark-main);
    border-radius: 20px;
    padding: 10px 20px;
    box-shadow: 0 3px 3px rgba(0, 0, 0, 0.25);
    z-index: 10;
    > div {
        > span {
            line-height: 30pt;
        }

        >li, p, span {
            font-weight: normal;
            font-size: 14pt;
            margin: 5px 10px;

            >span {
                font-size: 12pt;
                padding: 20px;
            }
        }
    }

    >.MuiButtonGroup-root {
            position: absolute;
            right: 0;
            top: -2px;
            color: var(--mid-main);
        }

    ::-webkit-scrollbar {
        width: 10px;
    }
    
    ::-webkit-scrollbar-track {
        margin: 8px;
    }

    ::-webkit-scrollbar-thumb {
        background: var(--light-main);
        border-radius: 7px;
        :hover {
            background: var(--mid-main)
        }
    }
`

const InfoDetails = styled.div `
    position: static;
`