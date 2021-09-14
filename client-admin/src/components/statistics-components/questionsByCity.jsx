import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useGenAlert } from "../../context/generalAlertCtx";
import Box from "../../generic-components/Box";
import GenericTable from "../../generic-components/Tabls";
import { useStatisticsPageStore } from "../../stores/index.store";
import { somethingWentWrong } from "../../consts/consts";
import GenericDataLoader from "../../generic-components/genericDataLoader";

import './questionsByCity.scss'
import '../../consts/class_names.scss';

const QuestionsByCity = (props) => {
    const genAlertCtx = useGenAlert();
    const statisticsPageStore = useStatisticsPageStore();
    const th = [['city', 'עיר'], ['good', 'גבוה'], ['intermediate', 'בינוני'], ['bad', 'נמוך'], ['total', 'סה"כ']]
    const allQuestionByCityDataTR = statisticsPageStore.allCitiesData.map((rowDataObject, index) => {
        let insideDataArray = []
        insideDataArray[0] = rowDataObject.city
        insideDataArray[1] = rowDataObject.GOOD
        insideDataArray[2] = rowDataObject.INTERMEDIATE
        insideDataArray[3] = rowDataObject.BAD
        insideDataArray[4] = rowDataObject.total
        return insideDataArray;
    });
    const [dataOnLoad, setDataOnLoad] = useState(false);


    const fetchCities = async () => {
        try {
            setDataOnLoad(true);
            const res = await statisticsPageStore.fetchAllCitiesStats();
            if (res) { setDataOnLoad(false); }
        } catch (error) {
            genAlertCtx.openGenAlert({ text: somethingWentWrong })
        }
    }

    useEffect(() => {
        fetchCities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleClick = () => { }
    return (
        <>
            {dataOnLoad ? <GenericDataLoader /> :
                <>
                    <div className="return-button-div" onClick={() => { props.changePage(0) }}>
                        <img id='back-arrow-btn' alt="" src="images/icons/Icon-back.svg" />
                    </div>
                    <div className="generic-title page-title" id="all-questions-title">התפלגות לפי ערים</div>
                    <div id="questions-by-city-table-map-container">
                        <Box className="width50 no-scroll my-style-table-city" >
                            <GenericTable th={th} tr={allQuestionByCityDataTR} onRowClick={handleClick} />
                        </Box>
                    </div>
                </>
            }
        </>
    )
}


export default observer(QuestionsByCity);