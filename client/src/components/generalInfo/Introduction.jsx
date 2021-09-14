import React, { useEffect, useMemo, useState } from 'react';
import { isMobileOnly } from 'react-device-detect';

import { useUsersStore } from '../../stores/index.store';
import Message from '../../genericComponents/Message.jsx';
import { getCookie, OUR_COOKIE } from '../../consts/cookies';

import Loader from '../../genericComponents/Loader';

import './Introduction.scss';
import '../../consts/Btns.scss';
import '../../consts/PhoneHeader.scss';
import '../../consts/logos.scss';
import '../../consts/classNames.scss';

const message = `היי!\nשמחים לראות אותך פה. \n לפני שנתחיל בבדיקת האוריינות הדיגיטלית שלך, נמלא שאלון הכרות קצר`;

function Introduction({ nextPage, setFadeOutAnimation, fadeOutAnimation, setOvalAnimation, nextPageMobile, mobileAllButton }) {

    const usersStore = useUsersStore();
    const [buttonAllowed, setButtonAllowed] = useState(!getCookie(OUR_COOKIE));
    const [imagesLoaded, setImagesLoaded] = useState(0);

    const handleKey = (e) => {
        if (e.keyCode === 13) { moveOn() }
    }
    useEffect(() => { // ! for checking and stuff
        if (getCookie(OUR_COOKIE)) {
            usersStore.showErrorPopUp("ניתן לענות על השאלון פעם אחת בלבד")
        } // cookies already exist
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const moveOn = () => {
        if (!navigator.cookieEnabled) {
            alert('אנא אשר שימוש בעוגיות כדי להשתמש באתרינו, תודה');
            return;
        }
        if (buttonAllowed) {
            setButtonAllowed(false);
            if (isMobileOnly) {
                nextPageMobile();
            }
            else {
                setOvalAnimation('temp-oval-move-right-introduction')
                setFadeOutAnimation('fade-out')
                const animated = document.getElementById('instroduction-ovals')
                animated.addEventListener('animationend', nextPage);
            }
        }
        else {
            if (!usersStore.errorPopUp) {
                usersStore.showErrorPopUp("ניתן לענות על השאלון פעם אחת בלבד")
            }
        }
    }

    const handleLoad = useMemo(() => {
        return (isMobileOnly) ? (imagesLoaded === 2) : (imagesLoaded === 1);
    }, [imagesLoaded])

    return (
        <>
            {handleLoad ? '' : <Loader />}
            <div id='intro-page' className={` ${handleLoad ? 'fade-in' : 'hide-shape'} ${!isMobileOnly && "fade-in"} ${!isMobileOnly && fadeOutAnimation}`} >
                {isMobileOnly ? //* two logos on mobile
                    <div className="two-logos">
                        <img alt="" src="/logos/phone_logo.png" className={` mobile-logo`} draggable={false} onLoad={() => setImagesLoaded(prevState => prevState + 1)} />
                        <img alt="" src="/logos/digital-orientation-logo.png" className={` mobile-logo`} draggable={false} onLoad={() => setImagesLoaded(prevState => prevState + 1)} />
                    </div>
                    :
                    <img alt="" src="/logos/digital-orientation-logo.png" className={`${handleLoad ? 'fade-in' : 'hide-shape'} phone-logo`} draggable={false} onLoad={() => setImagesLoaded(prevState => prevState + 1)} />}

                <div id={isMobileOnly ? "mobile-header" : "phone-header"} className="phone-header ">אוריינות דיגיטלית</div>
                < Message message={message} num={1} />
                {isMobileOnly ?
                    <div onClick={moveOn} className={buttonAllowed ? "" : "not-selected"}>{mobileAllButton}</div>
                    :
                    <div className={`phone-btn ${isMobileOnly ? "mobile" : "upper"}-btn ${buttonAllowed ? "" : "cursor-default"}`} onClick={moveOn} tabIndex="0" onKeyDown={handleKey}>לשאלון</div>}
            </div>
        </>
    );
}

export default Introduction;