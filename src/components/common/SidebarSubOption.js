import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styled from "styled-components";
import NightsStayIcon from '@material-ui/icons/NightsStay';
import Brightness5IconOutlined from '@material-ui/icons/Brightness5Outlined';
import { db } from '../../services/firebase/firebase';
import firebase  from 'firebase';
import { enterRoom, optionIdState, setOnManageRoom,} from '../../features/roomSlice';
import { userIdState, userState } from '../../features/userSlice';
import { useCollection, useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import InnerLoading from '../features/InnerLoading';


function SidebarSubOption({title, roomInfo, Icon, id}) {
    const dispatch = useDispatch();
    const user=useSelector(userState);
    const userId = useSelector(userIdState);
    const optionId = useSelector(optionIdState);
    const [roomName, setRoomName] = useState('');
    const [status, setStatus] = useState();
    const [othersData, setOtherUsersData] = useState();
    const [othersUsername, setOthersUsername] = useState();
    const [roomStrs, setRoomStrs] = useState();
    const [roomDatas, setRoomDatas] = useState();
    const [otherUsers] = useCollection(db.collection('users'));
    const [filteredRooms] = useCollection( optionId && db.collection('userRooms').where('roomType','==',optionId) )

    useEffect(() => {
        if (roomInfo && roomInfo.roomType === "userFriends")
        roomInfo.roomUserIds.forEach(id => {
            id !== userId && db.doc('status/'+id).get()
            .then(doc => {
                let lastChanged = doc.data().lastChanged?.seconds || 0
                let today = Math.floor(new Date().valueOf()/1000)
                if(today - lastChanged > 900) {
                    db.doc('status/'+id).update({status: "offline"})
                }

            })
        })
    },[optionId])

    useEffect(() => {
        let friendId;
        if (optionId==="userFriends" && !title) {
            roomInfo?.roomUserIds.map(member => member!==userId && (friendId = member))
        }
        if (friendId) {
            db.doc(`status/`+ friendId).onSnapshot(docSnapshot => {
                setStatus(docSnapshot.data().status);
            })
            db.doc(`users/`+ friendId).onSnapshot(docSnapshot => {
                setRoomName(docSnapshot.data().nickname);
            })
        }

        if (!["userKeepbox","rooms"].includes(optionId))
        {
            setOthersUsername(otherUsers?.docs.map(user => user.data().username));
            setOtherUsersData(otherUsers?.docs.map(user => ({...user.data(), id: user.id}) ));
            setRoomStrs(filteredRooms?.docs.map(room => room.data().roomStr));
            setRoomDatas(filteredRooms?.docs.map(room => ({...room.data(), id: room.id}) ));
        }
    }, [optionId, roomInfo, filteredRooms, otherUsers])

    const selectSubOption = () => {
        if(id){
            dispatch(enterRoom({roomId: id, roomType: optionId}))
        }  
    };
    
    const addSubOption = () => {
        dispatch(setOnManageRoom({loading: true}));
        const unload = () => dispatch(setOnManageRoom({loading: false}));
        switch (optionId) {
            
            case "userKeepbox":
                let newKeepbox = prompt("Please enter your new Keep Box's name");
                !newKeepbox && dispatch(setOnManageRoom({loading: false}));
                newKeepbox && db.collection('userRooms/').add({
                    roomName: newKeepbox,
                    roomUserIds: [userId],
                    roomType: 'userKeepbox',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
                }).then(doc => {
                    dispatch(enterRoom({roomId: doc.id, roomType:'userKeepbox'}));
                    unload();
                })
                break;

            case "userFriends":                 
                let friend = prompt("Please enter your friend's username");
                if (friend===user.username) { alert ("You can't add yourself to friend list. \nTry Add a Keepbox instead"); 
                    unload();
                    break; 
                } else if (friend===''||friend ===null) {
                    unload();
                    break;
                } else {
                    if (!othersUsername.includes(friend)) {
                        alert('Username is not existed')
                    } else {
                        let friendId = othersData[othersUsername.indexOf(friend)].id;
                        const newRoomStr = [userId, friendId].sort().toString();
                        if ( roomStrs.indexOf(newRoomStr) === -1) {   
                            db.collection('userRooms').add({
                                roomStr: newRoomStr,
                                roomType: 'userFriends',
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
                                roomUserIds: [userId, friendId].sort(), 
                            }).then( newDoc => dispatch( enterRoom({roomId: newDoc.id, roomType: "userFriends"})) )
                        } else{
                            dispatch(enterRoom({roomId: roomDatas[roomStrs.indexOf(newRoomStr)].id, roomType: "userFriends"}))
                        }
                    }
                }
                unload();
                break;

            case "userRooms":
                let userList = [user.username];
                let isAddAnother = true, isCreate = false;
                let noticedMess;
                let roomName = prompt(
                    "Enter your \" ROOM'S NAME \" "
                    );
                let noticedList = `Adding these username to room " ${roomName} ": \n   1. You (${user.username})`;

                
                if ([null, ''].includes(roomName)) {
                    alert(`CANCEL CREATING ROOM`);
                    unload();
                    break;
                }
                else {
                    do {
                        let username = prompt(
                            "Enter your friend's \" USERNAME \" "
                        );

                        if (userList.includes(username)) {
                            noticedMess = '';
                        } else if (othersUsername.includes(username)) {
                            userList.push(username);
                            noticedList = noticedList + `\n   ${userList.length}. ${username}`;
                            noticedMess = '';
                        } 
                        else {  
                            noticedMess = `@" ${username} " IS NOT EXISTED.\n`
                        }
                        
                        userList.lenght === 5? 
                            isAddAnother = window.confirm(
                                noticedMess + 
                                noticedList
                            ) :
                            isAddAnother = window.confirm(
                                noticedMess + 
                                noticedList + 
                                "\n \nLet's gather 3 - 5 members to start Meowing" + 
                                "\n ADD ANOTHER FRIENDS?"
                            );
                    }
                    while ((isAddAnother === true || userList?.lengh < 2) && userList?.length < 5);
                    
                    const cancel=() => alert(`Cancel creating room " ${roomName} "`);
                    if ( userList.length < 3 ) cancel ();
                    else { 
                        isCreate = window.confirm(noticedList);

                        if (!isCreate) cancel();
                        else {
                            alert(`Creating '${roomName}'`);
                            let roomUserIds = userList && userList.map(username => othersData[othersUsername.indexOf(username)]?.id);
                            db.collection('userRooms').add({
                                roomName,
                                roomType: 'userRooms',
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
                                roomUserIds, 
                            }).then( newDoc => dispatch( enterRoom({roomId: newDoc.id, roomType: "userRooms"})))
                        }
                    }
                }
                    
                dispatch(setOnManageRoom({loading: false}));
                break;
            default :
                dispatch(setOnManageRoom({loading: false}));
                break;
        }   
    }
    
    return (
        <SubOptionContainer>
            { title?
                <SubOptionChannel disabled={roomDatas? false : true } onClick={addSubOption}>
                    <Icon style = {{color: 'var(--mid-main)'}}/>
                    <span style={{marginLeft: '10px', color: 'var(--mid-main)'}}>Add {optionId.valueOf().replace('user','')}</span>
                </SubOptionChannel>
                :
                optionId!=="userFriends" ?
                    <SubOptionChannel onClick={selectSubOption}>
                        <Icon/>
                        <span>{roomInfo?.roomName}</span>
                    </SubOptionChannel>
                    :
                    status?
                        <SubOptionChannel onClick={selectSubOption}>
                            { status==="online"?
                                <Brightness5IconOutlined style={{color: 'orange'}}/>:
                                <NightsStayIcon style={{color: 'gray'}}/>
                            }
                            <span>{roomName}</span>
                        </SubOptionChannel>
                        :
                        <InnerLoading color={"var(--loaing-color)"}/>
            }
        </SubOptionContainer>
    )
}

export default SidebarSubOption

const SubOptionContainer = styled.div`
    display: flex;
    user-select: none;
    width: 100%;
    text-align: left;
    font-size: 13.5pt;
    font-weight: bold;
    /* align-items: center; */
    cursor: pointer;
    margin: 10px 0;
    max-height: 60px;
    color: var(--light-main);

    > .MuiSvgIcon-root {
        margin-right: 5px;
        margin-left: 5px;
    }

    > div {
        display: flex;
        > .MuiSvgIcon-root {
            font-size: 25px;
            margin: 0 5px;
        }

        :hover {
        color: var(--dark-main) !important;
        }
    }
`

const SubOptionChannel = styled.div`
    /* padding: 10px 20px; */
    padding-left: 10px;
    color: var(--light-main); 
    > span {
        overflow: hidden;
        width: 180px;
        line-height: 20px;
    }
`
