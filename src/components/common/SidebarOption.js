import React from 'react';
import styled from "styled-components";
import { useDispatch } from 'react-redux';
import { setOption, setOptionId } from '../../features/roomSlice';

function SidebarOption({title, Icon }) {
    const dispatch = useDispatch();
    const onSidebarOptionClick = () => {
        dispatch(setOption({option: title})); 
        dispatch(setOptionId({optionId: title.replace('Meow ','user').replace('Public R','r')}));
    }
    return (
        <OptionContainer id="sidebar-option">
            <OptionChannel onClick={onSidebarOptionClick}>
                <Icon/>
                <span>{title}</span>
            </OptionChannel> 
        </OptionContainer>
    )
}

export default SidebarOption


const OptionChannel = styled.div`
    padding: 0px;
    padding-left: 10px;
    > span {
        margin-left: 10px;
        font-weight: 600;
        font-size: 14pt;
        text-shadow: 2px 1px 1px var(--dark-main);
    }
`
const OptionContainer = styled.div`
    position: relative;
    display: flex;
    user-select: none;
    width: 230px;
    text-align: left;
    font-size: 13.5pt;
    align-items: center;
    cursor: pointer;
    height: 40px;

    > .MuiSvgIcon-root {
        margin-right: 5px;
        margin-left: 5px;
    }

    >  div {
        display: flex;
        > .MuiSvgIcon-root {
            font-size: 25px;
            margin: 0 5px;
        }

        :hover {
            color: var(--mid-main);
            
            > span {
                text-shadow: 0px 0px ;  
            }
        }
    }
`
