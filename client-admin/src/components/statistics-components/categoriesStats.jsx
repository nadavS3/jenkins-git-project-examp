import React from 'react';
import { useStatisticsPageStore } from '../../stores/index.store';
import SuccessDoughnutChart from './charts/successDoughnutChart';
import './categoriesStats.scss';

export const CategoriesStats = () => {

    const statisticsPageStore = useStatisticsPageStore();
    const { getCategoriesData } = statisticsPageStore;

    return (
        <div id="success-charts-wrapper">
            {getCategoriesData.map((cat, i) => {
                return <SuccessDoughnutChart key={cat.categoryName} data={cat.rates} dataByGender={cat.byGender} title={cat.categoryName} />
            })}
        </div>
    );
}

export default CategoriesStats;