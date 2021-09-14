import React, { useEffect, useMemo, useState } from 'react';
import { observer } from "mobx-react-lite";
import SpecificUser from '../components/users-page-components/SpecificUser';
import { Box } from '../generic-components/Box';

import GenericTable from '../generic-components/TablsInfiniteScroll';
import { somethingWentWrong } from '../consts/consts';
import { useUsersPageStore } from '../stores/index.store'
import { useGenAlert } from "../context/generalAlertCtx";
import UsersFilterBar from '../components/users-page-components/UsersFilterBar';
import "./usersPage.scss";
import GenericDataLoader from '../generic-components/genericDataLoader';

const th = [
    ['first name', 'שם פרטי'], // 0
    ['last name', 'שם משפחה'], // 1
    ['age', 'גיל'], // 2
    ['organization name', 'ארגון'], // 3
    ['questionnaire title', 'שאלון'], // 4
    ['questionnaire result', 'תוצאת השאלון'] // 5
];

const UsersPage = () => {
    const usersPageStore = useUsersPageStore();
    const genAlertCtx = useGenAlert();

    const [displayGoUpButton, setDisplayGoUpButton] = useState(false);
    //*table head, english is the className hebrew is the actual displayed name
    //* we dont want to hold in our store heavy objects like html tags so we jeep just the data and then here we take the data and insert it into the actual structure of tags it needs
    const userDataTR = useMemo(() => usersPageStore.usersData.map((user) => {
        return user.map((userValue, index) => {
            if (index === 7) {
                let correct;
                switch (userValue) {
                    case 'UNKNOWN':
                        correct = <div className="unknown-level"></div>
                        break;
                    case 'GOOD':
                        correct = <div>גבוהה</div>
                        break;
                    case 'BAD':
                        correct = <div>נמוך</div>
                        break;
                    case 'INTERMEDIATE':
                        correct = <div>בינוני</div>
                        break;
                    default:
                        correct = <div>נתון לא זמין</div>
                }
                return correct;
            }
            else {
                return <div>{userValue}</div>
            }
        })
    }), [usersPageStore.usersData])

    useEffect(() => {
        window.addEventListener('scroll', scrollLogic)
        return () => {
            window.removeEventListener('scroll', scrollLogic)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleUserRowClick = async (e, i, td) => {
        const specificUserId = usersPageStore.usersId[i];
        try {
            await usersPageStore.fetchSpecificUserData(specificUserId);
        } catch (error) {
            genAlertCtx.openGenAlert({ text: somethingWentWrong })
        }
        usersPageStore.reverseShowSpecificUser(true);

    }

    const scrollLogic = () => {
        setDisplayGoUpButton(((window.innerHeight + window.scrollY) >= window.screen.height * 1.3));
    }

    const downloadExcel = () => {
        usersPageStore.getExcel();
    }

    const fetchMore = () => {
        usersPageStore.setIsFetchFinished(true);
        const filters = usersPageStore.setFiltersForFetch();
        usersPageStore.fetchUsersData(filters);
    }
    return (
        <>
            {usersPageStore.showSpecificUser ? <SpecificUser /> :
                <div id="users-page-container" className="width85 no-scroller">
                    {displayGoUpButton ? <img onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })} id='go-up-btn' alt="go up button" src="images/icons/Icon-go-up.svg"></img> : ''}
                    <div id="title-and-excel">
                        <div id="users-title" className="generic-title page-title">כניסות לשאלון</div>
                        <div id="export-excel" onClick={downloadExcel} >
                            <div id="excel-text" > ייצא לאקסל</div>
                            <img id="excel-icon" src="images/icons/Icon-excel.svg" alt=""></img>
                        </div>
                    </div>
                    <UsersFilterBar />
                    <Box>
                        {usersPageStore.isLoadingUsersData ?
                            <GenericDataLoader /> :
                            <GenericTable
                                th={th}
                                tr={userDataTR ? userDataTR : ''}
                                onRowClick={handleUserRowClick}
                                isEndOfUsers={usersPageStore.isEndOfUsers}
                                isLoading={usersPageStore.isFetchFinished}
                                fetchMore={fetchMore}
                            />
                        }
                    </Box>
                </div>}
        </>
    );
}

export default observer(UsersPage);