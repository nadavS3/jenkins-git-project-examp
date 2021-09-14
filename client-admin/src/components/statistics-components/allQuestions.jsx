import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useGenAlert } from "../../context/generalAlertCtx";
import Box from "../../generic-components/Box";
import GenericTable from "../../generic-components/Tabls";
import { useStatisticsPageStore } from "../../stores/index.store";
import { millisToMinutesAndSeconds } from "../../consts/functions";
import { somethingWentWrong } from "../../consts/consts";
import './allQuestions.scss';
import '../../consts/class_names.scss';

const th = [['question', 'שאלה'], ['succeeded', 'הצליחו'], ['failed', 'נכשלו'], ['average-time', 'זמן ממוצע']]

const AllQuestions = (props) => {
    const genAlertCtx = useGenAlert()
    const statisticsPageStore = useStatisticsPageStore();
    const allQuestionDataTR = statisticsPageStore.allQuestionsData.map((rowDataObject, index) => {
        let insideDataArray = [`שאלה ${index + 1}`]
        insideDataArray[1] = rowDataObject.correct
        insideDataArray[2] = rowDataObject.incorrect
        insideDataArray[3] = millisToMinutesAndSeconds(rowDataObject.avgTime)
        return insideDataArray;
    })


    const fetchQuestions = async () => {
        try {
            await statisticsPageStore.fetchAllQuestionsData();
        } catch (error) {
            genAlertCtx.openGenAlert({ text: somethingWentWrong })
        }
    }

    useEffect(() => {
        fetchQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const hadnleclick = () => { }
    return (
        <>
            <div className="return-button-div" onClick={() => { props.changePage(0) }}>
                <img id='back-arrow-btn' alt="" src="images/icons/Icon-back.svg" />
            </div>
            <div className="generic-title page-title" id="all-questions-title">התפלגות לפי תוצאות השאלון</div>
            <Box className="width85 my-style-table-all-questions" >
                <GenericTable th={th} tr={allQuestionDataTR} onRowClick={hadnleclick} />
            </Box>
        </>
    )
}


export default observer(AllQuestions);