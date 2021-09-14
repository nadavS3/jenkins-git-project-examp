import React from 'react'
import { ANSWER_STATUS } from '../consts/consts';
import "./DDQQuestion.scss"

const DDQQuestion = ({ question, questionExtendedData }) => {
    return (
        <>
            {questionExtendedData.ddqPositions.map((ddqElem, index) => {
                const { top, left, height, width, label, imagePath } = ddqElem

                if (question.answerStatus === ANSWER_STATUS.CORRECT) {
                    return (<div key={"imagePath" in ddqElem ? imagePath : label} className={`ddq-square ddq-correct`} style={{ top: top, left: left, height: height, width: width }}>
                        {"imagePath" in ddqElem ? <img id="ddq-drag-img" src={ddqElem.imagePath} alt="drag" /> : <span className="ddq-drag-label"  >{ddqElem.label}</span>}
                    </div>)
                }
                if (question.answerStatus === ANSWER_STATUS.SKIPPED) {
                    return (<div key={"imagePath" in ddqElem ? imagePath : label} className={`ddq-square ddq-dont-know`} style={{ top: top, left: left, height: height, width: width }}>
                        {"imagePath" in ddqElem ? <img id="ddq-drag-img" src={ddqElem.imagePath} alt="drag" /> : <span className="ddq-drag-label"  >{ddqElem.label}</span>}
                    </div>)
                }
                let divElem;
                question.answerIndexDDQ.map((answerDDQElem, indexAnswerDDQElem) => {
                    //* if index is equal to userAnswerIndex that means this answer is for this ddqElem so we check if has the correct label/imagePath
                    if (index === answerDDQElem.userAnswerIndex) {
                        if ("imagePath" in answerDDQElem) {
                            if (answerDDQElem.imagePath === imagePath) {
                                divElem = (<div key={imagePath} className={`ddq-square ddq-correct`} style={{ top: top, left: left, height: height, width: width }}>
                                    {<img id="ddq-drag-img" src={answerDDQElem.imagePath} alt="drag" />}
                                </div>)
                            } else {
                                divElem = (<div key={imagePath} className={`ddq-square ddq-incorrect`} style={{ top: top, left: left, height: height, width: width }}>
                                    {<img id="ddq-drag-img" src={answerDDQElem.imagePath} alt="drag" />}
                                </div>)
                            }
                        }
                        else {

                            if ("label" in answerDDQElem) {
                                if (answerDDQElem.label === label) {
                                    divElem = (<div key={label} className={`ddq-square ddq-correct`} style={{ top: top, left: left, height: height, width: width }}>
                                        {<span className="ddq-drag-label"  >{answerDDQElem.label}</span>}
                                    </div>)
                                }
                                else {
                                    divElem = (<div key={label} className={`ddq-square ddq-incorrect`} style={{ top: top, left: left, height: height, width: width }}>
                                        {<span className="ddq-drag-label"  >{answerDDQElem.label}</span>}
                                    </div>)
                                }
                            }
                        }

                    }
                })
                return divElem
            })}
        </>

    )
}

export default DDQQuestion
