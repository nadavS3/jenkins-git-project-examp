import React from 'react';
import './noDataAvailable.scss';

const NoData = ({ text = "אין נתונים זמינים" }) => {
    return (
        <div className="no-data-available">{text}</div>
    );
}

export default NoData;