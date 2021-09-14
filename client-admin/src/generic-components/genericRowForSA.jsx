import React from "react";
import './genericRowForSA.scss'
function GenericRowForSA({ onGeneralClick, text, onTrashClick, removePenIcon, onPenClick }) {

    return (
        <div id="" className="generic-container">
            <div onClick={onGeneralClick && onGeneralClick} className="element-in-row label">
                {text ? text : null}
            </div>
            <div className="icons-container element-in-row">
                {!(removePenIcon) && <div onClick={onPenClick && onPenClick} className=" icon-pen">
                    <img className="icon-img" src="images/icons/Icon-pen.svg" alt="" />
                </div>}
                <div className=" icon-trash" onClick={onTrashClick && onTrashClick}>
                    <img className="icon-img" src="images/icons/Icon-trash.svg" alt="" />
                </div>
            </div>

        </div>
    )
}

export default GenericRowForSA;