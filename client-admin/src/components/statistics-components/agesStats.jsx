import React, { useState } from 'react';
import { useStatisticsPageStore } from '../../stores/index.store';
import DoughnutsLegend from './charts/doughnutsLegend';
import DoughnutChart from './charts/agesDoughnutChart';
import './agesStats.scss';
import NoData from '../../generic-components/noDataAvailable';

export const AgesStats = () => {

    const statisticsPageStore = useStatisticsPageStore();
    const { getAgeRangesData } = statisticsPageStore;
    const [rangeHovered, setRangeHovered] = useState(null);

    return (
        <div id="doughnut-charts-wrapper">
            {getAgeRangesData && (getAgeRangesData.goodDataExist || getAgeRangesData.badDataExist)
                ? <DoughnutsLegend values={getAgeRangesData.ranges} setRangeHovered={setRangeHovered} /> : "אין נתונים להציג"}
            {getAgeRangesData && getAgeRangesData.goodDataExist ?
                <div className="doughnut-chart-container">
                    <DoughnutChart
                        data={getAgeRangesData.goodDataForChart}
                        title="הצלחה"
                        rangeHovered={rangeHovered} />
                </div>
                : <NoData text="אין נתוני הצלחה" />}
            {getAgeRangesData && getAgeRangesData.badDataExist ?
                    <div className="doughnut-chart-container">
                        <DoughnutChart
                            data={getAgeRangesData.badDataForChart}
                            title="כישלון"
                            rangeHovered={rangeHovered} />
                    </div>
                : <NoData text="אין נתוני כישלון" />}
        </div>
    );
}

export default AgesStats;