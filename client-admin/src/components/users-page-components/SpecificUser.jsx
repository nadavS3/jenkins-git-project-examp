import React, { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import AnswerImgZoomedIn from "../AnswerImgZoomedIn";
import { somethingWentWrong, QUESTION_TYPES } from "../../consts/consts";
import { useGenAlert } from "../../context/generalAlertCtx";
import { useUsersPageStore } from '../../stores/index.store';
import GenericRowsSpecificUser from './GenericRowsSpecificUser';
import SpecificUserTable from './specificUserTable';

import '../../consts/fade-in.scss';
import '../../consts/class_names.scss';
import './SpecificUser.scss'

const SpecificUser = () => {
    const genAlertCtx = useGenAlert()
    const usersPageStore = useUsersPageStore();
    const [focusOnPicture, setFocusOnPicture] = useState(false)
    const [arrowUpIndex, setArrowUpIndex] = useState(-1)

    useEffect(() => {
        if (!(usersPageStore.specificUserData)) { genAlertCtx.openGenAlert({ text: somethingWentWrong }) }
        //here we just resseting the selected index to prevent bugs on re-entering
        usersPageStore.setSpecificAnswerSelectedIndex(null)

        // ! if commented, data will save and while returning to users page direct to specific user data
        return () => {
            usersPageStore.setSpecificUserData({})
            usersPageStore.setSpecificUserQuestions([])
            usersPageStore.setSpecificAnswerSelectedIndex(null)
            usersPageStore.reverseShowSpecificUser()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const handleImgClick = () => setFocusOnPicture(true)

    const resolveZoomedInImg = () => {
        //*data from the usual row 
        const question = usersPageStore.specificUserQuestions[arrowUpIndex];
        //*some more data from the special row
        const questionExtendedData = usersPageStore.specificUserQuestions[arrowUpIndex + 1];
        return <AnswerImgZoomedIn
            question={question}
            questionExtendedData={questionExtendedData}
            styleUserAnswerEval={questionExtendedData.questionType === QUESTION_TYPES.PSQ ? questionExtendedData.styleUserAnswerEval : { top: 0, left: 0, height: 0, width: 0 }}
            close={() => setFocusOnPicture(false)}
            src={questionExtendedData.imagePath}
            answerStatus={questionExtendedData.answerStatus}
            answerDevice={questionExtendedData.answerDevice}
            questionType={questionExtendedData.questionType}
        />
    }

    return (
        <div id="specific-user-container" className="width85">

            <div className="return-button-div" onClick={() => { usersPageStore.reverseShowSpecificUser(false) }}>
                <img id='back-arrow-btn' alt="" src="images/icons/Icon-back.svg" />
                <div className="user-name main-description">
                    {`${usersPageStore.specificUserData.firstName} ${usersPageStore.specificUserData.lastName}`}
                </div>
            </div>
            <div className="title main-description">פרטים אישיים</div>
            <GenericRowsSpecificUser />
            <div className="title main-description" >שאלות ותשובות</div>

            <SpecificUserTable arrowUpIndex={arrowUpIndex} setArrowUpIndex={setArrowUpIndex} handleImgClick={handleImgClick} />
            {focusOnPicture ? resolveZoomedInImg() : ""}

        </div>
    )
}

export default observer(SpecificUser);
