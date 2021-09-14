import React from "react";
import "./genericInput.scss"

const GenericInput = (props) => {

    return (
        <div id={props.divId ? props.divId : ''} className={props.divClassName ? props.divClassName : ''}  >
            <label id={props.labelId ? props.labelId : ''} > {props.labelValue}</label>
            <input
                className={props.inputClassName ? props.inputClassName : ''}
                type={props.inputType ? props.inputType : 'text'}
                name={props.inputName ? props.inputName : 'undefined'}
                value={props.inputValue}
                onChange={props.inputOnChange ? props.inputOnChange : null}
                onBlur={props.inputOnBlur ? props.inputOnBlur : null}
                onFocus={props.inputFocus ? props.inputFocus : null}
                autoComplete="off"
            />
            <div className="error-message"> <em>{props.errMessage}</em> </div>
        </div>
    )

}

export default GenericInput