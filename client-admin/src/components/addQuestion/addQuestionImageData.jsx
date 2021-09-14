import React from "react";
import './addQuestionImageData.scss';
import { DEVICES } from "../../consts/consts";
import AddQuestionImage from "./AddQuestionImage";
import { observer } from "mobx-react-lite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useGenAlert } from "../../context/generalAlertCtx";
import { FileInput } from "@hilma/fileshandler-client";
import { useSuperAdminStore } from "../../stores/index.store";
import GenericButton from "../../generic-components/genericButton";

function AddQuestionImageData({ filesUploader, filesIds, displayImage, handleBrowserImage, handleMobileImage, mobileImageUrl, browserImageUrl, imgRef, addAnswerType, setAddAnswerType, submitAnswer, lastBoxSize, setDisplayImage, deleteCurrentImage, deleteFile, questionType }) {
    const superAdminStore = useSuperAdminStore();
    const genAlert = useGenAlert();

    const clickOnFileInput = async (device, fileInputId) => {
        if (device === DEVICES.BROWSER) {
            if (browserImageUrl) {
                const userAccepts = await genAlert.openGenAlertSync({ text: "האם את/ה בטוח/ה שברצונך להעלות תמונה חדשה לדפדפן?\nבמידה והתמונה תימחק, כל התשובות שסימנת לתמונה זו לא ישמרו.", isPopup: { okayText: "החלף", cancelText: "ביטול" } });
                if (!userAccepts) { return }
                if (!superAdminStore.onEditQuestionMode) {
                    deleteFile(DEVICES.BROWSER, filesIds.browserImageId, true) // toBeReplaced-true
                }
            }
        }
        else if (device === DEVICES.MOBILE) {
            if (mobileImageUrl) {
                const userAccepts = await genAlert.openGenAlertSync({ text: "האם את/ה בטוח/ה שברצונך להעלות תמונה חדשה למובייל?\nבמידה והתמונה תימחק, כל התשובות שסימנת לתמונה זו לא ישמרו.", isPopup: { okayText: "החלף", cancelText: "ביטול" } });
                if (!userAccepts) { return }
                if (!superAdminStore.onEditQuestionMode) {
                    deleteFile(DEVICES.MOBILE, filesIds.mobileImageId, true) // toBeReplaced-true
                }
            }
        }
        const fileInput = document.getElementById(fileInputId);
        fileInput.click();
    }
    return (
        <div id="question-image-container">
            {displayImage ?
                <div id="top-row-image-displayed" className="top-row-question-image">
                    <div className="generic-add-question-title big-title">{`תמונה עבור ${displayImage === DEVICES.BROWSER ? "דפדפן" : "מכשיר נייד"}:`}</div>
                    <div id="icons">
                        {displayImage === DEVICES.BROWSER ?
                            <GenericButton btnColor="blue" onClick={() => setDisplayImage(DEVICES.MOBILE)} icon="mobile-alt" iconSize="1x" btnText="למעבר למובייל" /> :
                            <GenericButton btnColor="blue" onClick={() => setDisplayImage(DEVICES.BROWSER)} icon="desktop" iconSize="1x" btnText="למעבר לדפדפן" />
                        }
                        <FontAwesomeIcon id="delete-image" icon="trash" color="#103D6B" size="1x" onClick={deleteCurrentImage} />
                        <div id="edit-image">
                            <FontAwesomeIcon icon="pen" color="#103D6B" size="1x" onClick={() => clickOnFileInput(displayImage, "change-current-image")} />
                            <FileInput id="change-current-image" className="files-uploader-hidden" type="image" filesUploader={filesUploader} onChange={displayImage === DEVICES.BROWSER ? handleBrowserImage : handleMobileImage} />
                        </div>
                    </div>
                </div> :
                <div id="top-row-image-not-displayed" className="top-row-question-image">
                    <div className="file-input-clicker" onClick={browserImageUrl ? () => setDisplayImage(DEVICES.BROWSER) : () => clickOnFileInput(DEVICES.BROWSER, "upload-browser-image")}>
                        {browserImageUrl ? "הצג תמונת דפדפן" : "הוסף תמונה עבור דפדפן"}
                    </div>
                    <FileInput id="upload-browser-image" className="files-uploader-hidden" type="image" filesUploader={filesUploader} onChange={handleBrowserImage} />
                    <FileInput id="upload-mobile-image" className="files-uploader-hidden" type="image" filesUploader={filesUploader} onChange={handleMobileImage} />
                    <div className="file-input-clicker" onClick={mobileImageUrl ? () => setDisplayImage(DEVICES.MOBILE) : () => clickOnFileInput(DEVICES.MOBILE, "upload-mobile-image")}>
                        {mobileImageUrl ? "הצג תמונת מובייל" : "הוסף תמונה עבור מובייל"}
                    </div>
                </div>
            }
            {displayImage ? (
                <AddQuestionImage
                    imageUrl={displayImage === DEVICES.MOBILE ? mobileImageUrl : browserImageUrl}
                    imgRef={imgRef}
                    answerType={addAnswerType}
                    setAnswerType={setAddAnswerType}
                    submitAnswer={submitAnswer}
                    lastBoxSize={lastBoxSize}
                    questionType={questionType}
                    setDisplayImage={setDisplayImage} />
            ) : ""}
        </div>
    );
}

export default observer(AddQuestionImageData);