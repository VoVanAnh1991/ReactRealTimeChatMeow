import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    roomId: null,
    roomType: null,
    optionId: 'rooms',
    option: 'rooms',
    onManageRoom: {loading: false, roomName: null},
}

export const roomSlice = createSlice({
    name: 'room', initialState, 
    reducers: {
        enterRoom: (state, action) => { 
            state.roomId = action.payload.roomId;
            state.roomType = action.payload.roomType;
        },
        setOption: (state, action) => { state.option = action.payload.option},
        setOptionId: (state, action) => { state.optionId = action.payload.optionId},
        setOnManageRoom: (state, action) => {state.onManageRoom = action.payload}

    }
})

export const { enterRoom, enterCollection, setOption, setOptionId, setOnManageRoom } = roomSlice.actions;
export const roomIdState = (state) => state.room.roomId; 
export const roomTypeState = (state) => state.room.roomType; 
export const optionState = (state) => state.room.option; 
export const optionIdState = (state) => state.room.optionId; 
export const onManageRoomState = (state) => state.room.onManageRoom; 

export default roomSlice.reducer;