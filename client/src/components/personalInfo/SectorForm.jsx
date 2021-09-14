import React, { useState, useEffect } from "react";
import "./SectorForm.scss";
import { useHistory } from "react-router";
import "../../consts/Btns.scss";
// import "../../consts/fade-in.scss"
import "../../consts/PhoneHeader.scss";
import { useUsersStore } from "../../stores/index.store";
import GenericRadio from "../../genericComponents/GenericRadio";
import { getCookie, OUR_COOKIE } from "../../consts/cookies";
import { observer } from "mobx-react-lite";
import { isMobileOnly } from "react-device-detect";
import Loader from "../../genericComponents/Loader";
import { GeneralAlert } from "../../genericComponents/generalAlerts";

function SectorForm(props) {
  const usersStore = useUsersStore();
  const [sector, setSector] = useState("");
  const [buttonMessage, setButtonMessage] = useState("");

  const history = useHistory();
  useEffect(() => {

    if (getCookie(OUR_COOKIE)) {
      history.push("/")
      usersStore.showErrorPopUp("לא ניתן להשיב על השאלון יותר מפעם אחת")
    } // cookies already exist
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (sector === '') {
      setButtonMessage("אנא בחר אופציה!");
      return;
    }
    props.setFadeOutAnimation('fade-out')
    usersStore.updateUserInfo(sector);
    if (isMobileOnly) {
      props.nextPageMobile()

    }
    else {
      const animated = document.getElementById('sector')
      animated.addEventListener('animationend', () => {
        props.nextPage();
      });
    }


  };

  const handleKey = (e) => {
    if (e.keyCode === 13) { submit() }
  }
  const sectorSelected = (e) => {
    if (!sector) {
      setButtonMessage("");
    }
    setSector({ sector: e.target.value });
  };


  useEffect(() => {
    if (buttonMessage) {
      setTimeout(() => {
        setButtonMessage("")
      }, 5000)
    }
  }, [buttonMessage])

  let sectorFormArrayValues = ["ערבית", "חרדית", "אזרחים ותיקים", "אחר"];
  return (
    <div id="sector-form-page" className={`${!isMobileOnly && "fade-in"}  ${!isMobileOnly && props.fadeOutAnimation}`} >
      {isMobileOnly && <div className="two-logos">
        <img alt="" src="/logos/phone_logo.png" className="mobile-logo" draggable={false} />
        <img alt="" src="/logos/digital-orientation-logo.png" className="mobile-logo" draggable={false} />
      </div>}
      <div id={isMobileOnly ? "mobile-header" : "phone-header"} className="phone-header">
        שאלון הכרות
      </div>
      <div id="sector-page-content" >
        <p id="minor-order">אני משתייך לאוכלוסייה:</p>
        <div id={`sector-form-container${isMobileOnly ? "mobile" : "browser"}`} className="sector-form-container fade-in">
          {sectorFormArrayValues.length ? sectorFormArrayValues.map((value, index) => (
            <GenericRadio
              key={value}
              labelClassName="sector-form-label "
              handleOnClick={sectorSelected}
              value={value}
              spanClassName="sector-form-item-div"
              spanValue={value}
              selected={sector && sector.sector === value}
            />
          )) : <Loader />}
        </div>
      </div>
      {isMobileOnly && buttonMessage && <GeneralAlert isRelative={true} text={buttonMessage} center={true} />} {/* change to openGenAlert */}
      {isMobileOnly ? <div onClick={submit}> {props.mobileAllButton} </div> : <div className={`${isMobileOnly ? "mobile-btn" : "form-btn"} phone-btn ${!sector && "not-selected"}`} tabIndex="0" onKeyDown={handleKey} onClick={submit}>סיום</div>}
      {!isMobileOnly && buttonMessage && <GeneralAlert isRelative={true} text={buttonMessage} center={true} />}
    </div >
  );
}

export default observer(SectorForm);
