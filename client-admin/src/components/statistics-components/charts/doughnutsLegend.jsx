import React from 'react';
import { STATS_COLORS } from '../../../consts/consts';
import './doughnutsLegend.scss';

export const DoughnutsLegend = ({ values, setRangeHovered }) => {

    return (
        <div className="doughnuts-legend">
            {values.map((range, i) => {
                document.documentElement.style.setProperty(`--bg${i}`, STATS_COLORS[i])
                return (<div
                    key={range}
                    className="range-container"
                    onMouseEnter={() => setRangeHovered({ range: range, color: STATS_COLORS[i] })}
                    onMouseLeave={() => setRangeHovered(null)} >
                    <div className="color-stick" ></div>
                    <div className="range-data">{range}</div>
                </div>)
            })}
        </div >
    );
}

export default DoughnutsLegend;
