import React, { useState } from "react";
import StatisticsFilterBar from '../components/statistics-components/StatisticsFilterBar';
import DisplayStatistics from '../components/statistics-components/displayStatistics';
import AllQuestions from "../components/statistics-components/allQuestions";
import QuestionsByCity from "../components/statistics-components/questionsByCity";
import { useGenAlert } from "../context/generalAlertCtx";
import './statisticsPage.scss';
import { observer } from "mobx-react-lite";
import '../consts/class_names.scss';
import { STATISTICS_PAGES, somethingWentWrong } from "../consts/consts";
import { useStatisticsPageStore } from "../stores/index.store";
import GenericDataLoader from "../generic-components/genericDataLoader";

const StatisticsPage = () => {
    const statisticsPageStore = useStatisticsPageStore();
    const genAlertCtx = useGenAlert();
    const [currentPage, setCurrentPage] = useState(STATISTICS_PAGES.DEFAULT);

    const changePage = (page) => {
        if (Number.isInteger(page)) {
            if (page === 0) {
                setCurrentPage(STATISTICS_PAGES.DEFAULT);
                return;
            }
            if (page === 1) {
                setCurrentPage(STATISTICS_PAGES.ALL_QUESTIONS_PAGE);
                return;
            }
            setCurrentPage(STATISTICS_PAGES.BY_CITY_PAGE);
            return;
        }
        genAlertCtx.openGenAlert({ text: somethingWentWrong })
    }

    return (
        <div id="statistics-page-container" className="width85">

            {/* header */}

            {/* filter bar component */}
            {currentPage === STATISTICS_PAGES.DEFAULT ?
                <>
                    <div className="generic-title page-title">סטטיסטיקות</div>
                    <StatisticsFilterBar />
                    <DisplayStatistics changePage={changePage} />
                    {statisticsPageStore.dataIsLoading && <GenericDataLoader />}
                </>
                :
                currentPage === STATISTICS_PAGES.ALL_QUESTIONS_PAGE ?
                    <AllQuestions changePage={changePage} /> : <QuestionsByCity changePage={changePage} />}
            {/* display statistics */}

        </div>
    );
}

export default observer(StatisticsPage);