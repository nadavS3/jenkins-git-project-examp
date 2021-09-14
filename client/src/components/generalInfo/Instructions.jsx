import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
import { browserName, isMobileOnly } from 'react-device-detect';

import { useLogin } from "@hilma/auth";

import { useUsersStore } from '../../stores/index.store';

import { POP_UP_MESSAGE_PROBLEM } from '../../consts/consts';
import { getCookie, OUR_COOKIE } from '../../consts/cookies';

import Message from '../../genericComponents/Message.jsx';

import './Instructions.scss';
import '../../consts/Btns.scss';
import '../../consts/PhoneHeader.scss';
import '../../consts/logos.scss';
import '../../consts/classNames.scss';

function Instructions(props) {

    const login = useLogin();
    const usersStore = useUsersStore();
    const history = useHistory();
    const [clicked, setClicked] = useState(false);
    const [buttonClasses, setButtonClasses] = useState("btn-no-display"); // btn-no-display / fade-in / fade-out 
    const [imagesLoaded, setImagesLoaded] = useState(0);

    useEffect(() => {
        if (getCookie(OUR_COOKIE)) { // our finished questionnaire cookie
            history.push("/");
            usersStore.showErrorPopUp("ענית כבר על שאלון זה");
        } // cookies already exist
        props.setLeafsAnimationClass('leaf-animation');
        setTimeout(() => {
            setButtonClasses(`fade-in`)
        }, 5000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleKey = (e) => {
        if (e.keyCode === 13) { moveOn() } // Enter
    }
    const moveOn = () => {
        try {
            setClicked(true); // in order to disable multiple clicks
            if (isMobileOnly) { // button only fades out in browser
                props.nextPageMobile();
            } else {
                setButtonClasses("fade-out");
            }
            setTimeout(async () => {
                let res = await usersStore.postUserInfo();
                if (res && res.data && res.data.klo && res.data.klo.length) {
                    props.setFadeOutAnimation('fade-out-2s-delay')
                    props.setLeafsAnimationClass('fade-out-2s-delay')
                    props.setPhoneFade('fade-out-2s-delay')
                    if (isMobileOnly) {
                        await login("api/my-user/login", { username: res.data.username, password: null })
                    }
                    else { // browser
                        const animated = document.getElementById('instructions')
                        animated.addEventListener('animationend', async (e) => {
                            await login("api/my-user/login", { username: res.data.username, password: null });
                        });
                    }
                    window.gtag("event", "sign_up", { method: 'Custom' });
                    window.gtag("event", `browser=${browserName}`, { event_category: "browser_detect", event_label: "Counts the browser for users", })
                }
                else
                    usersStore.showErrorPopUp(res);
            }, 3000)
        }
        catch (err) { usersStore.showErrorPopUp(POP_UP_MESSAGE_PROBLEM); }

    } // handle click

    const handleLoad = useMemo(() => {
        return (isMobileOnly) ? (imagesLoaded === 2) : (imagesLoaded === 1);
    }, [imagesLoaded])

    const messages = useMemo(() => [
        `שלום ${usersStore.firstName}, \nעכשיו אנחנו יכולים להתחיל בבדיקת האורינות הדיגיטלית`,
        "אנו נציג כאן על המסך מקרים ושאלות בתחומים שונים. עליך לענות או לסמן על גבי המסך או התמונה המצורפת לשאלה",
        "במהלך כל המבדק יוצג לך גרף ההתקדמות שלך בשאלון..",
        "אפשר להתחיל?",
        "יאללה נתחיל"
    ], [usersStore.firstName])

    return (
        <div className={`instructions-page  ${handleLoad ? 'fade-in' : 'hide-shape'}  ${!isMobileOnly ? props.fadeOutAnimation : ""}`}>
            {isMobileOnly ? // on mobile - two logos
                <div className="two-logos">
                    <img alt="" src="/logos/phone_logo.png" className="mobile-logo" draggable={false} onLoad={() => { setImagesLoaded(prevState => prevState + 1); }} />
                    <img alt="" src="/logos/digital-orientation-logo.png" className="mobile-logo" draggable={false} onLoad={() => { setImagesLoaded(prevState => prevState + 1); }} />
                </div> :
                <img alt="" src="/logos/digital-orientation-logo.png" className="phone-logo" draggable={false} onLoad={() => { setImagesLoaded(prevState => prevState + 1); }} />}

            <div id={isMobileOnly ? "mobile-header" : "phone-header"} className="phone-header">אוריינות דיגיטלית</div>

            <div id={`${isMobileOnly ? 'mobile' : 'browser'}-all-messages-container`} className="messages-container" >
                <Message message={messages[0]} num={1} />
                <Message message={messages[1]} num={2} />
                <Message message={messages[2]} num={3} />
                <Message message={messages[3]} num={4} />
            </div>
            <div id={`${isMobileOnly ? "mobile" : "browser"}-last-message`} className="last-message">
                {clicked ? <Message message={messages[4]} num={5} reverse={true} /> : ""}
            </div>
            {isMobileOnly ?
                <div id="mobile-instruction-btn" className={`${clicked ? "disable-click" : ""} ${buttonClasses}`} onClick={moveOn}>{props.mobileAllButton}</div>
                :
                <div className={`phone-btn instructions-btn ${clicked ? "disable-click" : ""} ${buttonClasses}`} onClick={moveOn} onKeyDown={handleKey} tabIndex="0">יאללה נתחיל</div>}
        </div>
    );
}

export default Instructions;