import React, { useState } from 'react';
import PersonalData from '../../components/personalInfo/PersonalData';
import { MobileOnlyView } from "react-device-detect";
import './PersonalDataPage.scss';
import BrowserTabletView from "../../genericComponents/browserTabletView";
function PersonalDataPage(props) {

    const [ovalAnimation1, setOvalAnimation1] = useState('');
    const [fadeOutAnimation, setFadeOutAnimation] = useState('');
    const [imagesLoaded, setImagesLoaded] = useState(0);

    return (
        <>
            <MobileOnlyView>

            </MobileOnlyView>
            <BrowserTabletView >
                <img alt="" src="/images/animations/PersonalDataOval1.png" onLoad={() => {setImagesLoaded(prevState=>prevState+1);}} className={`${imagesLoaded===2?'fade-in':'hide-shape'} ${ovalAnimation1} `} id="personal-data-oval1" draggable={false} />
                <img alt="" src={props.background} className={`${imagesLoaded===2?'fade-in':'hide-shape'} ${fadeOutAnimation}`} id="data" draggable={false} onLoad={() => {setImagesLoaded(prevState=>prevState+1);}} />
            </BrowserTabletView>

            <PersonalData nextPageMobile={props.nextPageMobile} mobileAllButton={props.mobileAllButton} nextPage={props.nextPage} fadeOutAnimation={fadeOutAnimation} setFadeOutAnimation={setFadeOutAnimation} setOvalAnimation2={props.setOvalAnimation2} setOvalAnimation2FadeOut={props.setOvalAnimation2FadeOut} setOvalAnimation1={setOvalAnimation1} />
        </>
    )
}

export default PersonalDataPage;