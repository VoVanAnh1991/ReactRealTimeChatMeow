import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { db } from '../../services/firebase/firebase';
import { useSelector, useDispatch } from 'react-redux';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import { getUser, setSignIn, setUser, userIdState, userState } from '../../features/userSlice';
import { optionIdState, optionState } from '../../features/roomSlice';
import SidebarOption from './SidebarOption';
import PetsIcon from '@material-ui/icons/Pets';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import StarIcon from '@material-ui/icons/Star';
import SidebarSubOption from './SidebarSubOption';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InnerLoading from '../features/InnerLoading';
import AddCommentIcon from '@material-ui/icons/AddComment';
import EditOutlineIcon from '@material-ui/icons/EditOutlined';

function Sidebar() {
    const [anchorEl, setAnchorEl] = useState();
    const user = useSelector(userState);
    const userId = useSelector(userIdState);
    const option = useSelector(optionState);
    const optionId = useSelector(optionIdState);
    const dispatch = useDispatch();
    const [avatar, setAvatar] = useState(user.avatar);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [rooms] = useCollection(db.collection('rooms').orderBy('lastChanged','desc'));
    const [userData] = useDocument(db.doc(`users/${userId}`));
    const [userRooms] = useCollection( optionId && db.collection('userRooms')
    .orderBy('lastChanged','desc'));
        
    useEffect(() => {
        userData && setAvatar(userData.data().avatar);
        let results = [];
        userRooms && userRooms.docs.forEach(doc => {
            if (doc.data().roomType===optionId && doc.data().roomUserIds.includes(userId)) {
                results.push({...doc.data(), id: doc.id})
            }
        });
        setFilteredRooms(results);
    },[userData, optionId, userRooms])

    const onChangeAvatar = (e) => {
        switch (e.target.id) {
            case 'boyAvatar':
                setAvatar('https://my-meow-chat.web.app/Avatar/AvatarBoy.png');
                break;
            case 'girlAvatar':
                setAvatar('https://my-meow-chat.web.app/Avatar/AvatarGirl.png');
                break;
            case 'catAvatar':
                setAvatar('https://my-meow-chat.web.app/Avatar/AvatarCat.png');
                break;
            case 'photoURL':
                setAvatar(user.photoURL);
                break;
            default:
                setAvatar('https://my-meow-chat.web.app/static/media/Logo.ca25a2e2.png');
                break;
        };
    }

    const setNickname = () => {
        let nickname = prompt('Wanna edit your nickname?')
        nickname && db.doc('users/'+userId).update({nickname: nickname})
        db.doc('users/'+userId).get().then(doc=>dispatch( setUser({user: doc.data(), userId: doc.id }) ));
        
    }

    return (
        <SidebarContainer id="sidebar">
            <SidebarHeader id="sidebar-header">
                <SidebarAvatar>
                    <IconButton  type='submit' onClick = {setNickname}
                    > <EditOutlineIcon style={{fontSize: '13pt'}}/> </IconButton>

                    <AvatarContainer>
                        <img alt="avatar" src={ avatar }
                            onClick={e => setAnchorEl(e.currentTarget)}
                        />
                    </AvatarContainer>
                    <Menu 
                        id="avatar-menu" anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={()=>{
                            setAnchorEl(false);
                            if (avatar!==user.avatar) {
                                db.collection('users').doc(userId).update({avatar})
                                db.collection('users').doc(userId).get()
                                .then(query => {
                                    dispatch(setSignIn({user: query.data(), userId: query.id}));
                                })
                            }
                        }}                    
                        PaperProps={{
                            style: {
                                marginLeft: "60px",
                                marginTop: "50px",
                                color: 'white',
                                backgroundColor: 'var(--light-main)',
                            }
                        }}
                    >
                        <MenuItem onClick={onChangeAvatar} id={'logo'}>Meow Logo</MenuItem>
                        <MenuItem onClick={onChangeAvatar} id={'boyAvatar'}>Boy Avatar</MenuItem>
                        <MenuItem onClick={onChangeAvatar} id={'girlAvatar'}>Girl Avatar</MenuItem>
                        <MenuItem onClick={onChangeAvatar} id={'catAvatar'}>Cat Avatar</MenuItem>
                        { user.isGGUser && (<MenuItem onClick={onChangeAvatar} id={'photoURL'}>Google Avatar</MenuItem>) }
                    </Menu>
                </SidebarAvatar>
                <SidebarInfo>
                    <h2> { user.nickname }</h2>
                    <h3> { user.username } </h3>
                </SidebarInfo>
            </SidebarHeader>
            <HrContainer><hr/></HrContainer>

            <SidebarOptionContainer id="sidebar-options">
                <SidebarOption title={'Meow Keepbox'} userData={userData}
                    Icon={option==='Meow Keepbox'? ExpandMoreIcon : CollectionsBookmarkIcon}/>
                <SidebarOption title={'Meow Friends'} userData={userData}
                    Icon={option==='Meow Friends'? ExpandMoreIcon : PetsIcon} />
                <SidebarOption title={'Meow Rooms'} userData={userData}
                    Icon={option==='Meow Rooms'? ExpandMoreIcon : BeachAccessIcon} />
                <SidebarOption title={'Public Rooms'} 
                    Icon={option==='Public Rooms'? ExpandMoreIcon : NotificationImportantIcon}/>
            </SidebarOptionContainer>
            <HrContainer><hr/></HrContainer>

            <SidebarSubOptionContainer>
                { 
                    optionId?
                        (rooms && filteredRooms)?
                            optionId === 'rooms'?
                                rooms?.docs.map( doc =>
                                    <span key={'rooms'+doc.id}><SidebarSubOption id={doc.id} Icon={StarIcon} 
                                    roomInfo={doc.data()}  optionId={optionId}/></span>
                                )
                                :
                                filteredRooms?.length === 0?
                                    (<>
                                        <SidebarSubOption
                                        title={'add'} Icon={AddCommentIcon}/>
                                        <p>----Empty----</p>
                                    </>)
                                    : 
                                    (<>
                                        <SidebarSubOption title={'add'} Icon={AddCommentIcon}/>
                                        {filteredRooms?.map( roomInfo =>
                                            <SidebarSubOption key={roomInfo.type+roomInfo.id} id={roomInfo.id} Icon={StarIcon} 
                                            roomInfo={roomInfo}/>
                                        )}
                                    </>)                                    
                            :
                            <LoadingContainer>
                                <InnerLoading color={"var(--loaing-color)"}/>
                                <InnerLoading color={"var(--loaing-color)"}/>
                                <InnerLoading color={"var(--loaing-color)"}/>
                                <InnerLoading color={"var(--loaing-color)"}/>
                            </LoadingContainer>
                    : <></>
                }
            </SidebarSubOptionContainer>
        </SidebarContainer>)
}

