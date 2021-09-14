import React from 'react';
import './genericRow.scss';

const GenericRow = (props) => {


    return (
        <div className="user-data-row">
            <div className="field user-info">{props.field1.field}</div>
            <div className="value user-info">{props.field1.value}</div>
            {props.field2 ?
                <>
                    <div className="field user-info">{props.field2.field}</div>
                    <div className="value user-info">{props.field2.value}</div>
                </>
                : null}
            {props.button && props.button}
        </div>
    )
}

export default GenericRow