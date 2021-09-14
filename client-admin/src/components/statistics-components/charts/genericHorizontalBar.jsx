import React, { useState } from 'react';
import { toFixedIfNecessary } from '../../../consts/functions';
import './genericHorizontalBar.scss';

const HorizontalBar = ({ data }) => {

    const { womenPercentage, menPercentage, otherPercentage } = data;

    const [tooltipClass, setTooltipClass] = useState("no-display");

    const handleHover = () => {
        setTooltipClass(tooltipClass === "display" ? "no-display" : "display");
    }

    return (
        <div className="horizontal-bar">
            <div className={`tooltips ${tooltipClass}`}>
                <div className="women-tooltip">{`${toFixedIfNecessary(womenPercentage)}% נשים`}</div>
                <div className="other-tooltip">{`${toFixedIfNecessary(otherPercentage)}% אחר`}</div>
                <div className="men-tooltip">{`${toFixedIfNecessary(menPercentage)}% גברים`}</div>
            </div>
            <div className="bar" onMouseEnter={handleHover} onMouseLeave={handleHover}>
                <div className="women" style={{ flex: `${womenPercentage}%` }}></div>
                <div className="other" style={{ flex: `${otherPercentage}%` }}></div>
                <div className="men" style={{ flex: `${menPercentage}%` }}></div>
            </div>
        </div>
    );
}

export default HorizontalBar;