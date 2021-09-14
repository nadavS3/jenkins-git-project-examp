import React from "react";
import { isMobileOnly } from "react-device-detect";
import './GenericRadio.scss';
import VAnimation from "./V_Animation";

//need to pass in :
//labelClassName
//handleOnClick
//value
//spanClassName
//spanValue

function GenericRadio(props) {

  return (
    <div className={isMobileOnly ? "mobile-generic-radio" : ""}>
      <label className={`${props.labelClassName} ${isMobileOnly ? "mobile-label" : "browser-label"}`}>
        <input
          type="radio"
          name="radgroup"
          onClick={props.handleOnClick}
          value={props.value}
        />
        <div className={"value " + props.spanClassName}>{props.spanValue}</div>
        {isMobileOnly ? <VAnimation check={props.selected} /> : ""}
      </label>
    </div>
  );
}

export default GenericRadio;
