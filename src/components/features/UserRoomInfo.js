import { IconButton } from '@material-ui/core';
import React, { useEffect, useState } from 'react'
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore'
import styled from 'styled-components'
import { db } from '../../services/firebase/firebase'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import AddCircleRoundedIcon  from '@material-ui/icons/AddCircleRounded';
import { enterRoom, setOnManageRoom } from '../../features/roomSlice';
import { useDispatch } from 'react-redux';

function UserRoomInfo({display, roomId, roomType}) {
    const [roomUsers, setRoomUsers] = useState();
    const [roomUserInfos, setroomUserInfos] = useState();
    const [userRoomData] = useDocumentData(roomId && db.doc('userRooms/'+roomId));
    const [usersInfo] = useCollection(db.collection('users/'));
    const dispatch = useDispatch();
    useEffect(() => {
        if (roomType !== 'rooms' && roomType !== 'userKeepbox') {
            userRoomData && userRoomData && setRoomUsers(userRoomData.roomUserIds)
        }
    },[roomId,userRoomData])
    
    useEffect(() => {
        let dummyArray=[];
        if (usersInfo && roomUsers) {
            usersInfo.docs.forEach(doc => {
                if(roomUsers.includes(doc.id)) {
                    dummyArray.push({username: doc.data().username , nickname: doc.data().nickname})
                }
            })
            setroomUserInfos(dummyArray);
        }

    },[roomUsers])

    const deleteKeepbox = () => {
        setOnManageRoom({loading: true})
        let isDelete = window.confirm('Delete this Keep Box?');
        if (isDelete) {
            dispatch(enterRoom({roomId: null, roomType: null}));
            db.collection('userRooms').doc(roomId).delete();
        };
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
        }    
        if (!existedId) alert('Username is not existedId');
        else {
            if (newMember && userRoomData.roomUserIds.includes(existedId)) alert("\" " + newMember + " \" is already in this Room.")
            else {
                db.collection('userRooms').doc(roomId).update({ roomUserIds: [...userRoomData.roomUserIds, existedId]});
            };
        }
    }

    return ( <> 
        { roomType==='rooms'?
            <UserRoomInfoContainer style={{display: display}} >
                <InfoHeader><p>This is a public room for every Meow's users.</p></InfoHeader>
            </UserRoomInfoContainer>
            :
            roomType==='userKeepbox'?
                <UserRoomInfoContainer style={{display: display}} >
                    <IconButton  type='submit' onClick = {deleteKeepbox}
                    > <DeleteForeverIcon style={{fontSize: '28pt'}}/> </IconButton>
                    <InfoHeader><span>This is your private Keepbox.</span></InfoHeader>
                </UserRoomInfoContainer>
                :
                roomType==='userRooms'?
                    <UserRoomInfoContainer style={{display: display}} >
                        <IconButton  type='submit' style={{color: 'mediumseagreen'}} onClick = {addMember}
                            > <AddCircleRoundedIcon style={{fontSize: '28pt'}}/> </IconButton>
                        <InfoHeader> User List
                            {
                                roomUserInfos?.map(user => 
                                    <li>{ user.nickname } <br/> 
                                    {
                                        user.nickname !== user.username &&
                                        <span>@ username: {user.username}</span>
                                    }    
                                    </li>)
                            }
                        </InfoHeader>
                    </UserRoomInfoContainer>
                    :
                    <UserRoomInfoContainer style={{display: display}} >
                        <InfoHeader> User List
                            {
                                roomUserInfos?.map(user => 
                                    <li>{ user.nickname } <br/> 
                                    {
                                        user.nickname !== user.username &&
                                        <span>@ username: {user.username}</span>
                                    }    
                                    </li>)
                            }
                        </InfoHeader>
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

    >.MuiButtonBase-root {
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

const InfoHeader = styled.div `
    position: static;
`