import React from 'react'
import { isMobileOnly } from 'react-device-detect';

import './generalAlerts.scss'


export const GeneralAlert = ({ text, warning, center, isPopup, isRelative = false, noTimeout = false }) => {
    if (typeof text !== "string") { return null; }
    if (isPopup) return <GeneralPopup text={text} {...isPopup} />

    return (
        <div id="general-alert-container" className={`${warning ? "warning-color" : "default-color"} ${center ? "center" : ""} ${isMobileOnly ? "mobile" : ""} ${noTimeout ? "" : "timeout-animation"} ${isRelative && 'relative'}`} >
            {text}
        </div>
    );
}

export const GeneralPopup = ({ text, okayText, cancelText, closeSelf, popupCb: cb }) => {

    return (
        <div id="popup-alert-full-window" >
            <div className="popup-alert-container">
                <h3 id="popup-text" >{text}</h3>
                <div className="popup-buttons-container" >
                    {cancelText ? <button onClick={() => { cb && typeof cb === "function" && cb(false); closeSelf() }} className="popup-cancel" ><h4>{cancelText || "בטל"}</h4></button> : null}
                    <button onClick={() => { cb && typeof cb === "function" && cb(true); closeSelf() }} className="popup-okay" ><h4>{okayText || "אשר"}</h4></button>
                </div>
            </div>
        </div>
    )
}
