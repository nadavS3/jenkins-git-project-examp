import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { isMobileOnly } from "react-device-detect";
import { AsyncTools } from "@hilma/tools";
import Axios from "axios";
import { useUsersStore } from "../../stores/index.store";

import { POP_UP_MESSAGE_PROBLEM } from "../../consts/consts";
import { getCookie, OUR_COOKIE } from "../../consts/cookies";

import GenericRadio from "../../genericComponents/GenericRadio";
import Loader from "../../genericComponents/Loader";
import { GeneralAlert } from "../../genericComponents/generalAlerts";

import "./OrganizationForm.scss";
import "../../consts/Btns.scss";
import "../../consts/PhoneHeader.scss";
import "../../consts/ErrorMessages.scss";
import '../../consts/logos.scss';
import '../../consts/classNames.scss';
import OtherOrganizationInput from "./OtherOrganizationInput";

function Form({ nextPage, fadeOutAnimation, setFadeOutAnimation, setOvalAnimation2, setOvalAnimation1, nextPageMobile, mobileAllButton }) {
  const usersStore = useUsersStore();
  const [organizationId, setOrganizationId] = useState(null);
  const [organizationsArrayValues, setOrganizationsArrayValues] = useState([]);
  const [buttonMessage, setButtonMessage] = useState("");
  const [clicked, setClicked] = useState(false);
  const [otherSelected, setOtherSelected] = useState(false);

  const history = useHistory();

  const fetchData = async () => {
    if (getCookie(OUR_COOKIE)) {
      history.push("/")
      usersStore.showErrorPopUp("לא ניתן להשיב על השאלון יותר מפעם אחת")
    } // cookies already exist
    else {
      const [err, res] = await AsyncTools.to(
        Axios.get("api/organization/all")
      );
      if (err) {
        usersStore.showErrorPopUp(POP_UP_MESSAGE_PROBLEM)
      }
      else {
        if (!res) { usersStore.showErrorPopUp("אין חיבור אינטרנט אנא נסה שנית מאוחר יותר, התקדמותך נשמרה ותוכל למהשיך מהנקודה בה אתה נמצא") }
        if (Array.isArray(res.data)) {
          const orgArray = res.data;
          orgArray.push({ _id: "אחר", organizationName: "אחר" });
          setOrganizationsArrayValues(orgArray)
        }
      }
    }
  }
  const handleKey = (e) => {
    if (e.keyCode === 13) { submit() }
  }

  useEffect(() => {
    if (getCookie(OUR_COOKIE)) {
      history.push("/already-answered")
    } // cookies already exist
    setOvalAnimation1('move-organizationForm-in-oval1')

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = () => {
    if (!organizationId) {
      setButtonMessage("אנא בחר ארגון!");
      return;
    }
    if (organizationId && organizationId.organizationId === "אחר") {
      if (!usersStore.customOrganization) {
        setButtonMessage("אנא בחר ארגון!");
        return;
      }
      if (usersStore.customOrganization.length > 50 || usersStore.customOrganization.length < 2) {
        setButtonMessage("אורך השם צריך להיות בין 2 ל50 תווים");
        return;
      }
    }
    else {
      usersStore.setCustomOrganization("")
    }
    usersStore.updateUserInfo(organizationId);
    setClicked(true);
    if (isMobileOnly) {
      nextPageMobile();
    }
    else {
      setOvalAnimation2('move-scale-organizationForm-oval2');
      setOvalAnimation1('fade-out');
      setFadeOutAnimation('fade-out');
      const animated = document.getElementById('organization-oval2');
      animated.addEventListener('animationend', nextPage, { once: true });
    }
  };

  const organizationSelected = (e) => {
    if (!organizationId) {
      setButtonMessage("");
    }
    setOrganizationId({ organizationId: e.target.value });
    setOtherSelected(e.target.value === "אחר");
  };

  useEffect(() => {
    if (buttonMessage) {
      setTimeout(() => {
        setButtonMessage("");
      }, 5000)
    }
  }, [buttonMessage])

  return (
    <div id="organization-form-page" className={`${!isMobileOnly && "fade-in"}  ${!isMobileOnly && fadeOutAnimation}`}>
      {isMobileOnly && <div className="two-logos">
        <img alt="" src="/logos/phone_logo.png" className="mobile-logo" draggable={false} />
        <img alt="" src="/logos/digital-orientation-logo.png" className="mobile-logo" draggable={false} />
      </div>}
      <div id={isMobileOnly ? "mobile-header" : "phone-header"} className="phone-header">
        שאלון הכרות
      </div>
      <div id={`${isMobileOnly ? 'organization-page-content-mobile' : 'organization-page-content'}`} className={`organization-page-content-general fade-in ${fadeOutAnimation}`} >
        <div id="minor-order">
          שם הפרויקט/התכנית בה את/ה לוקח/ת חלק
        </div>
        {/* //we changed the div to be inside the condition because if not then the loader will be also inside that div and that div has no initial height so we wont see the loader */}
        {organizationsArrayValues.length ?
          <div id='organization-form-container' className={!isMobileOnly ? "browser-form-container" : ""}>
            {organizationsArrayValues.map((value, index) => (
              <GenericRadio
                key={value._id}
                labelClassName="organization-form-label"
                handleOnClick={organizationSelected}
                value={value._id}
                spanClassName="organization-form-item-div"
                spanValue={value.organizationName}
                selected={organizationId && organizationId.organizationId === value._id}
              />
            ))}
            <OtherOrganizationInput display={otherSelected} />
          </div> : <div id="organization-loader-container"> <Loader /></div>}

        {isMobileOnly && buttonMessage && <GeneralAlert isRelative={true} text={buttonMessage} center={true} />} {/* change to openGenAlert */}
      </div>
      {isMobileOnly ? <div onClick={submit} className={clicked ? "disable-click" : ""}> {mobileAllButton}</div> : <div className={` form-btn phone-btn ${!organizationId && "not-selected"} ${clicked ? "disable-click" : ""}`} tabIndex="0" onKeyDown={handleKey} onClick={submit}>המשך</div>}

      {!isMobileOnly && buttonMessage && <GeneralAlert text={buttonMessage} center={true} />}
      {/* <div id ='gen-alert-container'> */}


      {/* </div> */}
    </div>
  );
}

export default Form;
