import React from 'react';
import { observer } from 'mobx-react-lite';
import './genericOrganizationRow.scss';
import { useStatisticsPageStore } from '../../../stores/index.store';

const OrganizationRow = ({ organizationName, count }) => {

    const statisticsPageStore = useStatisticsPageStore();

    return (
        <div className="organization-container">
            <div className="organization-name">{organizationName}</div>
            <div className="organization-bar">
                <div className="organization-bar-fill" style={{ width: `${(count / statisticsPageStore.getOrganizationsStats.maxCount) * 100}%` }}></div>
                <div className="organization-count">{count}</div>
            </div>
        </div>
    );
}

export default observer(OrganizationRow);