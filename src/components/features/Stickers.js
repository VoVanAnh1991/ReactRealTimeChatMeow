import React, { useEffect } from 'react'
import styled from 'styled-components';
import firebase from 'firebase';
import { db } from '../../services/firebase/firebase';
import { IconButton } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { useDispatch } from 'react-redux';
import { setSignIn } from '../../features/userSlice';

function Stickers({stickerSet, roomId, roomType, chatRef, user, userId}) {
    const dispatch = useDispatch();
    const sendSticker = (e) => {
        if (!roomId) return;
        let messageInfo={
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            sticker: e.target.src,
            userId: userId,
            user: user?.username,
        }
        roomType==='rooms'?
        db.collection('rooms').doc(roomId).collection('messages').add(messageInfo):
            db.collection('userRooms').doc(roomId).collection('messages').add(messageInfo)

        chatRef.current?.scrollIntoView({
            behavior: 'auto'
        });
        
        roomType!=='rooms' && db.collection('userRooms').doc(roomId).update({
            lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
        })
        roomType==='rooms' && db.collection('rooms').doc(roomId).update({
            lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
        })
    }

    const setAvatar = (number) => { 
        if(window.confirm('Do you want to change your avatar?')) {
            db.doc('users/'+userId).update({
                avatar: 'https://my-meow-chat.web.app/Stickers/'+stickerSet+"/"+number+'.png',
            })
            db.collection('users').doc(userId).get()
            .then(query => {
                dispatch(setSignIn({user: query.data(), userId: query.id}));
            })
        }
    }
    
    return (
        <CollectionContainer>        
            {   stickerSet &&
                ["01","02","03","04","05","06","07","08","09"].map(number=>
                    <StickerContainer onRight={setAvatar}>
                        <IconButton  type='submit' onClick = {()=>setAvatar(number)}
                        > <AccountCircleIcon/> </IconButton>
                        <img key={stickerSet+number} src={'https://my-meow-chat.web.app/Stickers/'+stickerSet+"/"+number+'.png'} 
                        alt=''  onClick={sendSticker}/>
                    </StickerContainer>
                )
            }
        </CollectionContainer>
    )
}

// 
export default Stickers

const CollectionContainer=styled.div `
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: 0 auto;
`

const StickerContainer=styled.div `
    position: relative;
    flex: 0.3;
    margin: 4px;
    display: flex;
    > img {
        border-radius: 20px;
        width: 65px;
        height: 65px;
        cursor: pointer;
    }

    > .MuiButtonBase-root {
        position: absolute;
        right: -6px;
        top: -2px;
        color: var(--dark-main);
            background-color: var(--light-main);
            padding: 0px;
        
        > .MuiSvgIcon-root {
            font-size: 10px;
            
        }

        :hover {
            color: white;
            background-color: var(--mid-main);
        }
    }
    

`
