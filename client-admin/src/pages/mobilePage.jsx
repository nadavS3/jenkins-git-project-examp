import React from 'react';
import "./mobilePage.scss";

function MobilePage() {
    return (
        <div id="mobile-page">
            <img alt="" src="/logos/israel_digital.png" id="mobile-logo" draggable={false} />
            <div id="header">אוריינות דיגיטלית</div>
            <div id="desc" className="text">
                ניתן להיכנס למערכת האדמין ממחשב בלבד.
            </div>
        </div>
    )
}

export default MobilePage;