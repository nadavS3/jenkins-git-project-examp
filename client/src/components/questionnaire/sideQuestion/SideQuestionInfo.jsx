import React, { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import "./SideQuestionInfo.scss";
import "../../../consts/PhoneHeader.scss";
import { useQuestionsStore, useUsersStore } from "../../../stores/index.store";
import { observer } from "mobx-react-lite";
import Loader from "../../../genericComponents/Loader";
import { ANSWER_STATUS, POP_UP_MESSAGE_PROBLEM, QUESTION_TYPES } from "../../../consts/consts";
import DraggableElements from "../../../genericComponents/DraggableElements";
import { isMobileOnly } from "react-device-detect";

function SideQuestionInfo({ setDisplayMenu, submitAnswer, activateFadeOutAndInitiateCB }) {
  const questionsStore = useQuestionsStore();
  const usersStore = useUsersStore();
  const history = useHistory();
  const [canUserPlayAudio, setCanUserPlayAudio] = useState(true);

  const Qtype = questionsStore.currentQuestionInfo.questionType


  const genericSubmit = (e) => {
    let answerStatus = questionsStore.getCheckIfDDQCorrect ? ANSWER_STATUS.CORRECT : ANSWER_STATUS.INCORRECT;
    e.persist();
    // * we want to pass arguments to the resolve function so we wrap it and now we can pass the wrapping func as cb to eventListener
    questionsStore.setFadeIn('')
    const answerDuration = Date.now() - questionsStore.getQuestionTimer;
    questionsStore.setCanUserClickClass("disable-click");
    questionsStore.setImageLoaded(false);
    if (answerStatus === ANSWER_STATUS.CORRECT || answerStatus === ANSWER_STATUS.INCORRECT) {
      activateFadeOutAndInitiateCB(() => submitAnswer(answerStatus, answerDuration))
    } else throw Error("something went wrong")
  }
  useEffect(() => {
    if (questionsStore.currentQuestionInfo === null) { usersStore.showErrorPopUp(POP_UP_MESSAGE_PROBLEM); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clickedMenuBtn = () => {
    if (questionsStore.currentQuestionInfo.questionType === QUESTION_TYPES.DDQ) {
      questionsStore.resetDDQToInitial()
    }
    setDisplayMenu(true);
    window.gtag("event", `open_questionnaire_menu`, { event_category: "buttons", event_label: "Opened questionnaire menu", })
  }

  const handleAudioBtnClick = () => {
    setCanUserPlayAudio(false);
    questionsStore.playQuestionAudio();
  }

  useEffect(() => {
    const audioBtnTimeOut = setTimeout(() => setCanUserPlayAudio(true), 1000);
    return () => { clearTimeout(audioBtnTimeOut); }
  }, [canUserPlayAudio])

  return (
    <>
      {!questionsStore.currentQuestionInfo ? <Loader /> :
        <div id="side-question-info">
          <div>
            {!questionsStore.onReviewMode &&
              (<div id="menu-buttons-container" >
                <div id="popup-menu-btn" className={`${questionsStore.canUserClickClass} menu-button`} onClick={clickedMenuBtn}>
                  <img alt="" id="popup-menu-img" className="menu-button-img" src='/icons/Icon-list-ul.svg' draggable={false}></img>
                  שאלות
                </div>
                <div id="audio-btn" onClick={handleAudioBtnClick} className={`${!canUserPlayAudio ? "disable-audio-btn" : undefined} menu-button`} >
                  <img alt="שמע" id="audio-img" className={`${questionsStore.getAudioImgClasses} menu-button-img`} src={questionsStore.getAudioImgSrc} draggable={false} ></img>
                  השמעה
                </div>
              </div>)}
            <div id="text-number-container" className={`${questionsStore.fadeIn} ${questionsStore.fadeOut}`}>
              <div id="question-number">{questionsStore.currentQuestionInfo.questionNumber}.</div>
              <div id="text-after-number">

                {questionsStore.currentQuestionInfo.questionStory ? <div id="story">{questionsStore.currentQuestionInfo.questionStory}</div> : ""}

                <div id="instruction">
                  {questionsStore.currentQuestionInfo.questionInstruction}
                </div>
                {Qtype === QUESTION_TYPES.DDQ ? <DraggableElements /> : ""}
                {Qtype === QUESTION_TYPES.DDQ && questionsStore.getIsDdqContinueButtonNeeded ?
                  <div className={`${questionsStore.canUserClickClass} menu-button ${questionsStore.onReviewMode ? "special-ddq-button-review" : ""}`} id="menu-button-continue-ddq" onClick={!questionsStore.onReviewMode ? ((e) => genericSubmit(e)) : () => { questionsStore.setDDQQuestionReviewToCorrect(); }} >
                    המשך
                  </div> : ''}
                {Qtype === QUESTION_TYPES.DDQ && questionsStore.onReviewMode ?
                  <div className={`${questionsStore.canUserClickClass} menu-button special-ddq-button-review`} id="menu-button-continue-ddq" onClick={() => { questionsStore.getCheckIfDDQCorrect ? questionsStore.setDDQQuestionReviewToIncorrect() : questionsStore.setDDQQuestionReviewToCorrect() }} >
                    {questionsStore.getCheckIfDDQCorrect ? "הצג תשובות משתמש" : "הצג תשובות נכונות"}
                  </div> : ''}
              </div>

            </div>
          </div>
          <div id="menu-bottom-container" >
            <img alt="" id='side-phone-background' className='side-phone-bottom-left' src='/images/backgrounds/questionImg.svg' draggable={false} ></img>
            {
              Qtype === QUESTION_TYPES.DDQ && questionsStore.getIsDdqResetButtonNeeded ?
                <>
                  <div className={`${questionsStore.canUserClickClass} menu-button`} id="menu-button-reset-ddq" onClick={() => { questionsStore.resetDDQ() }} >
                    <img alt="" id="reset-img" src='/icons/Icon-refreshing.svg' draggable={false}></img>
                    איפוס
                  </div>
                </> : ""
            }
            {questionsStore.onReviewMode&& !isMobileOnly ?
                  <>
                  <div className={`${questionsStore.canUserClickClass}`} id="menu-button-go-back-question-review" onClick={() =>{questionsStore.resetReviewAndGoBack();history.push('/');}} >
                    חזור למסך התוצאות
                  </div>
                </> : ""
          }
          </div>
        </div>}
    </>
  );
}

export default observer(SideQuestionInfo);
