import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import firebase from 'firebase';
import { Badge } from '@material-ui/core';
import { Announcement } from '@material-ui/icons';
import { db } from '../../services/firebase/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { userIdState } from '../../features/userSlice';
import { enterRoom, roomIdState, roomTypeState, setHaveNoti } from '../../features/roomSlice';

function Notifications({notification}) {
    const notiRoom = notification?.roomId?.valueOf();
    const [roomNameState, setRoomNameState] = useState(null);
    const [noOfNotiState, setNoOfNotiState] = useState('');
    const dispatch = useDispatch();
    const userId = useSelector(userIdState);
    const roomId = useSelector(roomIdState);
    const roomType = useSelector(roomTypeState);
    const [messages]=useCollectionData( notification &&
        (notification.roomType === 'rooms' ?
            db.collection('rooms/'+notiRoom+'/messages')
            .where('timestamp','>',notification.lastVisited).orderBy('timestamp','desc')
            :
            db.collection('userRooms/'+notiRoom+'/messages')
            .where('timestamp','>',notification.lastVisited).orderBy('timestamp','desc'))
    )

    const setLastVisited = () => {
        (userId && roomId) && db.doc('users/'+userId+'/status/'+roomId).set({
            lastVisited: firebase.firestore.FieldValue.serverTimestamp(),
            roomType,
            roomId,
        }) 
    }

    useEffect(()=>{
        if (notification && !notification.roomName) {
            notification.roomUserIds.forEach(id => {
                id !== userId && db.doc('users/'+id).get().then(
                    doc => setRoomNameState(doc.data().nickname)
                )
            })
        }

        if (messages) { 
            setNoOfNotiState(messages.length) 
            dispatch(setHaveNoti(true));
        }

        
    },[notification, messages])
    
    return (
        <>
            {   
                noOfNotiState?
                    <NotificationDetail onClick={ () =>  { setLastVisited()
                            dispatch(enterRoom({roomId:  notification.roomId, roomType: notification.roomType})); 
                        }}>
                        <div>
                            <StyledBadge badgeContent={messages && noOfNotiState} color="primary">
                                <Announcement/>
                            </StyledBadge>
                        </div>
                        <h3> { notification.roomName? notification.roomName : roomNameState } </h3> 
                        <RoomLink> 
                            { messages?
                                messages[0]?.message?
                                    (<> { messages[0]?.message } </>)
                                    :
                                    (<img alt='' src={messages[0]?.sticker}/>)
                                : <></>
                            } 
                        </RoomLink>
                    
                    </NotificationDetail>
                    :
                    <></>
            }
        </>
    )
}

export default Notifications

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: 2,
      top: 0,
      backgroundColor: 'indianred',
      border: `2px solid indianred`,
      padding: '0 4px',
    },
  }));

  
const NotificationDetail = styled.div `
    cursor: pointer;
    margin: 10px 10px;
    width: calc(100% - 40px);
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 90%);
    padding: 10px;
    position: relative;

    > h3 {
        width: 80%;
        margin: 0 !important;
        padding: 0;
    }

    > h4 {
        width: 80%;
        font-weight: normal;
        margin: 0;
        padding: 0;
    }

    > div {
        position: absolute;
        top: 15px;
        right: 15px;
    }
`

const RoomLink = styled.p `
    color: cadetblue;
    margin: 5px 0px 0px;

    > img {
        width: 15vh;
        border-radius: 10px;
    }
`