import React, { useState } from 'react';
import {  MobileOnlyView } from "react-device-detect";
import SectorForm from '../../components/personalInfo/SectorForm';
import './SectorFormPage.scss';
import BrowserTabletView from "../../genericComponents/browserTabletView";
function SectorFormPage(props) {
    const [fadeOutAnimation, setFadeOutAnimation] = useState('');
    const [imagesLoaded, setImagesLoaded] = useState(0);
    return (
        <>
            <MobileOnlyView>

            </MobileOnlyView>
            <BrowserTabletView >
                <img alt="" src={props.background} onLoad={() => {setImagesLoaded(prevState=>prevState+1);}} className={`${imagesLoaded===1?'fade-in':'hide-shape'}  ${fadeOutAnimation}`} id="sector" draggable={false} />
            </BrowserTabletView>
            <SectorForm nextPageMobile={props.nextPageMobile} mobileAllButton={props.mobileAllButton} nextPage={props.nextPage}  fadeOutAnimation={fadeOutAnimation} setFadeOutAnimation={setFadeOutAnimation} />
        </>
    )
}

export default SectorFormPage;