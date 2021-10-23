import { Button, ButtonGroup } from '@material-ui/core'
import React, {useEffect} from 'react'
import firebase from 'firebase';
import { useSelector } from 'react-redux';
import styled from 'styled-components'
import { userIdState, userState } from '../../features/userSlice';
import { db } from '../../services/firebase/firebase'

function PendingInvitation({invitation}) {
    const userId = useSelector(userIdState);
    const user = useSelector(userState);
    const setLastVisited = (id,visitedRoomId) => {
        (id && visitedRoomId) && db.doc('users/'+id+'/status/'+visitedRoomId).set({
            lastVisited: firebase.firestore.FieldValue.serverTimestamp(),
            roomType: 'userRooms',
            roomId: visitedRoomId,
        }) 
    }
    const onAccepted = () => {
        let pending = invitation.pendingIds.filter(id => id !== userId);
        db.doc("userRooms/"+invitation.roomId).update({
            roomUserIds: [...invitation.roomUserIds, userId],
            pendingIds: pending,
        }).then(()=>{
            let messageInfo={
                message: `${user.username} has joined this room`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: userId,
            }
            db.collection("userRooms/"+invitation.roomId+"/messages").add( messageInfo )
            db.doc("userRooms/"+invitation.roomId).update({lastChanged: firebase.firestore.FieldValue.serverTimestamp()})
            setLastVisited(userId, invitation.roomId);
        })
    }

    const onRefused = () => {
        let pending = invitation.pendingIds.filter(id => id !== userId);
        db.doc("userRooms/"+invitation.roomId).update({
            pendingIds: pending,
        })
    }

    return (
        <InvitationDetail>
            <div><p>You were invited to join <b>{invitation.roomName}, </b>
                created by <b>{invitation.createdBy}</b>.</p></div>
            <InvitationAction>
                <ButtonGroup variant="contained" size="small" aria-label="outlined button group">
                    <Button 
                        style={{backgroundColor: "var(--dark-main)", color: "white"}} 
                        onClick={onAccepted}
                        >Accept</Button>
                    <Button 
                        style={{backgroundColor: "white", color: "var(--dark-main)"}} 
                        onClick={onRefused}
                        >Refuse</Button>
                </ButtonGroup>
            </InvitationAction>
        </InvitationDetail>
    )
}

export default PendingInvitation

const InvitationAction = styled.div `
    padding-top: 10px;
`
const InvitationDetail = styled.div `
    cursor: pointer;
    margin: 10px 10px;
    width: calc(100% - 40px);
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 90%);
    padding: 10px;
    position: relative;

    > div {
        display: flex;
        justify-content: center;
        margin: 2px;

        > * > .MuiButtonBase-root {
            font-weight: bold;
            border: 1px solid var(--dark-main);
        }

        > p {
            margin: 0px;
            line-height: 20px;
        }
    }

    
`
