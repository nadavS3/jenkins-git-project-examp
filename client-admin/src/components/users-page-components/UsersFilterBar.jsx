import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useSuperAdminStore, useUsersPageStore } from '../../stores/index.store';
import { useAdminData } from '../../context/adminDataCtx';

import Box from '../../generic-components/Box';
import GenericFilter from '../../generic-components/genericFilterDropDown';
import { CustomDate } from '../../generic-components/customDate';

import { AGES, DGO_LEVELS, TIMES } from '../../consts/consts';
import { displayCustomRange } from '../../consts/functions';

import './UsersFilterBar.scss';

const UsersFilterBar = () => {
    const usersPageStore = useUsersPageStore();
    const superAdminStore = useSuperAdminStore();
    const adminDataCtx = useAdminData();

    const [openCustomDate, setOpenCustomDate] = useState(false); //open or close custom date

    //when custom date is open on blur we just exit
    const handleBlur = () => {
        setSelectedTimes(TIMES[0]);
        setOpenCustomDate(false);
    }

    const setDateRange = (startDate, endDate) => {
        setSelectedTimes({
            startDate: startDate,
            endDate: endDate
        });
        setOpenCustomDate(false);
    }
    const setSelectedOrganization = (organization) => {
        usersPageStore.setFilters([{ name: "organizationId", value: organization }]);
    }
    const setSelectedQuestionnaire = (questionnaire) => {
        usersPageStore.setFilters([{ name: "questionnaireId", value: questionnaire }]);
    }
    const setSelectedDGOLevel = (DGOLevel) => {
        usersPageStore.setFilters([{ name: "digitalOrientationLevel", value: DGOLevel }]);
    }
    const setSelectedAges = (ages) => {
        usersPageStore.setFilters([{ name: "age", value: ages }]);
    }
    const setSelectedTimes = (times) => {
        if (times === TIMES[TIMES.length - 1]) { setOpenCustomDate(true); }
        else { usersPageStore.setFilters([{ name: "dateRange", value: times }]); }
    }

    return (
        <Box id="users-filter-container" >
            {adminDataCtx.isSuperAdmin() ?
                <div className="generic-filter-container small-filter with-title">
                    <div className="filter-text">ארגון</div>
                    <GenericFilter
                        options={superAdminStore.organizationNamesForFilterIncludeAll}
                        selectedOption={usersPageStore.filters.organizationId}
                        handleOptionSelect={setSelectedOrganization}
                    />
                </div> :
                ""
            }
            <div className="generic-filter-container small-filter with-title">
                <div className="filter-text">שאלון</div>
                <GenericFilter
                    options={superAdminStore.questionnaireTitles}
                    selectedOption={usersPageStore.filters.questionnaireId}
                    handleOptionSelect={setSelectedQuestionnaire}
                />
            </div>
            <div className="generic-filter-container small-filter with-title">
                <div className="filter-text">תוצאות השאלון</div>
                <GenericFilter
                    options={DGO_LEVELS}
                    selectedOption={usersPageStore.filters.digitalOrientationLevel}
                    handleOptionSelect={setSelectedDGOLevel}
                />
            </div>
            <div className="generic-filter-container small-filter with-title">
                <div className="filter-text">טווח גילאים</div>
                <GenericFilter
                    options={AGES}
                    selectedOption={usersPageStore.filters.age}
                    handleOptionSelect={setSelectedAges}
                />
            </div>
            <div className="generic-filter-container small-filter with-title">
            <div className="filter-text">תאריך</div>
                <GenericFilter
                    options={TIMES}
                    selectedOption={typeof usersPageStore.filters.dateRange === "string" ? usersPageStore.filters.dateRange : displayCustomRange(usersPageStore.filters.dateRange)}
                    handleOptionSelect={setSelectedTimes}
                />
                {/* custom date range*/}
                {openCustomDate ? <CustomDate setDateRange={setDateRange} handleBlur={handleBlur} /> : null}
            </div>
        </Box>
    )
}

export default observer(UsersFilterBar);