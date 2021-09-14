import React from 'react';
import { observer } from 'mobx-react-lite';
import { useQuestionsStore } from "../../stores/index.store";
import "./DDQQuestion.scss"
import DroppableElement from "../../genericComponents/DroppableElement";
import { Flipper} from "react-flip-toolkit";
import DroppableElementReview from "../../genericComponents/DroppableElementReview";
const DDQQuestion = ({ genericSubmit }) => {
    const questionsStore = useQuestionsStore();

    const createSingleInstance = (answer, index) => {
        return (
            <DroppableElement
                index={index}
                genericSubmit={genericSubmit}
                answer={answer}
                key={index}
            />
        )
    }
    const createSingleInstanceReview = (answer, index) => {
        return (
            // <Flipped
                
            //     key={index}
            //     flipId={answer.userAnswerIndex}
            // >
                // {flippedProps =>
                     <DroppableElementReview
                    index={index}
                    // flippedProps={flippedProps}
                    answer={answer}
                    key={index}
                />
            // }

            // </Flipped>
        )
    }

    const ddqElements = questionsStore.getDDQElements ?  questionsStore.getDDQElements.map((answer, index) => questionsStore.onReviewMode? createSingleInstanceReview(answer, index):createSingleInstance(answer, index)): "";
    return (
        <>
            {questionsStore.onReviewMode ?
                <Flipper spring="stiff" flipKey={questionsStore.getDDQUserAnswerIndexArr}>
                    {ddqElements}
                </Flipper>
                : ddqElements
            }
        </>
    )
}

export default observer(DDQQuestion)