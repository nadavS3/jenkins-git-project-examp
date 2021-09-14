import React from 'react';
import "./RotateYourDevicePage.scss";

function RotateYourDevicePage() {
    return (
        <div id="rotate-page">
            <img alt="" src="/logos/new_logo.png" id="mobile-logo" draggable={false} />
            <div id="header">אוריינות דיגיטלית</div>
            <div id="desc" className="text">
                נא לסובב את המסך על מנת לענות על השאלון.
            </div>
        </div>
    )
}

export default RotateYourDevicePage;