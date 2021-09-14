import React from "react";
import '../../consts/class_names.scss';
import './specificCategory.scss'
import { Box } from '../../generic-components/Box';
import { observer } from "mobx-react-lite";
import { useSuperAdminStore } from "../../stores/index.store";
import GenericRowForSA from "../../generic-components/genericRowForSA";
import { useHistory } from "react-router-dom";
import { somethingWentWrong } from "../../consts/errMessages";
import { useGenAlert } from "../../context/generalAlertCtx";
import axios from "axios";
import GenericButton from "../../generic-components/genericButton";
import { REAL_QUESTIONNAIRE_ID } from "../../consts/consts";

function SpecificCategory(props) {

    const superAdminStore = useSuperAdminStore()
    const history = useHistory();
    const genAlertCtx = useGenAlert();

    const handleCategoryNameClick = async (questionId) => {
        if (questionId) {
            superAdminStore.setEditQuestionMode(true);
            await superAdminStore.fetchSpecificQuestionInfo(questionId);
        }
        else {
            superAdminStore.setEditQuestionMode(false);
            await superAdminStore.fetchNextQuestionNumber();
        }
        history.push("/add_question");
    }
    const handleDeleteQuestion = async (questionId) => {
        if (!superAdminStore.currentCategory.categoryId) {
            genAlertCtx.openGenAlert({ text: somethingWentWrong });
            return
        }
        let res = await axios.put("/api/questionnaire/delete-and-fetch", { questionId: questionId, categoryId: superAdminStore.currentCategory.categoryId, questionnaireId: REAL_QUESTIONNAIRE_ID })
        superAdminStore.setCurrentCategoryData(res.data)
    }
    //*if superAdminStore.currentCategoryData has no value we know theres no questions
    const SpecificCategoryData = superAdminStore.currentCategoryData.length
        ?
        superAdminStore.currentCategoryData.map((value, index) => (
            <GenericRowForSA
                onTrashClick={() => { handleDeleteQuestion(value._id) }}
                removePenIcon={true}
                onGeneralClick={() => { handleCategoryNameClick(value._id) }}
                index={index}
                id={value._id}
                text={`שאלה ${value.questionNumber} ${value.SQQInnerOrder ? `חלק ${value.SQQInnerOrder}` : ""}`}
                key={value._id}
            />))
        :
        <div className="label" >אין שאלות בקטגוריה זו</div>
    return (
        <div id="specific-category-page">
            <div className="return-button-div" onClick={() => { superAdminStore.setCurrentCategoryComponent(0) }}>
                <img id='back-arrow-btn' alt="" src="images/icons/Icon-back.svg" />
            </div>
            <div id="title-and-add-question-row">
                <div id="title-specific-category" className="generic-title page-title">{superAdminStore.currentCategory.categoryName}</div>
                <GenericButton
                    btnColor="blue"
                    onClick={() => handleCategoryNameClick(null)}
                    icon="plus"
                    iconSize="xs"
                    btnText="הוסף שאלה"
                    btnSize="M"
                />
            </div>
            <Box id='questions-box' className={`width85 specific-category ${!(superAdminStore.currentCategoryData) ? 'not-loaded' : 'loaded'} `}  >
                <div className="questions-rows-container">
                    {SpecificCategoryData}
                </div>
            </Box>
        </div>
    )
}

export default observer(SpecificCategory);