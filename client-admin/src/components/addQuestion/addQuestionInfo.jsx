import React, { useState, useEffect } from "react";
import MicRecorder from 'mic-recorder-to-mp3';
import './addQuestionInfo.scss';
import { ANSWER_STATUS, AUDIO, DEVICES, HEBREW_QUESTION_TYPES, QUESTION_TYPES } from "../../consts/consts";
import { observer } from "mobx-react-lite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GenericTextArea from "../../generic-components/GenericTextAreaAddQuestion";
import { questionInfoRegExp } from "../../consts/regexp";
import { useSuperAdminStore } from "../../stores/index.store";
import GenericFilter from '../../generic-components/genericFilterDropDown';
import MCQAnswers from "./MCQAnswers";
import { useGenAlert } from "../../context/generalAlertCtx";
import { FileInput } from "@hilma/fileshandler-client";
import AnswerImgZoomedIn from "../AnswerImgZoomedIn";
import GenericButton from "../../generic-components/genericButton";

function AddQuestionInfo({ deletePSQAnswer, displayImage, filesUploader, questionInfo, setQuestionInfo, handleAudio, addAnswer, doneAddingAnswersForDevice, allPSQAnswers, browserImageUrl, mobileImageUrl, filesIds, deleteFile, audioUrl, finishAddingAnswers, allMCQAnswers, setAudioUrl, setFilesIds }) {
    const superAdminStore = useSuperAdminStore();

    const [storyPopUp, setStoryPopUp] = useState("");
    const [instructionPopUp, setInstructionPopUp] = useState("");
    const [questionTypeSelected, setQuestionTypeSelected] = useState(superAdminStore.onEditQuestionMode ? superAdminStore.editedQuestionTypeHebrew : "");
    const [answerZoomedInProps, setAnswerZoomedInProps] = useState(null); // when null/false => dont show zoom in, when you want to show, create props object

    //audio recording
    const [isRecording, setIsRecording] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [Mp3Recorder] = useState(new MicRecorder({ bitRate: 128 }));
    const genAlert = useGenAlert();

    useEffect(() => {
        navigator.getUserMedia({ audio: true },
            () => {
                setIsBlocked(false)
            },
            () => {
                setIsBlocked(true)
            },
        );
    }, [])
    const handleStory = (e) => {
        e.persist()
        const value = e.target.value;
        if (value.length > 400) {
            setStoryPopUp("מספר תווים מקסימלי!");
            return;
        }
        const check = questionInfoRegExp.test(value);
        if (check || !value) {
            setStoryPopUp("");
            setQuestionInfo((questionInfo) => ({ ...questionInfo, story: value }));
        } else {
            setStoryPopUp("אנא הכנס רק תווים רלוונטים");
        }
    };
    const handleInstruction = (e) => {
        const value = e.target.value;
        if (value.length > 400) {
            setInstructionPopUp("מספר תווים מקסימלי!");
            return;
        }
        const check = questionInfoRegExp.test(value);
        if (check || !value) {
            setInstructionPopUp("");
            setQuestionInfo((questionInfo) => ({ ...questionInfo, instruction: value }));
        } else {
            setInstructionPopUp("אנא הכנס רק תווים רלוונטים");
        }
    };
    const handleQuestionType = (optionSelected) => {
        switch (optionSelected) {
            case HEBREW_QUESTION_TYPES[0]: // אמריקאית
                setQuestionInfo((questionInfo) => ({ ...questionInfo, questionType: QUESTION_TYPES.MCQ }));
                setQuestionTypeSelected(HEBREW_QUESTION_TYPES[0]) // only for display
                break;
            case HEBREW_QUESTION_TYPES[1]: // בחירת מיקום נכון
                setQuestionInfo((questionInfo) => ({ ...questionInfo, questionType: QUESTION_TYPES.PSQ }));
                setQuestionTypeSelected(HEBREW_QUESTION_TYPES[1]) // only for display
                break;
            default:
                break;
        }
    }
    const displayAnswers = (answersArray, device, answerType) => {
        if (!answersArray || !answersArray.length) {
            return "עוד לא הוזנו תשובות";
        }
        const imgSrc = device === DEVICES.BROWSER ? browserImageUrl : mobileImageUrl;
        return (
            <div className="psq-answers">
                {answersArray.map((answer, index) => {
                    const top = `${answer.top * 100}%`;
                    const left = `${answer.left * 100}%`;
                    const height = `${(answer.bottom - answer.top) * 100}%`;
                    const width = `${(answer.right - answer.left) * 100}%`;
                    return (<div key={index} className="add-padding-to-answer"
                        onClick={() => setAnswerZoomedInProps({
                            src: imgSrc,
                            answerDevice: device,
                            questionType: QUESTION_TYPES.PSQ,
                            answerStatus: answerType,
                            close: () => setAnswerZoomedInProps(null),
                            top: top,
                            left: left,
                            height: height,
                            width: width,
                        })}>
                        <FontAwesomeIcon className="x-icon" icon="times-circle" color="#103d6b" size="1x" onClick={(e) => {
                            e.stopPropagation();
                            deletePSQAnswer(device, answerType, index);
                        }} />
                        <div className="specific-answer-image-container">
                            <div className={`answer-div-${answerType.toLowerCase()}`}
                                style={{
                                    top: top,
                                    left: left,
                                    height: height,
                                    width: width
                                }}>
                            </div>
                            <img className="specific-question-image" src={imgSrc} alt="תשובה" />
                        </div>
                    </div>)
                }
                )}
            </div>)
    }
    const start = () => {
        if (isBlocked) {
            genAlert.openGenAlert({ text: "כדי להקליט שאלה אנא אשר שימוש במיקרופון באתר זה" })

        } else {
            Mp3Recorder.start().then(() => { setIsRecording(true) });
        }
    };
    const stop = async () => {
        Mp3Recorder
            .stop()
            .getMp3()
            .then(([buffer, blob]) => {
                const blobURL = URL.createObjectURL(blob);
                setAudioUrl(blobURL);
                setIsRecording(false);
                const file = new File(buffer, 'me-at-thevoice.mp3', {
                    type: 'audio/mpeg',
                    lastModified: Date.now()
                });
                if (filesIds.hasOwnProperty('audioId')) {
                    deleteFile(AUDIO, filesIds.audioId, true);
                }
                const audio = filesUploader.upload(file);
                setFilesIds({ ...filesIds, audioId: audio.id });
            }).catch((e) => console.log(e));
    };

    const clickOnAudioInput = async () => {
        if (audioUrl) {
            const userAccepts = await genAlert.openGenAlertSync({ text: "האם את/ה בטוח/ה שברצונך להחליף תיאור קולי?", isPopup: { okayText: "החלף", cancelText: "ביטול" } });
            if (!userAccepts) { return }
            if (!superAdminStore.onEditQuestionMode) {
                deleteFile(AUDIO, filesIds.audioId, true);
            }
        }
        const audioInput = document.getElementById("upload-audio");
        audioInput.click();
    }
    return (
        <div id="question-info-container">
            <GenericTextArea name="story" label="סיפור רקע:" value={questionInfo.story} handle={handleStory} popUp={storyPopUp} size="big" />
            <GenericTextArea name="instruction" label="שאלה:" value={questionInfo.instruction} handle={handleInstruction} popUp={instructionPopUp} size="small" />
            <div id="file-input-clicker-container" >
                <div className="file-input-clicker" onClick={clickOnAudioInput}>
                    {audioUrl ? "החלף" : "הוסף"} תיאור קולי
            </div>
                <button className="file-input-clicker" disabled={isRecording} onClick={start}>
                    התחל הקלטה
            </button>
                <button className="file-input-clicker" disabled={!isRecording} onClick={stop}>
                    עצור הקלטה
            </button>
            </div>
            <audio src={audioUrl} id="audio-recorder" controls="controls" />
            <FileInput id="upload-audio" className="files-uploader-hidden" type="audio" filesUploader={filesUploader} onChange={handleAudio} />
            <div id="question-type-container" className="field-container">
                <div className="generic-add-question-title big-title question-type-not-editable"> סוג שאלה: </div>
                <div className="generic-filter-container">
                    <GenericFilter options={HEBREW_QUESTION_TYPES} selectedOption={questionTypeSelected} handleOptionSelect={handleQuestionType} />
                </div>
            </div>
            {questionInfo.questionType ?
                questionInfo.questionType === QUESTION_TYPES.PSQ ?
                    displayImage &&
                    <>
                        <div className="generic-add-question-title big-title"> אזורי לחיצה:</div>
                        {displayImage === DEVICES.BROWSER ?
                            <>
                                <div className="psq-answers-container">
                                    <div className="psq-answers-title generic-add-question-title small-title">תשובה נכונה:</div>
                                    {displayAnswers(allPSQAnswers.browser.correctArray, DEVICES.BROWSER, ANSWER_STATUS.CORRECT)}
                                </div>
                                <div className="psq-answers-container">
                                    <div className="psq-answers-title generic-add-question-title small-title">תשובה לא נכונה:</div>
                                    {displayAnswers(allPSQAnswers.browser.incorrectArray, DEVICES.BROWSER, ANSWER_STATUS.INCORRECT)}
                                </div>
                            </> :
                            <>
                                <div className="psq-answers-container">
                                    <div className="psq-answers-title generic-add-question-title small-title">תשובה נכונה:</div>
                                    {displayAnswers(allPSQAnswers.mobile.correctArray, DEVICES.MOBILE, ANSWER_STATUS.CORRECT)}
                                </div>
                                <div className="psq-answers-container">
                                    <div className="psq-answers-title generic-add-question-title small-title">תשובה לא נכונה:</div>
                                    {displayAnswers(allPSQAnswers.mobile.incorrectArray, DEVICES.MOBILE, ANSWER_STATUS.INCORRECT)}
                                </div>
                            </>
                        }
                        <div id="correct-incorrect-positions">
                            <GenericButton
                                btnColor="blue"
                                onClick={() => addAnswer(ANSWER_STATUS.CORRECT)}
                                icon="plus"
                                iconSize="xs"
                                btnText="הוספת תשובה נכונה"
                            />
                            <GenericButton
                                btnColor="red"
                                onClick={() => addAnswer(ANSWER_STATUS.INCORRECT)}
                                icon="plus"
                                iconSize="xs"
                                btnText="הוספת תשובה שגויה"
                            />
                        </div>
                        <div id="done-adding-answers">
                            <GenericButton
                                btnColor="green"
                                onClick={doneAddingAnswersForDevice}
                                icon="check"
                                iconSize="xs"
                                btnText="סיימתי להוסיף תשובות"
                            />
                        </div>
                    </> :
                    <MCQAnswers finishAddingAnswers={finishAddingAnswers} allMCQAnswers={allMCQAnswers} /> :
                ""
            }
            {answerZoomedInProps && <AnswerImgZoomedIn {...answerZoomedInProps} />}
        </div>
    );
}
export default observer(AddQuestionInfo);