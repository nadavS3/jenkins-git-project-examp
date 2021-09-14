import { QUESTION_TYPES } from '../consts/consts'
import './AnswerImgZoomedIn.scss'
import MCQQuestion from "./MCQQuestion";
import DDQQuestion from "./DDQQuestion";

const AnswerImgZoomedIn = ({ styleUserAnswerEval: { top, left, height, width }, question, questionExtendedData, src, close, answerStatus, answerDevice, questionType }) => {
    return (
        <div onClick={close} id="popup-alert-full-window" className="my-popup" >
            <div className="my-popup-alert-container" id={`my-popup-alert-container-${answerDevice.toLowerCase()}`}>
                <div id="close-button-container"> <img id="button-close-img" alt="" src="images/icons/Icon-close.svg"></img></div>
                <div className="zoomed-in-question-container" id={`zoomed-in-question-container-${answerDevice.toLowerCase()}`} >
                    <img className="zoomed-in-question-image" id={`zoomed-in-question-image-${answerDevice.toLowerCase()}`} src={src} alt="zoomed in" />
                    {questionType === QUESTION_TYPES.PSQ ? <div className={`answer-div-${answerStatus.toLowerCase()}`} style={{
                        top: top, left: left,
                        height: height, width: width
                    }}></div> : questionType === QUESTION_TYPES.MCQ?<MCQQuestion question={question} questionExtendedData={questionExtendedData} /> :questionType === QUESTION_TYPES.DDQ?<DDQQuestion question={question} questionExtendedData={questionExtendedData} />:""}
                </div>
            </div>
        </div>

    )
}

export default AnswerImgZoomedIn