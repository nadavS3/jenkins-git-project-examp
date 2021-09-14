import React from 'react';
import './GenericTextAreaAddQuestion.scss';

function GenericTextAreaAddQuestion({ name, label, size, value, handle, popUp }) {

    return (
        <div className="field-container">
            <div id={name} className="generic-add-question-title big-title">
                <label>
                    {label}
                </label>
                <textarea
                    className={size}
                    type="text"
                    value={value}
                    onChange={handle}
                />
            </div>
            <div className="error-message">
                <em>{popUp}</em>
            </div>
        </div>
    );
}

export default GenericTextAreaAddQuestion;