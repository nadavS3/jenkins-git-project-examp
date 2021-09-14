import React, { useState } from 'react';

import OrganizationForm from '../../components/personalInfo/OrganizationForm';
import './OrganizationFormPage.scss';
import BrowserTabletView from "../../genericComponents/browserTabletView";

const NUM_OF_IMAGES = 2;

function OrganizationFormPage(props) {

    const [ovalAnimation1, setOvalAnimation1] = useState('');
    const [fadeOutAnimation, setFadeOutAnimation] = useState('');
    const [imagesLoaded, setImagesLoaded] = useState(0);
    // const [fadeOutAnimationMobile, setFadeOutAnimationMobile] = useState('');

    return (
        <>
            <BrowserTabletView >
                <img alt="" src="/images/animations/OrganizationBubble1.svg" className={`${imagesLoaded === NUM_OF_IMAGES ? 'fade-in' : 'hide-shape'} ${ovalAnimation1}  `} id="organization-oval1" draggable={false} onLoad={() => { setImagesLoaded(prevState => prevState + 1); }} />
                <img alt="" src={props.background} id="org" className={`${imagesLoaded === NUM_OF_IMAGES ? 'fade-in' : 'hide-shape'} ${fadeOutAnimation}`} draggable={false} onLoad={() => { setImagesLoaded(prevState => prevState + 1); }} />
            </BrowserTabletView>

            <OrganizationForm
                nextPageMobile={props.nextPageMobile}
                mobileAllButton={props.mobileAllButton}
                nextPage={props.nextPage}
                fadeOutAnimation={fadeOutAnimation}
                setOvalAnimation2={props.setOvalAnimation2}
                setFadeOutAnimation={setFadeOutAnimation}
                setOvalAnimation1={setOvalAnimation1}
            />
        </>
    )
}

export default OrganizationFormPage;
