import React from 'react';
import Box from '../../generic-components/Box';
import { useStatisticsPageStore } from '../../stores/index.store';
import './displayStatistics.scss';
import { observer } from "mobx-react-lite";
import SectorRow from './charts/genericSectorRow';
import { ALL_ORGANIZATIONS_FILTER, STATS_COLORS } from '../../consts/consts';
import '../../consts/class_names.scss';
import OrganizationRow from './charts/genericOrganizationRow';
import TableWithLimit from './charts/genericTableWithLimit';
import HorizontalBar from './charts/genericHorizontalBar';
import PieChart from './charts/pieChart';
import AgesStats from './agesStats';
import CategoriesStats from './categoriesStats';
import NoData from '../../generic-components/noDataAvailable';
import { useAdminData } from "../../context/adminDataCtx";
const DisplayStatistics = (props) => {

    const adminDataCtx = useAdminData();
    const statisticsPageStore = useStatisticsPageStore();

    return (
        <div id="statistics-container" className="no-scroller">
            <Box id="s-q-finished" className="statistic-box upper-stats-no-title">
                {statisticsPageStore.getFinishedData ?
                    <div className="generic-stat">
                        <img className="near-stat-img" src="/images/stats_finished.svg" alt="סיימו" />
                        <div className="generic-stat-data">
                            <div className="stat-value">{statisticsPageStore.getFinishedData.total}</div>
                            <div className="stat-desc">שאלונים שהסתיימו</div>
                        </div>
                    </div> : <NoData />}

                {statisticsPageStore.getFinishedData?.total > 0 ?
                    <div id="pie-chart-container">
                        <PieChart data={statisticsPageStore.getFinishedData.dataForChart} />
                    </div> : ""}

            </Box>
            <Box id="s-q-unfinished" className="statistic-box upper-stats-no-title">
                {statisticsPageStore.getNumberOfUnfinished || statisticsPageStore.getNumberOfUnfinished === 0 ?
                    <div className="generic-stat">
                        <img className="near-stat-img" src="/images/stats_unfinished.svg" alt="לא סיימו" />
                        <div className="generic-stat-data">
                            <div className="stat-value">{statisticsPageStore.getNumberOfUnfinished}</div>
                            <div className="stat-desc">שאלונים שהופסקו באמצע</div>
                        </div>
                    </div> : <NoData />}
            </Box>
            <Box id="s-succeeded" className="statistic-box upper-stats-no-title">
                {statisticsPageStore.getLevelGoodData ?
                    <div className="generic-stat">
                        <img className="near-stat-img" src="/images/stats_good.svg" alt="סופרסטאר" />
                        <div className="generic-stat-data">
                            <div className="stat-value">{statisticsPageStore.getLevelGoodData.total}</div>
                            <div className="stat-desc">קיבלו תוצאת "סופרסטאר"</div>
                        </div>
                    </div> : <NoData />}
                {statisticsPageStore.getLevelGoodData?.total > 0 ?
                    <div className="horizontal-bar-container"><HorizontalBar data={statisticsPageStore.getLevelGoodData} /></div> : ""}
            </Box>
            <Box id="s-failed" className="statistic-box upper-stats-no-title">
                {statisticsPageStore.getLevelBadData ?
                    <div className="generic-stat">
                        <img className="near-stat-img" src="/images/stats_bad.svg" alt="נכשלו" />
                        <div className="generic-stat-data">
                            <div className="stat-value">{statisticsPageStore.getLevelBadData.total}</div>
                            <div className="stat-desc">נכשלו בשאלון</div>
                        </div>
                    </div> : <NoData />}
                {statisticsPageStore.getLevelBadData?.total > 0 ?
                    <div className="horizontal-bar-container"><HorizontalBar data={statisticsPageStore.getLevelBadData} /></div> : ""}
            </Box>
            <Box id="s-duration-avg" className="statistic-box upper-stats-no-title">
                {statisticsPageStore.getAvgTotalDurationData ?
                    <div id="duration-flex-container">
                        <div id="duration-avg-value">{statisticsPageStore.getAvgTotalDurationData}</div>
                        <div id="duration-avg-desc">זמן ממוצע למילוי השאלון</div>
                    </div> : <NoData />}
            </Box>
            <Box id="s-category-success" className="statistic-box">
                <div className="generic-title box-title">אחוזי הצלחה בכל קטגוריה</div>
                {statisticsPageStore.getCategoriesData?.length ?
                    <CategoriesStats /> : <NoData />}
            </Box>
            <Box id="s-ages" className="statistic-box">
                <div className="generic-title box-title">פילוח תוצאות לפי גיל</div>
                {statisticsPageStore.getAgeRangesData && (statisticsPageStore.getAgeRangesData.goodDataExist || statisticsPageStore.getAgeRangesData.badDataExist) ?
                    <AgesStats /> : <NoData />}
            </Box>
            <Box id="s-sectors" className="statistic-box">
                <div className="generic-title box-title">התפלגות לפי אוכלוסיה</div>
                {statisticsPageStore.getSectorsStats?.maxCount > 0 ?
                    statisticsPageStore.getSectorsStats.array.map((sector, i) => {
                        if (sector.sector) {
                            return <SectorRow key={sector.sector} sectorName={sector.sector} count={sector.count} color={STATS_COLORS[i]} />
                        }
                        return null;
                    }) : <NoData />}
            </Box>
            {(adminDataCtx.isSuperAdmin() && statisticsPageStore.filters.organizationId === ALL_ORGANIZATIONS_FILTER.organizationName) && <Box id="s-organizations" className="statistic-box">
                <div className="generic-title box-title">התפלגות לפי תוכנית</div>
                {statisticsPageStore.getOrganizationsStats?.maxCount > 0 ?
                    statisticsPageStore.getOrganizationsStats.array.map((organization, i) => {
                        return <OrganizationRow key={organization.organization + i} organizationName={organization.organization} count={organization.count} />
                    }) : <NoData />}
            </Box>}
            <Box id="s-cities" className="statistic-box">
                <div className="generic-title table-title">התפלגות לפי ערים</div>
                {statisticsPageStore.getLimitedCitiesStats?.length ?
                    <div>
                        <TableWithLimit data={statisticsPageStore.getLimitedCitiesStats} columnsNames={["עיר", "גבוה", "בינוני", "נמוך"]} link={"temp"} />
                        <div className="generic-title sub-title" > <span onClick={() => { props.changePage(2) }}>לרשימת הערים המלאה<img id='arrow-img-flipped' src="images/icons/Icon-back.svg" alt=""></img></span></div>
                    </div> : <NoData />}
            </Box>
            <Box id="s-questions" className="statistic-box">
                <div className="generic-title table-title">שאלות</div>
                {statisticsPageStore.getLimitedQuestionsStats?.length ?
                    <div>
                        <TableWithLimit data={statisticsPageStore.getLimitedQuestionsStats} columnsNames={["שאלה", "הצליחו", "נכשלו"]} link={"temp"} />
                        <div className="generic-title sub-title" ><span onClick={() => { props.changePage(1) }}>לרשימת השאלות המלאה<img id='arrow-img-flipped' src="images/icons/Icon-back.svg" alt=""></img></span></div>
                    </div> : <NoData />}
            </Box>
        </div>
    );
}

export default observer(DisplayStatistics);