import React, { useEffect } from 'react'
import firebase from 'firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import PageLoading from '../components/features/PageLoading';
import PageSignIn from '../components/features/PageSignIn';
import { auth, db } from '../services/firebase/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { getLocalUser } from '../utils/localStorage';
import { getUser, setUser, userState } from '../features/userSlice';


function Auth({children}) {
    const userInfo = useSelector(userState);
    const [user, loading] = useAuthState(auth);
    const dispatch = useDispatch();
    useEffect(() => {
        if (getLocalUser('userChatApp')) {
            dispatch(getUser());
        }

        if (user) {
            db.collection('users').where('email','==',user.email).get()
            .then(query => {
                if (query.docs.length === 0) {
                    let username = 'gg.' + user.email.slice(0, user.email.search('@'));
                    let newUser = {
                        displayName: auth.currentUser.displayName,
                        photoURL: auth.currentUser.photoURL,
                        isGGUser: true,
                        password: '',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        nickname: auth.currentUser.displayName,
                        email: user.email,
                        username,
                        avatar: auth.currentUser.photoURL,
                    }    
                    db.collection('users').add(newUser)
                    .then(query => {
                            dispatch(setUser( {user: newUser, userId: query.id} ));
                            alert("You've successfully signed up. Your Meow's username is: \n" + username);
                        })
                    
                } else {
                    db.collection('users').doc(query.docs[0].id).update({
                            displayName: auth.currentUser.displayName,
                            photoURL: auth.currentUser.photoURL,
                        });
                    let oldUser = query.docs[0].data();
                    dispatch(setUser({user: oldUser, userId: query.docs[0].id}));
                }
            })
        }
    },[loading,user])

    return (
        <>
         {
            loading ? 
                <PageLoading/>: 
            (!user && !userInfo) ? 
                <PageSignIn/>:  
                (children)
         }   
        </>
    )
}

export default Auth
