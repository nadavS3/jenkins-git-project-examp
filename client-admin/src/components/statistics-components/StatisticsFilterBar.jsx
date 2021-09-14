import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';

import GenericFilter from '../../generic-components/genericFilterDropDown';
import Box from '../../generic-components/Box';
import { TIMES } from "../../consts/consts";
import { CustomDate } from "../../generic-components/customDate";
import { displayCustomRange } from '../../consts/functions';


import { useStatisticsPageStore, useSuperAdminStore } from '../../stores/index.store';
import { useAdminData } from '../../context/adminDataCtx';

import './StatisticsFilterBar.scss';

const StatisticsFilterBar = () => {
    const adminDataCtx = useAdminData()
    const [openCustomDate, setOpenCustomDate] = useState(false); //open or close custom date
    const statisticsPageStore = useStatisticsPageStore();
    const superAdminStore = useSuperAdminStore();

    const setDateRange = (startDate, endDate) => {
        setSelectedTimes({
            startDate: startDate,
            endDate: endDate
        });
        setOpenCustomDate(false);
    }
    const handleBlur = () => {
        setSelectedTimes(TIMES[0]);
        setOpenCustomDate(false);
    }

    const setSelectedOrganization = organization => {
        statisticsPageStore.setFilters([{ name: "organizationId", value: organization }]);
    }
    const setSelectedQuestionnaire = questionnaire => {
        statisticsPageStore.setFilters([{ name: "questionnaireId", value: questionnaire }]);
    }
    const setSelectedTimes = (times) => {
        if (times === TIMES[TIMES.length - 1]) { setOpenCustomDate(true); }
        else { statisticsPageStore.setFilters([{ name: "dateRange", value: times }]); }
    }

    return (<Box id="statistics-filter-bar-container" className="width85">
        <div id="filter-bar-header">מבט על</div>

        <div className="filters">
            {adminDataCtx.isSuperAdmin() ?
                <>
                    <div className="generic-filter-container small-filter with-title">
                        <div className="filter-text">ארגון</div>

                        <GenericFilter
                            options={superAdminStore.organizationNamesForFilterIncludeAll}
                            selectedOption={statisticsPageStore.filters.organizationId}
                            handleOptionSelect={setSelectedOrganization}
                        />
                    </div>

                    <div className="generic-filter-container small-filter with-title">
                        <div className="filter-text">שאלון</div>
                        <GenericFilter
                            options={superAdminStore.questionnaireTitles}
                            selectedOption={statisticsPageStore.filters.questionnaireId}
                            handleOptionSelect={setSelectedQuestionnaire}
                        />
                    </div>

                </>
                : ""
            }
            <div className="generic-filter-container small-filter with-title">
                <div className="filter-text">תאריך</div>
                <GenericFilter
                    options={TIMES}
                    selectedOption={typeof statisticsPageStore.filters.dateRange === "string" ? statisticsPageStore.filters.dateRange : displayCustomRange(statisticsPageStore.filters.dateRange)}
                    handleOptionSelect={setSelectedTimes}
                />
            </div>

            {/* custom date range */}
            {openCustomDate ? <CustomDate setDateRange={setDateRange} handleBlur={handleBlur} /> : null}
        </div>
    </Box>);
}

export default observer(StatisticsFilterBar);