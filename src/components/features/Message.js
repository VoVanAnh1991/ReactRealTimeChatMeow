import React from 'react';
import styled from 'styled-components';
import myCorner from '../../images/MyCorner.png';
import otherCorner from '../../images/OtherCorner.png';
import adminCorner from '../../images/AdminCorner.png';
import { db } from '../../services/firebase/firebase'
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { DeleteSweep } from '@material-ui/icons';
import { useSelector } from 'react-redux';
import { roomIdState, roomTypeState } from '../../features/roomSlice';

function Message({userId, messInfo, messId}) {
    const [userInfo] = useDocumentData(userId && db.doc('users/'+messInfo.userId));
    const messDate=messInfo?.timestamp?.toDate().toLocaleString();
    const roomId = useSelector(roomIdState);
    const roomType = useSelector(roomTypeState);

    const onDeleteMess = () => {
        let isDelete = window.confirm('Deleting this message? Everyone won\'t see this message again.');
        isDelete &&
            db.doc('userRooms/'+roomId+'/messages/'+messId).delete();
    }

    const message = (
        <MessInfo>
            <img alt='' src={messInfo.userId===userId? myCorner :
                                messInfo.userId==='AdminTeam'? adminCorner: otherCorner} />
            <h4> {userInfo?.nickname}
                <div>{messDate? messDate : 'Sending...'}</div>
            </h4>
            <p>
                {
                    messInfo?.message &&
                        messInfo.message.includes('http')?
                            <a target="_blank" rel="noreferrer" href={messInfo.message}>{messInfo.message}</a>
                            : messInfo.message
                }    
                {   
                    messInfo?.sticker &&
                    <MessStickerContainer>
                    <img alt='' src={messInfo.sticker}/> 
                    </MessStickerContainer>
                }
            </p>
        </MessInfo>
    );

    return (
        <MessContainer>
            {   
                message && messInfo.userId===userId? 
                    <MyChatBox> 
                        {message}
                        <img alt='' src={userInfo?.avatar}/>
                        {
                            !['rooms','userRooms'].includes(roomType) &&
                            <DeleteSweep onClick={onDeleteMess}/>
                        }
                    </MyChatBox>
                        
                    : messInfo.userId==='AdminTeam'?
                        <AdminChatBox>
                            <img alt='' src={userInfo?.avatar}/>
                            {message}
                        </AdminChatBox> 
                        :
                        <OtherChatBox>
                            <img alt='' src={userInfo?.avatar}/>
                            {message}
                        </OtherChatBox> 
            }
        </MessContainer>
    )
}

export default Message
const MessStickerContainer = styled.span `
    flex: 1;
    > img {
        border-radius: 10px;
        width: 100%;
        max-width: 150px;
    }
`

const MessContainer = styled.div `
    display: flex;
    > div:not(#loading) {
        margin-bottom: 5px;
        display: flex;
        height: fit-content;
        width: 99%;
        flex:1;
        align-items: center;
        padding: 20px 0 0 10px;

        > img {
            height: 55px;
            border-radius: 55px;
            margin: 0 10px;
            border: 2px solid var(--dark-main);
        }
    }
`

const MessInfo = styled.div `
    padding: 0 10px;
    width: fit-content;
    max-width: 50%;
    border-radius: 20px;
    word-break: break-word;
    > h4 {
        margin: 10px;
        font-size: 14pt;
    }

    > p {
        margin: 10px;
        margin-top: 0;
    }

    > h4 > div {
        padding: 0;
        margin: 0;
        font-weight: normal;
        font-size: 9pt;
    }

    > h4 > .MuiSvgIcon-root {
        font-size: 12pt;
        margin: 0 6px;
        display: flex;
        text-align: left;
        align-content: center;
    }
`

const MyChatBox = styled.div `
    color: white;
    justify-content: flex-end;
    padding-right: 20px;
    position: relative;
    
    > div {
        position: relative;
        background-color: var(--dark-main);
        border: 2px solid #4E342E;

        > img {
            width: 33px;
            position: absolute;
            top: -11px;
            left: -5px;
        } 

        > p a {
            color: gold;
            :visited {
                color: darkgray;
            }
        }
    }  

    .MuiSvgIcon-root {
        position: absolute;
        bottom: -10px;
        margin-right: 52px;
        color: var(--dark-main);
        opacity: 60%;
        font-size: 20pt;
        /* padding: 1px; */
        cursor: pointer;
        border-radius: 7px;
        width: fit-content;

        :hover {
            opacity: 100%;
            color: var(--dark-main);
            background-color: rgba(255, 255, 255, 90%);
        }
    }
`;


const OtherChatBox = styled.div `
    color: var(--dark-main);
    justify-content: flex-start;
    
    > div {
        position: relative;
        background-color: white;
        border: 2px solid var(--dark-main);

        > img { 
            width: 33px;
            position: absolute;
            top: -12px;
            right: -9px;
        } 
    }
`;

const AdminChatBox = styled.div `
    color: white;
    justify-content: flex-start;
    
    > div {
        position: relative;
        background-color: var(--dark-main);
        border: 2px solid #4E342E;

        > img { 
            width: 33px;
            position: absolute;
            top: -12px;
            right: -8px;
        }

        > p a {
            color: gold;
            :visited {
                color: darkgray;
            }
        }
    }
`;