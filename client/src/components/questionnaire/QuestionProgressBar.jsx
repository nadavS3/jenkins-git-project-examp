import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from "mobx-react-lite";

import { useQuestionsStore, useUsersStore } from "../../stores/index.store";
import { ANSWER_STATUS, POP_UP_MESSAGE_PROBLEM } from '../../consts/consts';

import './QuestionProgressBar.scss'
import { isMobileOnly } from 'react-device-detect';

const NEXT = "הבא";
const DONT_KNOW = "אני לא יודע/ת";
const CHOOSE_ANSWER = "בחר תשובה";
const SHOW_ANSWERS = "הצג תשובות"

function QuestionProgressBar(props) {
  const questionsStore = useQuestionsStore();
  const usersStore = useUsersStore();
  const history = useHistory();

  const submit = () => {
    const answerDuration = Date.now() - questionsStore.getQuestionTimer;
    props.submitDontKnow(ANSWER_STATUS.SKIPPED, answerDuration);
  }

  useEffect(() => {
    if (questionsStore.answeredQuestions === null || questionsStore.totalNumberOfQuestions === null) { usersStore.showErrorPopUp(POP_UP_MESSAGE_PROBLEM); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //go ot next question to review 
  const goToNextQuestion = () => {
    if (questionsStore.answeredQuestions === questionsStore.totalNumberOfQuestions) { //the user reviewed all the questions 
      //reset data
      questionsStore.resetReviewMode();
      history.push('/'); //go to results page
    }
    else { //there are more questions to review
      questionsStore.setCanUserClickClass("disable-click");
      questionsStore.setNextQuestion();// set the next question to review
    }
  }
  const handleButtonClick = (e) => {
    //if on review mode we enter
    //if its on mobile and the type of question is MCQ we just close the MCQquestion, else we do normal go to next question
    //if its mobile and question type MCQ we just close the MCQquestion , else its a normal skip

    if (!questionsStore.isMCQQuestion) questionsStore.setImageLoaded(false);
    const funcToActivate = questionsStore.onReviewMode ? goToNextQuestion : submit;
    if (isMobileOnly && questionsStore.isMCQQuestion) { questionsStore.setMobileMCQVisible(!questionsStore.mobileMCQVisible) }
    else { props.activateFadeOutAndInitiateCB(funcToActivate) }

  }

  const handleLabel = () => {
    //if on review mode we enter
    if (questionsStore.onReviewMode) {
      //if its on mobile and the type of question is MCQ we return choose answer else we return next
      if (questionsStore.isMCQQuestion && isMobileOnly) { return SHOW_ANSWERS }
      else return NEXT
    } else {
      //if its mobile and question type MCQ we are on regular mode and we return choose answer
      if (isMobileOnly && questionsStore.isMCQQuestion) { return CHOOSE_ANSWER }
      //else we return the usual i dont know
      else return DONT_KNOW
    }
  }
  return (
    <div id='question-progress-bar-container' className="fade-in">
      <div id='number-of-question'>{questionsStore.answeredQuestions}/{questionsStore.totalNumberOfQuestions}</div>
      <div id={isMobileOnly ? "mobile-progress-bar" : "browser-progress-bar"} className={`${questionsStore.onReviewMode ? "opacity0" : ""} progress-bar`}>
        <div id="moving-progress-bar" style={{ width: questionsStore.progressBarWidth + "%", transition: "width 2s" }} ></div>
      </div>
      <div id={isMobileOnly ? "mobile-dont-know-button-container" : "browser-dont-know-button-container"} className="dont-know-button-container">
        <div id="dont-know-button" className={questionsStore.canUserClickClass} onClick={handleButtonClick}>{handleLabel()}</div>
      </div>
    </div>
  )
}

export default observer(QuestionProgressBar);