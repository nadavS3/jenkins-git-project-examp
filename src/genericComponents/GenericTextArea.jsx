import React from 'react';
import './GenericTextArea.scss';

function GenericTextArea(props) {

    return (
        <>
            <div id={props.name}>
                <label>
                    {props.label}
                    <textarea
                        type="text"
                        value={props.value}
                        onChange={props.handle}
                    />
                </label>
            </div>
            <div className="error-message">
                <em>{props.popUp}</em>
            </div>
        </>
    );
}

export default GenericTextArea;