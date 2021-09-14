import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './genericButton.scss';

const GenericButton = ({ btnColor, onClick, icon, iconSize, btnText, btnSize = 'S' }) => {

    return (
        <div className={`general-btn ${btnColor}-btn btn-${btnSize}`} onClick={onClick}>
            {icon ? <div className="plus-icon"><FontAwesomeIcon icon={icon} color="white" size={iconSize} /></div> : ""}
            {btnText}
        </div>)
}

export default GenericButton;