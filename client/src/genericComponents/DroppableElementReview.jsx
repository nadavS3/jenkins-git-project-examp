import React from 'react'
import { useQuestionsStore } from "../stores/index.store";
import { observer } from 'mobx-react-lite';
import "./DroppableElementReview.scss"
import { Flipped } from "react-flip-toolkit";
const DroppableElementReview = ({ answer, index }) => {
    const questionsStore = useQuestionsStore();
    //* each render we iterate through the draggingQuestionPositions arr and if userAnswerIndex === index we know that the label|imagePath inside that elem is pointed to this square 
    let dragElem = questionsStore.currentQuestionInfo.draggingQuestionPositions.find(dragElem => dragElem.userAnswerIndex === index)
    //* here we check if the current ddq elem is correct by checking where it point to , if the dragElem.userAnswerIndex at position 1 is equal 1 that mean it pointing at himself which means its correct 
    const isCorrect = dragElem.userAnswerIndex === questionsStore.currentQuestionInfo.draggingQuestionPositions[dragElem.userAnswerIndex].userAnswerIndex ? "ddq-correct" : "ddq-incorrect"

    return (
        <div style={answer.answerPositions} id="ddq-element-review-container" className={`${isCorrect}`} >
            <div
                id="ddq-element-review"
                className={`ddq-question`}
            >
                <Flipped
                    flipId={answer.userAnswerIndex}
                >
                    {!dragElem ? ""
                        :
                        <span className="drop-elem-container" id={`drop-elem-${dragElem.userAnswerIndex}`}>
                            {dragElem.imagePath ? <img id="ddq-drag-img" src={dragElem.imagePath} alt="drag" /> : dragElem.label}
                        </span>
                    }
                </Flipped>
            </div>
        </div>
    )
}

export default observer(DroppableElementReview)
