import React from 'react';

import './generalInput.scss';

const GeneralInput = ({ value, onChange, onBlur, autoFocus, placeholder, errMsg, inputClassNames, type }) => {

    return (
        <>
            <input className={inputClassNames || ""} value={value || ""} placeholder={placeholder || ""} onChange={onChange} onBlur={onBlur || undefined} autoFocus={autoFocus || false} type={type || undefined} />
            {errMsg ? <div className="err-msg-general-input">{errMsg}</div> : null}
        </>
    );
}

export default GeneralInput;