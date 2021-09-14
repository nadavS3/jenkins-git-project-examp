import React from 'react';
import { observer } from 'mobx-react-lite';
import './genericSectorRow.scss';
import { useStatisticsPageStore } from '../../../stores/index.store';

const SectorRow = ({ sectorName, count, color }) => {

    const statisticsPageStore = useStatisticsPageStore();

    return (
        <div className="sector-container">
            <div className="sector-name">{sectorName}</div>
            <div className="sector-count">{count}</div>
            <div className="sector-bar">
                <div className="sector-bar-fill" style={{ backgroundColor: color, width: `${(count / statisticsPageStore.getSectorsStats.maxCount) * 100}%` }}></div>
            </div>
        </div>
    );
}

export default observer(SectorRow);