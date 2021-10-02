import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '@material-ui/core';
import { db } from '../../services/firebase/firebase';
import firebase from 'firebase';
import { useSelector } from 'react-redux';
import { userIdState, userState } from '../../features/userSlice';
import Stickers from '../features/Stickers'
import PetsIcon from '@material-ui/icons/Pets';

function ChatInput({roomId, roomType, chatRef}) {
    const userId = useSelector(userIdState);
    const user = useSelector(userState);
    const inputRef = useRef();
    const [input, setInput] = useState('');
    const [stickerSet, setStickerSet] = useState('Happy-Kids');
    const setLastVisited = () => {
        (userId && roomId) && db.doc('users/'+userId+'/status/'+roomId).set({
          lastVisited: firebase.firestore.FieldValue.serverTimestamp(),
          roomId,
          roomType,
        })
    }

    useEffect(() => {
        chatRef.current?.scrollIntoView({
            behavior: 'auto'
        });
    });

    const sendMessage = (e) => {
        e.preventDefault();
        
        setLastVisited();
        if (!roomId) return;
        let messageInfo={
            message: input,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: userId,
            user: user?.username,
        }
        
        chatRef.current?.scrollIntoView({
            behavior: 'auto'
        });

        if (roomType === 'rooms') {
            db.collection('rooms').doc(roomId).collection('messages').add(messageInfo);
            db.collection('rooms').doc(roomId).update({
                lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
            })

        } else {
            db.collection('userRooms').doc(roomId).collection('messages').add(messageInfo);
            db.collection('userRooms').doc(roomId).update({
                lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
            })
        }

        setInput('');
    }

    const sendMessageOnPhone = (e) => {
        sendMessage(e);
        inputRef.current.blur();
    }
    
    return (
        <ChatInputContainer>
            <StickerGallery> 
                <StickerSetOptions>
                    <StickerSet>
                        <button onClick={e => setStickerSet(e.target.value)}
                            value="Happy-Kids"
                            >Happy Kids</button>
                    </StickerSet>
                    <StickerSet>
                        <button onClick={e => setStickerSet(e.target.value)}
                            value="Hello-Kitty"
                            >Hello Kitty</button>
                    </StickerSet>
                    <StickerSet>
                        <button onClick={e => setStickerSet(e.target.value)}
                            value="Cute-Cat"
                            >Cute Cat</button>
                    </StickerSet>
                </StickerSetOptions>
                <StickerOptions>
                    <Stickers roomId={roomId} stickerSet={stickerSet} roomType={roomType} chatRef={chatRef} user={user} userId={userId} />
                </StickerOptions>
            </StickerGallery>
            <Form>
                <IconButton  type='submit' disabled={input==='' && true} onClick = {sendMessage}
                > <PetsIcon style={{fontSize: '20pt'}}/> </IconButton>
                <input  ref={inputRef} value={input} onChange={e => setInput(e.target.value)}/>
            </Form>
            <FormOnPhone>
                <IconButton  type='submit' disabled={input==='' && true} onClick = {sendMessageOnPhone}
                > <PetsIcon style={{fontSize: '20pt'}}/> </IconButton>
                <input  ref={inputRef} value={input} onChange={e => setInput(e.target.value)}/>
            </FormOnPhone>
        </ChatInputContainer>
    )
}

export default ChatInput

const Form = styled.form `
    @media screen and (max-height: 340px) { 
        display: none;
    }
`

const FormOnPhone = styled.form `
    @media screen and (max-height: 340px) { 
        display: block;
    }

    display: none;
`

const ChatInputContainer = styled.div`
    position: fixed;
    display: flex;
    bottom: 0;
    right: 0;
    align-self: flex-end;
    height: var(--chat-input);
    width: calc(100vw - var(--sidebar-width));
    background-color: var(--light-main);
    border-top: 2px solid var(--dark-main);

    > form {
        position: relative;
        background-color: white;
        width: 100%;
        height: 100%;
    }

    > form > input {
        padding: 0 20px;
        width: 100%;
        height: 100%;
        font-size: 14pt;
        border: none;
        border-radius: 3px;
        outline: none;
    }

    > form > .MuiButtonBase-root {
        position: absolute;
        top: 5px;
        right: 5px;
        background-color: var(--dark-main);
        color: white ;
        padding: 4px;
    }
`

const StickerGallery = styled.div`
    width: 40%;
    display: flex;
    background-color: rgba(133, 91, 101, 60%);
    > div {
        overflow: scroll;
        ::-webkit-scrollbar {
            display: none;
        }
    }
    
`
const StickerOptions = styled.div`
    flex: 0.7;
`
const StickerSetOptions = styled.div`
    height: 100%;
    padding: 5px;
    flex: 0.3;
`
const StickerSet = styled.div`
    display: flex;
    
    width: 100%;
    margin-bottom: 5px;
    /* padding: 6.5px; */
    border-radius: 20px;
    border: 2.5px solid var(--dark-main);
    background-color: white;
    
    > button {
        color: var(--dark-main);
        cursor: pointer;
        flex: 1;
        background-color: transparent;
        padding: 6px;
        margin: 0;
        overflow: hidden;
        font-weight: bold;
        font-size: 10pt;
        outline: none;
        border: none;
    }
`
