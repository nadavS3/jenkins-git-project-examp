import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import "./FinishQuestionnairePage.scss";
import FinishQuestionnaire from "../components/questionnaire/FinishQuestionnaire";
import Loader from "../genericComponents/Loader";
import {  isMobileOnly, MobileOnlyView } from "react-device-detect";
import BrowserTabletView from "../genericComponents/browserTabletView";
import '../consts/logos.scss'
// import {  useQuestionsStore} from "../stores/index.store";
function FinishQuestionnairePage(props) {
    // const questionsStore = useQuestionsStore();
    const [fadeOut, setFadeOut] = useState('');
    const [loadPage, setLoadPage] = useState(false);
    const [mobileBackgroundId, setMobileBackgroundId] = useState('');

    const doFadeOutAndCb = (cb) => {

        // const animated = document.getElementById('finish-questionnaire-phone-container_id');
        // setFadeOut('fade-out-2s-delay')
        // const executeCb = (e) =>{
        //     if (e.animationName !== 'fadeout2') { return }
        //     cb();

        //     animated.removeEventListener('animationend', executeCb);
        // }
        // animated.addEventListener('animationend', executeCb);

    }
    // background is in delay for now
    return (
        <div id={`finish-questionnaire-${isMobileOnly ? "mobile" : "phone"}-container`} className={`finish-questionnaire-container ${fadeOut} `}>
            {/* <img src="/images/backgrounds/Instructions_no_leafs.svg" alt="" id="plant-no-leafs" />  */}
            <BrowserTabletView >
                <img alt="" src="/images/png_phone.png" id="phone-fake-image" draggable={false} className={`fade-in `} onLoad={() => setLoadPage(true)} />
                <img alt="" src="/images/backgrounds/finishQuestionnaire.svg" className={`fade-in delay finish-questionnaire-browser`} id={''} draggable={false} />
                {loadPage ? <FinishQuestionnaire setMobileBackgroundId={setMobileBackgroundId} doFadeOutAndCb={doFadeOutAndCb} fadeOut={fadeOut} setFadeOut={setFadeOut} /> : <Loader />}
            </BrowserTabletView>
            <MobileOnlyView >
                <img alt="" src="/images/backgrounds/finishQuestionnaireMobile.svg" className={`fade-in delay finish-questionnaire-mobile`} id={mobileBackgroundId} draggable={false} />
                <FinishQuestionnaire setMobileBackgroundId={setMobileBackgroundId} doFadeOutAndCb={doFadeOutAndCb} fadeOut={fadeOut} setFadeOut={setFadeOut} />
            </MobileOnlyView>

        </div>
    );
}

export default observer(FinishQuestionnairePage);