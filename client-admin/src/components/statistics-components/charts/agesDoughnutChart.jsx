import React, { useEffect, useRef, useState } from "react";
import PieChart, { Series, Size, Legend, Title } from "devextreme-react/pie-chart";
import { COLORS } from "../../../consts/consts";
import './agesDoughnutChart.scss';
import { toFixedIfNecessary } from "../../../consts/functions";

const AgesChart = (props) => {

    const [centerClasses, setCenterClasses] = useState("invisible");
    const [centerData, setCenterData] = useState(null);
    const pieChartRef = useRef(null);

    useEffect(() => {
        props.rangeHovered ? externalHover(props.rangeHovered) : setCenterClasses("invisible");
    }, [props.rangeHovered])

    const handleHover = (data) => {
        setCenterData({
            range: data.target.data.range,
            percentage: toFixedIfNecessary(data.target.data.percentage),
            color: data.target.getColor()
        });
        setCenterClasses(centerClasses === "visible" ? "invisible" : "visible");
    }

    const externalHover = (rangeHovered) => {
        let percentage = 0;
        const rangesArray = pieChartRef.current.props.dataSource;
        for (let i = 0; i < rangesArray.length; i++) {
            if (rangesArray[i].range === rangeHovered.range) {
                percentage = rangesArray[i].percentage;
                break;
            }
        }
        setCenterData({
            range: rangeHovered.range,
            percentage: toFixedIfNecessary(percentage),
            color: rangeHovered.color
        })
        setCenterClasses("visible");
    }

    const CenteredTooltip = () => {
        if (!centerData) { return <svg className={`centered-tooltip invisible`}></svg> }
        return (<svg className={`centered-tooltip ${centerClasses}`}>
            <text alignmentBaseline="middle" textAnchor="middle" >
                <tspan className="percentage" x="50" y="85" fill={centerData.color}>{centerData.percentage}%</tspan>
                <tspan className="range" x="50" dy="20%" fill={centerData.color}>{centerData.range}</tspan>
            </text>
        </svg>)
    }

    return (
        <PieChart
            ref={pieChartRef}
            className="doughnut-chart"
            type="doughnut"
            dataSource={props.data}
            palette={[COLORS.red, COLORS.lightBlue, COLORS.darkBlue, COLORS.seaGreen]}
            innerRadius={0.75}
            startAngle={90}
            centerRender={CenteredTooltip}
            onPointHoverChanged={handleHover}
        >
            <Series argumentField="range" valueField="percentage"></Series>
            <Legend visible={false} />
            <Title
                text={props.title}
                font={{ color: COLORS.darkBlue, family: "'assistant', sans-serif", size: (window.innerHeight / 50), weight: 600 }}
                verticalAlignment="bottom"
                margin={{ top: 25 }}
            />
            <Size width={window.innerHeight / 5} height={window.innerHeight / 4} />
        </PieChart>
    );
}

export default AgesChart;