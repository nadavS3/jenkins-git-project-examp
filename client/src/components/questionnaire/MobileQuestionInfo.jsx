import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { POP_UP_MESSAGE_PROBLEM } from "../../consts/consts";
import { useGenAlert } from "../../contexts/generalAlertCtx";
import Loader from "../../genericComponents/Loader";
import { useQuestionsStore, useUsersStore } from "../../stores/index.store";
import "./MobileQuestionInfo.scss";

function MobileQuestionInfo({ setDisplayMenu }) {

  const questionsStore = useQuestionsStore();
  const usersStore = useUsersStore();
  const genAlert = useGenAlert();

  useEffect(() => {
    if (questionsStore.currentQuestionInfo === null) { usersStore.showErrorPopUp(POP_UP_MESSAGE_PROBLEM); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDropDown = () => {
    if (questionsStore.currentQuestionInfo.questionStory) {
      if (questionsStore.canUserClickClass !== "disable-click") {
        questionsStore.setDisplayStory(!questionsStore.getDisplayStory);
      }
    }
    else {
      genAlert.openGenAlert({ text: "לשאלה זו אין תיאור שאלה.", center: true })
    }
  }

  return (
    <div id="mobile-question-info-container" >
      {!questionsStore.currentQuestionInfo ? <Loader /> :
        <div id="mobile-question-info" className={`${questionsStore.fadeIn} ${questionsStore.fadeOut}`}>
          <div id="top-row-container">
            <div id="question-number">{questionsStore.currentQuestionInfo.questionNumber}.</div>
            {!questionsStore.onReviewMode ? <div id="icons">
              <FontAwesomeIcon icon="list-ul" color="#103D6B" id="menu-icon" rotation={180} onClick={() => { setDisplayMenu(true); }} size="2x" />
              <FontAwesomeIcon id="audio-icon" onClick={questionsStore.playQuestionAudio} icon="volume-up" color="#103D6B" size="2x" />
              <FontAwesomeIcon id={questionsStore.onReviewMode ? "chevron-down" : questionsStore.getDisplayStory ? "chevron-up" : "chevron-down"} onClick={handleDropDown} icon="chevron-circle-down" color="#5188BF" size="2x" />
            </div> : null}
          </div>
          <div id="line"></div>
          {questionsStore.currentQuestionInfo.questionStory ? <div id="story" className={`${questionsStore.getDisplayStory ? "display-story" : "no-display-story"} question-text`}>
            {questionsStore.currentQuestionInfo.questionStory}
          </div> : ""}
          <div id="instruction" className="question-text">
            {questionsStore.currentQuestionInfo.questionInstruction}
          </div>
        </div>}
    </div>
  );
}

export default observer(MobileQuestionInfo);