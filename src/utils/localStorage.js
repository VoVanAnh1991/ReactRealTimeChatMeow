export const getLocalUser = (user)=>{
    if(localStorage.getItem(user))
        return localStorage.getItem(user);
    else return null;
}

export const setLocalUser = (user)=>{
    localStorage.setItem('userChatApp', JSON.stringify(user));
}

export const removeLocalUser = ()=>{
    localStorage.removeItem('userChatApp');
}