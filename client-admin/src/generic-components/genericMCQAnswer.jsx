import React from 'react';
import './genericMCQAnswer.scss';
import { questionInfoRegExp } from '../consts/regexp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const GenericMCQAnswer = ({ index, thisAnswer, setAnswers }) => {

    const changeValue = (e) => {
        let value = e.target.value;
        if (value.length > 20) {
            // setFirstNameMessage("הגעת למספר התווים המקסימלי");
            return;
        }

        const check = questionInfoRegExp.test(value);

        if (check || !value) {
            // setFirstNameMessage('')
            setAnswers(oldAnswers => {
                let newAnswers = [...oldAnswers];
                newAnswers[index].answerValue = value;
                return newAnswers;
            });
        } else {
            // setFirstNameMessage("אנא הכנס רק אותיות");
        }
    };
    const changeIsCorrect = () => {
        setAnswers(oldAnswers => {
            let newAnswers = [...oldAnswers];
            newAnswers.forEach(ans => {
                ans.isCorrect = false;
            });
            newAnswers[index].isCorrect = true;
            return newAnswers;
        });
    }
    const deleteAnswer = () => {
        setAnswers(oldAnswers => {
            let newAnswers = [...oldAnswers];
            newAnswers.splice(index, 1);
            return newAnswers;
        });
    }
    return (
        <div className="mcq-answer">
            <input type="radio" name="check-answer" checked={thisAnswer.isCorrect} onChange={() => { /* irrelevent */ }} />
            <div className={`checkbox`} onClick={changeIsCorrect}>
                <FontAwesomeIcon className={`check-icon ${thisAnswer.isCorrect ? "fade-in" : "dont-show"}`} icon="check-square" color="#103D6B" size="1x" />
            </div>
            <input type="text" className="answer-value" name={`value${index}`} placeholder="הקלד תשובה..." value={thisAnswer.answerValue} onChange={changeValue} />
            <FontAwesomeIcon className="delete-answer" icon="trash" color="#103D6B" size="1x" onClick={deleteAnswer} />
        </div>
    )
}

export default GenericMCQAnswer