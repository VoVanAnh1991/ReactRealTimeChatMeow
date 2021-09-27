import { createSlice } from "@reduxjs/toolkit";
import { getLocalUser, removeLocalUser, setLocalUser } from "../utils/localStorage";

const initialState = {
    loading: false,
    user: null,
    userId: null,
}

export const userSlice = createSlice({
    name: 'user', initialState, 
    reducers: {
        setLoading: (state, action) => { state.loading = action.payload.loading },
        setUser: (state, action) => { state.user = action.payload.user;
            state.userId = action.payload.userId;},
        setSignIn: (state, action) => { 
            state.user = action.payload.user;
            state.userId = action.payload.userId;
            setLocalUser({user: state.user, userId: state.userId});
        },
        getUser: (state) => {
            state.user = JSON.parse(getLocalUser("userChatApp")).user;
            state.userId = JSON.parse(getLocalUser("userChatApp")).userId;
        },
        removeUser: (state) => {
            state.user = removeLocalUser("userChatApp");
        },
    }
})

export const { setLoading , setUser, setSignIn, getUser, removeUser } = userSlice.actions;
export const loadingState = (state) => state.user.loading; 
export const userState = (state) => state.user.user; 
export const userIdState = (state) => state.user.userId; 

export default userSlice.reducer;