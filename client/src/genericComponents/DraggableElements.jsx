import React from 'react'
import { observer } from "mobx-react-lite";
import { useQuestionsStore } from "../stores/index.store";
import DraggableElement from "./DraggableElement";
import './DraggableElements.scss';

const DraggableElements = () => {
    const questionsStore = useQuestionsStore();

    //* if the draggingQuestionPositionsElem.userAnswerIndex === -1 we know its not inside any droppable square so we do render it, after a drop occurred we change its userAnswerIndex to the index of the drop square
    const createSingleInstance = (answer, index) => {
        if (questionsStore.onReviewMode) {
            // todo something
        } else {
            return (
                questionsStore.currentQuestionInfo.draggingQuestionPositions[index].userAnswerIndex < 0 ?
                    <DraggableElement answer={answer} index={index} key={index} isVisible={true} /> : <DraggableElement answer={answer} index={index} key={index} isVisible={false} />
            )
        }
    }
    return (
        <>
            <div className="ddq-instruction">גררו את הקוביות למקום המתאים על המסך:</div>
            <div id="draggable-elements-container">
                {questionsStore.getDDQDragElements ? questionsStore.getDDQDragElements.map((answer, index) => createSingleInstance(answer, index)) : ""}
            </div>
        </>
    )
}

export default observer(DraggableElements)
