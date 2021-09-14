import React from "react";
import PieChart, { Series, Size, Legend } from "devextreme-react/pie-chart";
import { COLORS, GENDER_EN_TO_HEB } from "../../../consts/consts";
import { toFixedIfNecessary } from "../../../consts/functions";

const GenderChart = (props) => {
    const cText = (value) => {
        let p = props.data[value.pointIndex].percentage;
        p = toFixedIfNecessary(p);
        return `${p}%  ${GENDER_EN_TO_HEB[value.pointName]}`;
    }

    return (
        <PieChart
            id="pie-chart"
            dataSource={props.data}
            palette={[COLORS.lightBlue, COLORS.red, COLORS.seaGreen]}
            rtlEnabled={true}
            startAngle={90}
        >
            <Series argumentField="gender" valueField="percentage"></Series>
            <Legend
                horizontalAlignment="left"
                verticalAlignment="bottom"
                customizeText={cText}
                itemTextPosition="left"
                font={{ color: COLORS.darkBlue, family: "'assistant', sans-serif", size: (window.innerHeight / 50) }}
            />
            <Size width={window.innerHeight / 2.85} height={window.innerHeight / 4.5} />
        </PieChart>
    );
}

export default GenderChart;