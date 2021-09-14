import React, { useState } from 'react';
import Instructions from '../../components/generalInfo/Instructions';
import './InstructionsPage.scss';
import BrowserTabletView from "../../genericComponents/browserTabletView";
function InstructionsPage(props) {
    const [leafsAnimationClass, setLeafsAnimationClass] = useState('');
    const [fadeOutAnimation, setFadeOutAnimation] = useState('');
    const [imagesLoaded, setImagesLoaded] = useState(0);
    return (
        <>
            <BrowserTabletView >
                <img alt="" src="/images/animations/leaf_right1.svg" className={`leaf ${imagesLoaded === 4 ? 'fade-in' : 'hide-shape'} ${leafsAnimationClass} ${fadeOutAnimation}`} id="instructions-leaf-right" draggable={false} onLoad={() => { setImagesLoaded(prevState => prevState + 1); }} />
                <img alt="" src="/images/animations/leaf_center1.svg" className={`leaf ${imagesLoaded === 4 ? 'fade-in' : 'hide-shape'} ${leafsAnimationClass} ${fadeOutAnimation} `} id="instructions-leaf-center" draggable={false} onLoad={() => { setImagesLoaded(prevState => prevState + 1); }} />
                <img alt="" src="/images/animations/leaf_left1.svg" className={`leaf ${imagesLoaded === 4 ? 'fade-in' : 'hide-shape'} ${leafsAnimationClass} ${fadeOutAnimation} `} id="instructions-leaf-left" draggable={false} onLoad={() => { setImagesLoaded(prevState => prevState + 1); }} />
                <img alt="" src={props.background} className={`${imagesLoaded === 4 ? 'fade-in' : 'hide-shape'} ${fadeOutAnimation}`} id="instructions" draggable={false} onLoad={() => { setImagesLoaded(prevState => prevState + 1); }} />
            </BrowserTabletView>
            <Instructions nextPageMobile={props.nextPageMobile} mobileAllButton={props.mobileAllButton} setLeafsAnimationClass={setLeafsAnimationClass} fadeOutAnimation={fadeOutAnimation} setFadeOutAnimation={setFadeOutAnimation} setPhoneFade={props.setPhoneFade} />
        </>
    )
}

export default InstructionsPage;