import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { isMobileOnly, MobileOnlyView } from "react-device-detect";
import { observer } from "mobx-react-lite";
import loadable from '@loadable/component'

import { useUsersStore } from '../stores/index.store';
import { useQuestionsStore } from "../stores/index.store";

// import SideQuestion from "../components/questionnaire/sideQuestion/SideQuestion";
// import MobileQuestionInfo from "../components/questionnaire/MobileQuestionInfo";
// import QuestionImage from "../components/questionnaire/QuestionImage";
// import QuestionProgressBar from "../components/questionnaire/QuestionProgressBar";
// import FinishQuestionnairePage from "./FinishQuestionnairePage";

import BrowserTabletView from "../genericComponents/browserTabletView";
import Loader from '../genericComponents/Loader';

import { ANSWER_STATUS, DEVICES, POP_UP_MESSAGE_PROBLEM, QUESTION_TYPES } from "../consts/consts";
import { OUR_COOKIE_TOKEN, getAccessTokenCookie, getCookie, OUR_COOKIE } from "../consts/cookies";

import "./QuestionnairePage.scss";
import QuestionsMenu from "../components/questionnaire/menu/QuestionsMenu";

const SideQuestion = loadable(() => import('../components/questionnaire/sideQuestion/SideQuestion'));
const MobileQuestionInfo = loadable(() => import('../components/questionnaire/MobileQuestionInfo'));
const QuestionImage = loadable(() => import('../components/questionnaire/QuestionImage'));
const QuestionProgressBar = loadable(() => import('../components/questionnaire/QuestionProgressBar'));
const FinishQuestionnairePage = loadable(() => import('./FinishQuestionnairePage'));

