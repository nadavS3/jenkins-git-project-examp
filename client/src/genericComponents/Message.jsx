import React from 'react';
import './Message.scss';
import { isMobileOnly } from "react-device-detect";
function Message(props) {
    return (
        <div style={props.style ? props.style : null} id={`message${props.num}`} className={`speech-bubble  ${props.className ? props.className : ""} ${isMobileOnly ? "mobile-speech" : "browser-speech"} ${props.reverse ? "reverse" : "regular"} `} key={props.num} >
            <div className={`message-text ${isMobileOnly ? 'mobile' : 'browser'}`} id={`message-text${props.num}`} key={props.num} > {props.message} </div>
        </div>
    );
}

export default Message;