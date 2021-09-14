import React from "react";
import PieChart, { Series, Size, Legend, Title, Tooltip } from "devextreme-react/pie-chart";
import { COLORS, GENDER_EN_TO_HEB } from "../../../consts/consts";
import './successDoughnutChart.scss';
import { toFixedIfNecessary } from "../../../consts/functions";

const SuccessChart = (props) => {

    const customizeTooltip = (hovered) => {
        let data = [];
        if (hovered.argument === "success") {
            props.dataByGender.forEach((g) => {
                const gender = GENDER_EN_TO_HEB[g.gender.toLowerCase()];
                const percentage = toFixedIfNecessary((g.correct / g.total) * 100);

                data.push({ gender: gender, percentage: percentage })
            })
        }
        let divs = [];
        data.forEach((g) => divs.push(<div>{`${g.gender}:  ${g.percentage}%`}</div>))
        return (<div dir="rtl">
            {divs}
        </div >)
    }

    const CenteredPercentage = (pieChart) => {
        const percentage = pieChart.getAllSeries()[0].getVisiblePoints()[0].data.rate;
        return (<svg className="centered-percentage">
            <text textAnchor="middle" x="110" y="100" >
                <tspan x="50">{percentage}%</tspan>
            </text>
        </svg>)
    }

    return (
        <PieChart
            className="success-doughnut-chart"
            type="doughnut"
            dataSource={props.data}
            palette={[COLORS.seaGreen, "#F8F8F8"]}
            innerRadius={1}
            startAngle={90}
            centerRender={CenteredPercentage}
        >
            <Series argumentField="result" valueField="rate" hoverMode="none" ></Series>
            <Legend visible={false} />
            <Title
                text={props.title}
                font={{ color: COLORS.seaGreen, family: "'assistant', sans-serif", size: (window.innerHeight / 35), weight: 600 }}
                verticalAlignment="bottom"
                margin={{ top: 25 }}
            />
            <Tooltip
                enabled={true}
                shared={false}
                font={{ color: COLORS.darkBlue, family: "'assistant', sans-serif", size: (window.innerHeight / 50) }}
                shadow={{ color: "#00000057" }}
                cornerRadius={5}
                contentRender={customizeTooltip}
            />
            <Size width={window.innerHeight / 4.5} height={window.innerHeight / 3.5} />
        </PieChart>
    )
}

export default SuccessChart;