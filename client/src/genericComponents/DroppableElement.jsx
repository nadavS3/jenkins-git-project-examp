import React, { useState } from 'react'
import { useQuestionsStore } from "../stores/index.store";
import { observer } from 'mobx-react-lite';
import { useDrop, useDrag } from 'react-dnd'
import { DRAGGABLE_ITEMS_TYPE } from "../consts/consts";
import "./DroppableElement.scss"
const DroppableElement = ({ answer, index }) => {

    const [dragElemIndex, setDragElemIndex] = useState(-1)
    const questionsStore = useQuestionsStore();

    const [{ isOver, currentItem }, dropRef] = useDrop({
        accept: DRAGGABLE_ITEMS_TYPE.DRAGGABLE_ELEM,
        drop: () => { questionsStore.dropDragElemToAnswer(currentItem.index, index); setDragElemIndex(currentItem.index) },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            currentItem: monitor.getItem(),
        }),
    });

    //* when we drop an element to a square we then assign him a dragRef with the dragElemIndex we obtained from the drop function of useDrop
    const [, dragRef] = useDrag({

        type: DRAGGABLE_ITEMS_TYPE.DRAGGABLE_ELEM,
        item: { index: dragElemIndex }

    });
    //* each render we iterate through the draggingQuestionPositions arr and if userAnswerIndex === index we know that the label|imagePath inside that elem is pointed to this square 
    let dragElem = questionsStore.currentQuestionInfo.draggingQuestionPositions.find(dragElem => dragElem.userAnswerIndex === index)

    const regularDropAreaClassNames = `${questionsStore.canUserClickClass} ${currentItem ? "active-drag" : ""}  ${isOver ? "artificial-hover" : ""}`
    return (
        <>
            <div
                id="ddq-element"
                ref={dropRef}
                className={`ddq-question  ${regularDropAreaClassNames}`}
                style={answer.answerPositions}
            >
                {!dragElem ? ""
                    :

                    <span ref={dragRef} className="drop-elem-container" id={`drop-elem-${dragElem.userAnswerIndex}`}>
                        {dragElem.imagePath ? <img id="ddq-drag-img" style={{ opacity: `${dragElem ? 1 : 0}` }} src={dragElem ? dragElem.imagePath : ""} alt="drag" /> : dragElem.label}
                    </span>}
            </div>

        </>
    )
}

export default observer(DroppableElement)
