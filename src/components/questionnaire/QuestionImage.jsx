import React, { useEffect } from 'react';
import './QuestionImage.scss';
import { useQuestionsStore, useUsersStore } from "../../stores/index.store";
import { observer } from 'mobx-react-lite';
import { POP_UP_MESSAGE_PROBLEM, QUESTION_TYPES } from '../../consts/consts';
import { isMobileOnly, isIOS, isMobileSafari } from 'react-device-detect';
import MCQQuestion from "./MCQQuestion";
import PSQQuestion from "./PSQQuestion";
import DDQQuestion from "./DDQQuestion";
function QuestionImage(props) {
    const questionsStore = useQuestionsStore();
    const usersStore = useUsersStore();

    const questionType = questionsStore.currentQuestionInfo.questionType;

    useEffect(() => {
        if (questionsStore.currentQuestionInfo === null) { usersStore.showErrorPopUp(POP_UP_MESSAGE_PROBLEM); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const genericSubmit = (answerStatus, answerIndex, e, callBack) => {
        e.persist();
        //* we want to pass arguments to the resolve function so we wrap it and now we can pass the wrapping func as cb to eventListener
        questionsStore.setFadeIn('')
        const answerDuration = Date.now() - questionsStore.getQuestionTimer;
        questionsStore.setCanUserClickClass("disable-click");
        questionsStore.setImageLoaded(false);
        callBack(answerStatus, answerIndex, answerDuration);
    }

    const imageFinishToLoad = () => {
        questionsStore.setImageLoaded(true);
        questionsStore.setFadeOut('');
        if (!questionsStore.currentQuestionInfo.SQQInnerOrder || questionsStore.currentQuestionInfo.SQQInnerOrder === 1) {
            questionsStore.setFadeIn('fade-in');
            if (questionsStore.autoPlayAudio) {
                if (!isMobileSafari) {
                    questionsStore.playQuestionAudio();
                }
            }
        }
        questionsStore.setCanUserClickClass("");
    }

    const imageReviewLoaded = () => {
        questionsStore.setImageLoaded(true);
        questionsStore.setFadeOut('');
        questionsStore.setFadeIn('fade-in');
        questionsStore.setCanUserClickClass("");
    }

    const renderByQuestionType = () => {
        const compProps = { activateFadeOutAndInitiateCB: props.activateFadeOutAndInitiateCB, submitAnswer: props.submitAnswer, genericSubmit: genericSubmit };
        switch (questionType) {
            case QUESTION_TYPES.PSQ:
                return <PSQQuestion {...compProps} />;
            case QUESTION_TYPES.DDQ:
                if (!isMobileOnly) {
                    return <DDQQuestion {...compProps} />;
                }
                break;
            case QUESTION_TYPES.MCQ:
                if (!isMobileOnly) {
                    return <MCQQuestion {...compProps} />;
                }
            default:
                return null;
        }
    }
    const currentImage = questionsStore.imagePathsObj[questionsStore.currentQuestionInfo.questionImageUrl];
    return (
        <>
            <div id={`question-image-container-${isMobileOnly ? 'mobile' : 'browser'}`} className={`question-image-container`}>
                {/* {!questionsStore.imageLoaded ? <ImageLoader /> : null} */}
                <div id="image-container" className={`${isMobileOnly ? "mobile" : "browser"}-image-container ${`${questionsStore.fadeIn} ${questionsStore.fadeOut}`} ${isIOS ? 'IOS-view' : ''}`}>
                    <img alt="שאלה"
                        className={!questionsStore.imageLoaded ? 'dont-display' : ''}
                        src={currentImage ? currentImage.src : questionsStore.currentQuestionInfo.questionImageUrl}
                        id={isMobileOnly ? "mobile-image" : "browser-image"}
                        draggable={false}
                        onLoad={questionsStore.onReviewMode ? imageReviewLoaded : imageFinishToLoad}
                    />
                    {renderByQuestionType()}
                </div>
            </div >
            {/* we need to render mcq here if mobile so that the questions will be renderd outside of the div of the phone and can expend to the whole screen */}
            {questionType === QUESTION_TYPES.MCQ && isMobileOnly && <MCQQuestion activateFadeOutAndInitiateCB={props.activateFadeOutAndInitiateCB} submitAnswer={props.submitAnswer} genericSubmit={genericSubmit}  />}

        </>
    )
}

export default observer(QuestionImage);