import React from 'react';
import './genericTableWithLimit.scss';

const TableWithLimit = ({ data, title, columnsNames /*left to right*/, link }) => {

    return (
        <div className="table-limit-container">
            <table className="table-limit">
                <thead>
                    <tr>
                        {columnsNames.map((cn, i) => {
                            return <th  key={cn}>{cn}</th>
                        })}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => {
                        return (<tr key={row.value}>
                            <td>{row.value}</td>
                            <td className="good">{row.good}</td>
                            {(row.intermediate || row.intermediate === 0) && <td className="intermediate">{row.intermediate}</td>}
                            <td className="bad">{row.bad}</td>
                        </tr>)
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default TableWithLimit;