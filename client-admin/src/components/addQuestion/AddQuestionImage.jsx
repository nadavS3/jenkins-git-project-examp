import React, { useState } from "react";
import { QUESTION_TYPES } from "../../consts/consts";
import GenericDragInstance from "../../generic-components/GenericDragInstance";
import GenericButton from "../../generic-components/genericButton";
import Loader from "../../generic-components/Loader";
import './AddQuestionImage.scss';
import '../../consts/fade-in.scss';
import '../../consts/class_names.scss';

function AddQuestionImage({ imageUrl, imgRef, answerType, lastBoxSize, submitAnswer, setAnswerType, questionType, setDisplayImage }) {
    const [currentPositions, setCurrentPositions] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    // if (imgRef) { console.log(imgRef.current); }

    return (
        <>
            <div id="add-padding-to-image" className={imageLoaded ? "fade-in" : "opacity0"}>
                <div id="img-container">
                    <img alt="" src={imageUrl} id="img" ref={imgRef} draggable={false} onLoad={() => { setImageLoaded(true) }} />
                    {answerType ? <GenericDragInstance setCurrentPositions={setCurrentPositions} type={answerType.toLowerCase()} firstSize={lastBoxSize} /> : ""}
                </div>
            </div>
            {!imageLoaded && <Loader />}
            <div className="submit-cancel-btns">
                {questionType === QUESTION_TYPES.PSQ ?
                    answerType ?
                        <>
                            <GenericButton
                                btnColor="green"
                                onClick={() => submitAnswer(currentPositions)}
                                btnText="אישור" />
                            <GenericButton
                                btnColor="red"
                                onClick={() => setAnswerType("")}
                                btnText="ביטול" />
                        </> : ""
                    : // answer type mcq
                    <GenericButton
                        btnColor="blue"
                        onClick={() => setDisplayImage("")}
                        btnText="אישור" />
                }
            </div>
        </>
    );
}
export default AddQuestionImage;