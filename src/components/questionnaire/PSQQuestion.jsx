import React, { useEffect, useState } from 'react';
import { useQuestionsStore } from "../../stores/index.store";
import { ANSWER_STATUS } from '../../consts/consts';
import { isMobileOnly } from 'react-device-detect';
import { observer } from 'mobx-react-lite';

import './PSQQuestion.scss';

const PSQQuestion = ({ submit, submitAnswer, activateFadeOutAndInitiateCB, genericSubmit }) => {

    const questionsStore = useQuestionsStore();
    const [wrongAnswerClicked, setWrongAnswerClicked] = useState(-1);
    const handleCorrect = (answerDuration) => {
        submitAnswer(ANSWER_STATUS.CORRECT, answerDuration)
    }
    const handleInCorrect = (answerDuration, answerIndex) => {
        setWrongAnswerClicked(-1);
        submitAnswer(ANSWER_STATUS.INCORRECT, answerDuration, answerIndex)
    }
    const handleSkip = (answerDuration) => {
        submitAnswer(ANSWER_STATUS.SKIPPED, answerDuration);
    }
    useEffect(() => {
        if (questionsStore.imageLoaded && questionsStore.onReviewMode) { // because the answer blue border was removed by itzuv
            questionsStore.setReviewShowCorrect(false);
            setTimeout(() => {
                questionsStore.setReviewShowCorrect(true);
            }, 500);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionsStore.imageLoaded])

    const submitCallback = (answerStatus, answerIndex, answerDuration) => {
        switch (answerStatus) {
            case ANSWER_STATUS.CORRECT:
                activateFadeOutAndInitiateCB(() => handleCorrect(answerDuration), Boolean(questionsStore.sqqArray && questionsStore.sqqArray.length)); // if in SQQ and there are questions left, cancel fadeOut
                break;
            case ANSWER_STATUS.INCORRECT:
                activateFadeOutAndInitiateCB(() => handleInCorrect(answerDuration, answerIndex));
                setWrongAnswerClicked(answerIndex);
                break;
            case ANSWER_STATUS.SKIPPED:
                activateFadeOutAndInitiateCB(() => handleSkip(answerDuration));
                break;
            default:
                break;
        }
    }

    return (
        <>
            <div
                id={(!questionsStore.onReviewMode && !isMobileOnly) ? "browser-questionnaire-place-container" : ""}
                className={`${questionsStore.canUserClickClass} place-container`}
                style={questionsStore.getCorrectPlace}
                onClick={!questionsStore.onReviewMode ? ((e) => genericSubmit(ANSWER_STATUS.CORRECT, '', e, submitCallback)) : () => { }}
            >
                <div className={`${(questionsStore.onReviewMode && questionsStore.reviewShowCorrect) ? "display-answer" : "no-display-answer"} ${questionsStore.onReviewMode ? 'review-correct-popup' : ''}`} ></div>
            </div>
            {questionsStore.getIncorrectPlaces ? questionsStore.getIncorrectPlaces.map((answer, index) => {
                return <div
                    key={index}
                    id={(!questionsStore.onReviewMode && !isMobileOnly) ? "browser-questionnaire-place-container" : ""}
                    className={`${questionsStore.canUserClickClass} place-container`}
                    style={answer.answerPositions}
                    onClick={!questionsStore.onReviewMode ? ((e) => { genericSubmit(ANSWER_STATUS.INCORRECT, answer.answerIndex, e, submitCallback) }) : () => { }}
                >
                    <div className={`${questionsStore.onReviewMode ? "display-answer" : "no-display-answer"} ${questionsStore.onReviewMode ? 'review-incorrect-popup' : (answer.answerIndex === wrongAnswerClicked ? "display" : "no-display")}`} ></div>
                </div>
            }
            ) : ""}
        </>
    )
}

export default observer(PSQQuestion)