import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import GenericMCQAnswer from '../../generic-components/genericMCQAnswer';
import { useGenAlert } from '../../context/generalAlertCtx';
import GenericButton from '../../generic-components/genericButton';

function MCQAnswers({ finishAddingAnswers, allMCQAnswers }) {
    const genAlert = useGenAlert();
    const [answers, setAnswers] = useState(allMCQAnswers || []); // if on edit mode and question type mcq -> show answers

    const [showAnswers, setShowAnswers] = useState(true);

    const addAnswer = () => {
        setAnswers(oldAnswers => {
            let newAnswers = [...oldAnswers];
            newAnswers.push({ answerValue: "", isCorrect: false }); // ! to add id in submit
            return newAnswers;
        })
    }
    const validateAndSubmit = () => {
        if (!answers.length || answers.length === 1) { genAlert.openGenAlert({ text: "עליך להוסיף מספר תשובות" }); return; }
        let correctsNum = 0;
        answers.forEach((ans) => {
            if (!ans.answerValue) { genAlert.openGenAlert({ text: "עליך להוסיף ערך לכל תשובה" }); return; }
            if (ans.isCorrect) { correctsNum++; }
        })
        if (correctsNum !== 1) { genAlert.openGenAlert({ text: "עליך לבחור תשובה נכונה אחת בדיוק" }); return; }
        finishAddingAnswers(answers);
        setShowAnswers(false);
    }
    return (
        <>
            {
                !showAnswers ?
                    <GenericButton
                        btnColor="blue"
                        onClick={() => setShowAnswers(true)}
                        btnText="הראה תשובות"
                    />
                    :
                    <>
                        {answers.map((answer, index) => <GenericMCQAnswer key={index} index={index} thisAnswer={answer} setAnswers={setAnswers} />)}
                        <GenericButton
                            btnColor="blue"
                            onClick={addAnswer}
                            btnText="הוסף תשובה"
                        />
                        <GenericButton
                            btnColor="green"
                            onClick={validateAndSubmit}
                            btnText="סיימתי להוסיף תשובות"
                        />
                    </>
            }
        </>
    );
}

export default observer(MCQAnswers);