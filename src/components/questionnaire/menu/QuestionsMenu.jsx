import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuestionsStore } from "../../../stores/index.store";
import { observer } from "mobx-react-lite";
import Loader from "../../../genericComponents/Loader";
import QuestionInMenu from "./QuestionInMenu";
import { POP_UP_MESSAGE_PROBLEM } from "../../../consts/consts";
import { GeneralAlert } from "../../../genericComponents/generalAlerts";
import { isMobileOnly } from "react-device-detect";

import "./QuestionsMenu.scss";
import "../../../consts/animations.scss";

function QuestionsMenu({ activateFadeOutAndInitiateCB, setDisplayMenu }) {
    const questionsStore = useQuestionsStore();
    const [popUpNeeded, setPopUpNeeded] = useState(false);
    const [popUpText, setPopUpText] = useState("");

    useEffect(() => {
        try {
            if (!questionsStore.menuInfo || questionsStore.menuInfo.length === 0) {
                questionsStore.fetchMenuInfo();
            }
        }
        catch (err) {
            setPopUpNeeded(true);
            setPopUpText(POP_UP_MESSAGE_PROBLEM);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        let popUpTimeOut
        if (popUpNeeded) {
            popUpTimeOut = setTimeout(() => {
                setPopUpNeeded(false)
            }, 5000)
        }
        return () => {
            clearTimeout(popUpTimeOut);
        }
    }, [popUpNeeded])

    return (
        <div id={`${isMobileOnly ? "mobile" : "browser"}-menu`} className="questions-menu fade-in" >
            <div id="menu-container">
                {questionsStore.menuInfo ? questionsStore.menuInfo.map((question, index) =>
                    <QuestionInMenu
                        activateFadeOutAndInitiateCB={activateFadeOutAndInitiateCB}
                        question={question}
                        key={question._id}
                        number={index + 1}
                        setPopUpNeeded={setPopUpNeeded}
                        setPopUpText={setPopUpText}
                        setDisplayMenu={setDisplayMenu}
                    />
                ) : <Loader />}
            </div>
            <div id="close-menu-btn" onClick={() => { setDisplayMenu(false); }}>
                <FontAwesomeIcon icon="times" color="white" id="close-menu-img" size="2x" />
            </div>
            {popUpNeeded && <GeneralAlert text={popUpText} center={true} isRelative={true} />}
        </div>
    );
}

export default observer(QuestionsMenu);