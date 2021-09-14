import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ANSWER_STATUS } from '../consts/consts';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./MCQQuestion.scss"
const MCQQuestion = ({ question, questionExtendedData }) => {
    const [showOptions, setShowOptions] = useState(false);

    let selectedAnswerValue;
    if (question.answerStatus === ANSWER_STATUS.SKIPPED) {
        selectedAnswerValue = "המשתמש דילג על שאלה זו"
    }

    const resolveOptionStatus = (answerId, isCorrect) => {
        if (isCorrect) return "correct";
        if (question.answerStatus === ANSWER_STATUS.SKIPPED || question.answerStatus === ANSWER_STATUS.CORRECT) return "";
        //*incorrect questions
        if (question.multipleChoiceAnswerId === answerId) return "incorrect"
        return ""
    }
    return (
        <>
            <div className={`MCQ-container MCQ-${showOptions ? 'open' : 'close'}`}>
                <div id="MCQ-label-container">
                    <span id="open-questions-label" >הצג תשובות </span>
                    <div id="show-options-btn" onClick={(e) => { setShowOptions(!showOptions); e.stopPropagation() }}>
                        <FontAwesomeIcon icon={`chevron-${showOptions ? "down" : "up"}`} color="white" id="show-options-img" />
                    </div>
                </div>
                <div className="small-text" >{selectedAnswerValue}</div>
                {questionExtendedData.multipleChoiceAnswers && questionExtendedData.multipleChoiceAnswers.map((value, index) => (<div className={`MCQ-questions-${showOptions ? 'open' : 'close'} ${resolveOptionStatus(value.answerId, value.isCorrect)} `} id="MCQ-questions" key={value.answerId}  >
                    {value.answerValue}
                </div>))}
            </div>
        </>
    )
}

export default observer(MCQQuestion)