export default Sidebar

const SidebarContainer = styled.div `
    background-color: var(--light-main);
    width: var(--sidebar-width);
    height: var(--sidebar);
    color: white;
`
const AvatarContainer = styled.div `
    --avatar-size: 90px;
    display: flex;
    align-items: center;
    height: var(--avatar-size);

    >img {
        cursor: pointer;
        width: var(--avatar-size);
        height: var(--avatar-size);
        border-radius: 50%;
        margin: 5px;
    }
`

const SidebarHeader = styled.div `
    @media screen 
    and (max-height: 450px)
    { height: var(--sidebar-header-sm) }

    height: var(--sidebar-header);
    position: relative;
    padding-top: 10px ;
    padding-bottom: 0px;
    width: 100%;
`

const SidebarAvatar = styled.div `
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    position: relative;
    
    > .MuiButtonBase-root {
        cursor: pointer;
        z-index: 2;
        position: absolute;
        top: 0px;
        right: 30px;
        padding: 3px;
        background-color: var(--mid-main);
        color: white;
        
        :hover {
            color: var(--mid-main);
            background-color: white;
        }
    }
`

const SidebarInfo = styled.div `
    @media screen 
    and (max-height: 450px)
    { display: none; }

    display: grid;

    > h2 {
        font-size: 16pt;
        font-weight: bold;
        margin: 3px 5px;
        text-align: center;
        text-shadow: 2px 1px 1px var(--dark-main);
    }
    > h3 {
        margin: 3px 5px;
        font-size: 11pt;
        font-weight: normal;
        text-align: center;
        text-shadow: 2px 1px 1px var(--dark-main);
    }
    > h2 > .MuiSvgIcon-root {
        font-size: 10pt;
        color: brown;
        margin-left: -10px;
    }
`
const HrContainer = styled.div `
    min-height: var(--sidebar-hr);
    display: flex;
    justify-content: center;
    align-content: center;
    > hr{
        flex: 1;
        border-width: 0;
        height: 2px;
        color: white !important;
        background-color: white !important;
    }
`

const SidebarOptionContainer = styled.div `
    height: var(--sidebar-options);
`

const SidebarSubOptionContainer = styled.div `
    @media screen 
    and (max-height: 450px)
    { height: var(--sidebar-subOptions-sm); }
    
    height: var(--sidebar-subOptions);
    background-color: white;
    overflow-x: hidden;
    margin: 0;
    > div {
        width: 100%;
    }
    > p {
        color: var(--dark-main);
        width: 100%;
        text-align: center;
        font-size: 14pt;

    }
    ::-webkit-scrollbar {
        width: 13px;
    }

    ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.6);
        border-radius: 99999;
    }

    ::-webkit-scrollbar-thumb {
        background: var(--light-main);
        border-radius: 7px;
        
        :hover {
            background: var(--mid-main)
        }
    }
`

const LoadingContainer = styled.div `
    --loaing-color: var(--mid-main);
    display: flex;
    margin: 25px 10px 10px 5px;
    justify-content: center;
    align-items: center;
    width: 100%;    
`