function QuestionnairePage(props) {
  const questionsStore = useQuestionsStore();
  const [displayMenu, setDisplayMenu] = useState(false)
  const history = useHistory();
  const usersStore = useUsersStore();
  const fetchInitialData = async () => {
    if (!getAccessTokenCookie(OUR_COOKIE_TOKEN)) {
      usersStore.showErrorPopUp(POP_UP_MESSAGE_PROBLEM)
      history.push('/');
      return;
    }
    try { await questionsStore.getInitialQuestionnaireInfo(); }
    catch (err) {
      if (err) { usersStore.showErrorPopUp(POP_UP_MESSAGE_PROBLEM) }
      history.push('/');
    }
  }
  /** props:
   * @description we want the fade-out to happen from multiple scenarios so we handle that by having a function we pass down to the childrens which recives a CB, note that we wrap our cb inside a local func for the eventlistner so we will have a reference and we can delete the event
   *  listner at the end, we execute our fadeout animation and when it ends we execute our CB,
   *  this way we dont need to define different function for every senerio. in the end we remove our event listner so that we wont have multiple listners triggering at the same event causing error.
   * @Props callBack- a callback that will be initiated after the fade out is complete, if the CB contains arguments we execute them with the CB
   *@constructor NOTE!!!: the function contain some boilerPlate code we need so dont write it again:
   *@constant questionsStore.setFadeOut('fade-out-2s-delay')
   *@constant  if (displayMenu) { setDisplayMenu(false) }
   */
  const activateFadeOutAndInitiateCB = (thingsToDoCallBack, cancelFadeOut) => {
    questionsStore.setCanUserClickClass("disable-click");
    const animated = document.getElementById(`question-image-container-${isMobileOnly ? 'mobile' : 'browser'}`);
    const handleAnimationEnd = () => {
      thingsToDoCallBack();
      animated.removeEventListener('animationend', handleAnimationEnd);
    }
    if (cancelFadeOut) {
      handleAnimationEnd();
    }
    else {
      questionsStore.setFadeOut('fade-out-question');
      animated.addEventListener('animationend', handleAnimationEnd);
    }
    if (displayMenu) { setDisplayMenu(false) }
  }

  useEffect(() => {
    (async () => {
      if (questionsStore.onReviewMode) { //if review -> get all questions to review
        const res = await questionsStore.getQuestionsReview();
        if (!res) history.push('/');
      }
      else if (getCookie(OUR_COOKIE)) {
        history.push("/")
        if (questionsStore.cameToResultsFromReview) // came from questions-review
          questionsStore.cameToResultsFromReview = false
        else { usersStore.showErrorPopUp("לא ניתן להשיב על השאלון יותר מפעם אחת"); } // didnt come from question-review (refresh/questionnaire/..)
      } // cookies already exist
      if (questionsStore.totalNumberOfQuestions === 0 || questionsStore.totalNumberOfQuestions === undefined) {
        fetchInitialData()
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitAnswer = async (answerStatus, answerDuration, answerIndex) => {
    if (!getAccessTokenCookie(OUR_COOKIE_TOKEN)) {
      usersStore.showErrorPopUp(POP_UP_MESSAGE_PROBLEM)
      history.push('/');
      return
    }

    try {
      if (Object.values(ANSWER_STATUS).indexOf(answerStatus) === -1) { throw Error("answerStatus not in enum") }
      const userAnswer = {
        questionId: questionsStore.currentQuestionInfo.questionId,
        answerDuration: answerDuration,
        answerStatus: answerStatus,
        answerDevice: isMobileOnly ? DEVICES.MOBILE : DEVICES.BROWSER
      }
      switch (questionsStore.currentQuestionInfo.questionType) {
        case QUESTION_TYPES.PSQ:
          userAnswer.answerPositions = questionsStore.currentQuestionInfo.questionIncorrectPositions[answerIndex] || {}
          break;
        case QUESTION_TYPES.MCQ:
          userAnswer.multipleChoiceAnswerId = answerIndex;
          break;
        case QUESTION_TYPES.DDQ:
          if (answerStatus === ANSWER_STATUS.INCORRECT) { userAnswer.answerIndexDDQ = questionsStore.currentQuestionInfo.draggingQuestionPositions.map(ddq => "imagePath" in ddq ? { imagePath: ddq.imagePath, userAnswerIndex: ddq.userAnswerIndex } : { label: ddq.label, userAnswerIndex: ddq.userAnswerIndex }) }
          break;
        default:
          break;
      }

      if (!userAnswer.questionId || !typeof userAnswer.questionId === "string") {
        throw Error("no question id or no string")
      }
      if (!userAnswer.answerDuration || !typeof userAnswer.answerDuration === "number") {
        throw Error("no answer duration or no number")
      }
      //*if MCQ we don't have answerPositions
      if ((!userAnswer.answerPositions || !typeof userAnswer.answerPositions === "object") && questionsStore.currentQuestionInfo.questionType === QUESTION_TYPES.PSQ) {
        throw Error("no answer positions or no object")
      }
      setDisplayMenu(false);
      await questionsStore.postAnswerAndGetNextQuestion(userAnswer);
    }
    catch (err) {
      if (err) { usersStore.showErrorPopUp(err); console.log(err); }
    }
  }
  //* when in question review mode we have an initial fetch that causes the condition to go to FinishQuestionnairePage so if questionsStore.onReviewMode true we just load
  return (
    <div>
      {questionsStore.currentQuestionInfo && Object.keys(questionsStore.currentQuestionInfo).length ? <div id={isMobileOnly ? "mobile-questionnaire-page" : "questionnaire-page"}>
        <BrowserTabletView >
          <div id="questionnaire-page-flex-container" className={`fade-in`} >
            <SideQuestion submitAnswer={submitAnswer} displayMenu={displayMenu} setDisplayMenu={setDisplayMenu} activateFadeOutAndInitiateCB={activateFadeOutAndInitiateCB} />
            <QuestionImage submitAnswer={submitAnswer} activateFadeOutAndInitiateCB={activateFadeOutAndInitiateCB} />
          </div>
          <QuestionProgressBar submitDontKnow={submitAnswer} activateFadeOutAndInitiateCB={activateFadeOutAndInitiateCB} />
        </BrowserTabletView>

        <MobileOnlyView renderWithFragment={true}>
          <div id="mobile-questionnaire-page-flex-container" className={`fade-in`}>
            {displayMenu ?
              <QuestionsMenu setDisplayMenu={setDisplayMenu} activateFadeOutAndInitiateCB={activateFadeOutAndInitiateCB} />
              :
              <>
                <MobileQuestionInfo setDisplayMenu={setDisplayMenu} />
                <QuestionImage submitAnswer={submitAnswer} activateFadeOutAndInitiateCB={activateFadeOutAndInitiateCB} />
              </>
            }
          </div>
          <QuestionProgressBar submitDontKnow={submitAnswer} activateFadeOutAndInitiateCB={activateFadeOutAndInitiateCB} />
        </MobileOnlyView>
      </div> : questionsStore.onReviewMode ? <Loader /> : <FinishQuestionnairePage />}
    </div>
  );
}

export default observer(QuestionnairePage);
