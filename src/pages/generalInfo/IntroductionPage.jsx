import React, { useState } from 'react';
import {  isMobileOnly } from "react-device-detect";
import Introduction from '../../components/generalInfo/Introduction';
import './IntroductionPage.scss';
import BrowserTabletView from "../../genericComponents/browserTabletView";

function IntroductionPage(props) {

    const [ovalAnimation, setOvalAnimation] = useState('');
    const [fadeOutAnimation, setFadeOutAnimation] = useState('');
    const [imagesLoaded, setImagesLoaded] = useState(0);
    return (
        <>
            <BrowserTabletView  > {/* for now */}
                <img alt="" src="/images/animations/OvalsIntroduction.svg" onLoad={() => setImagesLoaded(prevState=>prevState+1)}  className={` ${imagesLoaded===2?'fade-in':'hide-shape'} ${ovalAnimation}`} id="instroduction-ovals" draggable={false} />
            </BrowserTabletView>
           <div > <img alt="" src={props.background} className={`intro-general ${fadeOutAnimation} ${imagesLoaded===2?'fade-in':'hide-shape'}`}  onLoad={() => {setImagesLoaded(prevState=>prevState+1);}} id={isMobileOnly ? "intro-mobile" : "intro-browser"} draggable={false} /></div>
            <Introduction nextPageMobile={props.nextPageMobile} mobileAllButton={props.mobileAllButton}  nextPage={props.nextPage} setFadeOutAnimation={setFadeOutAnimation} fadeOutAnimation={fadeOutAnimation} setOvalAnimation={setOvalAnimation} />
        </>
    )
}

export default IntroductionPage;
