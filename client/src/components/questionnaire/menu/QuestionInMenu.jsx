import { observer } from "mobx-react-lite";
import React from "react";
import { isMobileOnly } from "react-device-detect";

import { ANSWER_STATUS } from "../../../consts/consts";
import { useGenAlert } from "../../../contexts/generalAlertCtx";
import { useQuestionsStore } from "../../../stores/index.store";

import "./QuestionInMenu.scss";

function QuestionInMenu(props) {
    const questionsStore = useQuestionsStore();
    const genAlert = useGenAlert();

    const getSkippedQuestion = async (e) => {
        e.persist()
        //*check the number of the question the user clicked on
        // if (questionsStore.onReviewMode && props.question.answerStatus === ANSWER_STATUS.UNANSWERED) {
        //     questionsStore.setNextQuestion(props.question.questionNumber);
        // } // ? might not be needed
        if (props.question.questionNumber === questionsStore.currentQuestionInfo.questionNumber || props.question.questionNumber > questionsStore.getLastUnanswerdQuestion) {
            props.setPopUpNeeded(true);
            props.setPopUpText("ניתן לחזור רק לשאלות שדולגו");
            return;
        }
        // if ((props.question.answerStatus === ANSWER_STATUS.SKIPPED && props.question.questionNumber !== questionsStore.currentQuestionInfo.questionNumber) ||
        //     (questionsStore.getLastUnanswerdQuestion === props.question.questionNumber && props.question.questionNumber !== questionsStore.currentQuestionInfo.questionNumber)) {
        //     props.activateFadeOutAndInitiateCB(() => { questionsStore.fetchQuestionById(props.question._id); questionsStore.setImageLoaded(false); })
        // } // ? might not be needed
        if (!([ANSWER_STATUS.SKIPPED, ANSWER_STATUS.UNANSWERED].includes(props.question.answerStatus))) {
            const userAccepts = await genAlert.openGenAlertSync({ text: "ענית כבר על שאלה זו, האם ברצונך להחליף את תשובתך?", isPopup: { okayText: "עבור לשאלה", cancelText: "ביטול" } });
            if (!userAccepts) { return }
        }

        if (isMobileOnly) {
            const res = await questionsStore.fetchQuestionById(props.question._id);
            if (res) {
                questionsStore.setImageLoaded(false);
                props.setDisplayMenu(false);
            }
            else {
                genAlert.openGenAlert({ text: "השאלה לא נמצאה.", center: true })
            }
        }
        else { // browser
            props.activateFadeOutAndInitiateCB(() => { questionsStore.fetchQuestionById(props.question._id, props.question.questionNumber); questionsStore.setImageLoaded(false); })
        }
    }

    return (
        <div id={`${(!questionsStore.onReviewMode && props.question._id === questionsStore.currentQuestionInfo.questionId) ? `current-question-number` : ""}`}
            className={`${(questionsStore.getLastUnanswerdQuestion === props.number || questionsStore.onReviewMode) ? "last-unanswered" : ""}
             ${(props.question.answerStatus === ANSWER_STATUS.SKIPPED) ? `already-answered-${props.question.answerStatus.toLowerCase()}` : ""} question-number`}
            onClick={getSkippedQuestion} >
            <div className="question-number-text">שאלה {props.question.questionNumber}</div>
            {(props.question.answerStatus !== ANSWER_STATUS.UNANSWERED) ? <div className={`answered ${props.question.answerStatus === ANSWER_STATUS.SKIPPED ? "skipped" : "answered-correct-incorrect"}`}></div> : ""}
        </div>
    );
}

export default observer(QuestionInMenu);