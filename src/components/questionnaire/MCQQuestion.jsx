import React, { useEffect, useState } from 'react';
import { isMobileOnly } from 'react-device-detect';
import { useHistory } from 'react-router-dom';
import { useQuestionsStore } from "../../stores/index.store";
import { observer } from 'mobx-react-lite';
import { ANSWER_STATUS } from '../../consts/consts';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./MCQQuestion.scss"
const MCQQuestion = ({ submitAnswer, activateFadeOutAndInitiateCB, genericSubmit }) => {
    const questionsStore = useQuestionsStore();
    const history = useHistory();
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
    //* if browser we want the show options to be false but if mobile we want only the MCQ to be open or complitly hidden
    const [showOptions, setShowOptions] = useState(true);

    useEffect(() => {
        questionsStore.setMobileMCQVisible(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const submitCallback = (answerStatus, answerIndex, answerDuration) => {

        switch (answerStatus) {
            case ANSWER_STATUS.CORRECT:
                activateFadeOutAndInitiateCB(() => submitAnswer(answerStatus, answerDuration), (questionsStore.sqqArray && questionsStore.sqqArray.length)); // if in SQQ and there are questions left, cancel fadeOut
                break;
            case ANSWER_STATUS.INCORRECT:
                activateFadeOutAndInitiateCB(() => submitAnswer(answerStatus, answerDuration, answerIndex));
                break;
            case ANSWER_STATUS.SKIPPED:
                //*can only happen when in MCQ question and on mobile because only there we can choose to skip from question image
                activateFadeOutAndInitiateCB(() => submitAnswer(answerStatus, answerDuration));
                break;
            default:
                break;
        }
    }

    return (
        <div className={`${(!questionsStore.mobileMCQVisible && isMobileOnly) ? "MCQ-hide" : 'MCQ-show'} ${isMobileOnly ? "MCQ-mobile" : ''}`}>
            <div className={`MCQ-container MCQ-${isMobileOnly ? questionsStore.mobileMCQVisible ? 'open' : 'close' : showOptions ? 'open' : 'close'}`}>
                <div id="MCQ-header-container" onClick={() => isMobileOnly ? questionsStore.setMobileMCQVisible(false) : setShowOptions(!showOptions)}>
                    <div id="MCQ-label">
                        בחר את התשובה הנכונה
                    </div>
                    <div id="show-options-btn">
                        <FontAwesomeIcon icon={`chevron-${showOptions ? "down" : "up"}`} color="white" id="show-options-img" />
                    </div>
                </div>
                {/* if we are on review mode than we than we add the correct and incorrect color to the question */}
                {questionsStore.currentQuestionInfo.multipleChoiceAnswers && questionsStore.currentQuestionInfo.multipleChoiceAnswers.map((value, index) =>
                    (<div key={value.answerId}
                        className={`${questionsStore.onReviewMode && "disable-click"} ${questionsStore.canUserClickClass}
                        ${questionsStore.onReviewMode && questionsStore.currentQuestionInfo.multipleChoiceAnswerId && questionsStore.currentQuestionInfo.multipleChoiceAnswerId === value.answerId ? 'red' : ''}
                        ${questionsStore.onReviewMode && value.isCorrect && "green"} MCQ-questions-${showOptions ? 'open' : 'close'}`}
                        id="MCQ-questions"
                        onClick={(e) => {
                            isMobileOnly && questionsStore.setMobileMCQVisible(false);
                            genericSubmit(value.isCorrect ? ANSWER_STATUS.CORRECT : ANSWER_STATUS.INCORRECT, value.answerId, e, submitCallback)
                        }}
                    >
                        {value.answerValue}
                    </div>))}
                {isMobileOnly &&
                    <div
                        className={`MCQ-questions-${showOptions ? 'open' : 'close'} ${questionsStore.canUserClickClass}`}
                        id="MCQ-questions"
                        //here if were on review we want to go to the next question and to mimic the action of the progress bar component so i just copied the function goToNextQuestion from there and wrapped it in the activatefadeou as ini the progress bar component, otherwise we just do a nirmal skip
                        onClick={(e) => { questionsStore.setMobileMCQVisible(false); questionsStore.onReviewMode ? activateFadeOutAndInitiateCB(goToNextQuestion) : genericSubmit(ANSWER_STATUS.SKIPPED, null, e, submitCallback); }} >
                        {questionsStore.onReviewMode ? "לשאלה הבאה" : "אני לא יודע/ת"}
                    </div>}
            </div>
        </div>
    )
}

export default observer(MCQQuestion);