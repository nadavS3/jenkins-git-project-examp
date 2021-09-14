import React, { useState, useEffect } from "react";
import { isMobileOnly, isTablet } from "react-device-detect";
import { useHistory } from "react-router";

import { useUsersStore } from '../../stores/index.store';
import AutocompleteCopy from "./Autocomplete.jsx";
import citiesDB from "../../consts/citiesDB";
import { GeneralAlert } from "../../genericComponents/generalAlerts";
import GenericInput from "../../genericComponents/genericInput";

import FormControl from "@material-ui/core/FormControl";
import NativeSelect from "@material-ui/core/NativeSelect";
import { makeStyles, createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

import { cityRegExp, nameRegExp, emailRegExp, phoneNumberRegExp, basicPhoneNumberRegExp } from '../../consts/RegExps';
import { compareCityToDataBase } from '../../consts/functions'
import { getCookie, OUR_COOKIE } from "../../consts/cookies";

import "./PersonalData.scss";
import '../../consts/Btns.scss';
import '../../consts/ErrorMessages.scss';
import '../../consts/PhoneHeader.scss';
import '../../consts/classNames.scss';

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: "10px",
    direction: "ltr",
    height: "calc(var(--vh, 1vh) * 3.4)",
    borderRadius: "5px",
    margin: 0,
    padding: 0,
    position: "relative",
    backgroundColor: "white",
    width: "100%",
  },
  nativeSelect: {
    backgroundColor: "none",
    background: "none",
    direction: "rtl",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  }
}));

const theme1 = createMuiTheme({
  overrides: {
    MuiNativeSelect: {
      select: {
        fontSize: isMobileOnly ? "calc(var(--vh, 1vh) * 2.6)" : "calc(var(--vh, 1vh) * 1.8)",
        paddingRight: "2% !important",
        paddingBottom: isMobileOnly ? "2% !important" : "1% !important",
        paddingTop: isMobileOnly && "2%",
        height: "calc(var(--vh, 1vh) * 3.4)",
        "&:focus": {
          backgroundColor: "none",
        }
      },
      icon: {
        right: "unset",
        left: 0
      }
    },
    MuiInputBase: {
      input: {
        font: "caption",
        padding: 0,
        "&:focus": {
          outline: "-webkit-focus-ring-color auto 1px",
        }
      },
    }
  }
});


function PersonalData({ nextPage, fadeOutAnimation, setFadeOutAnimation, setOvalAnimation2, setOvalAnimation1, nextPageMobile, mobileAllButton }) {

  const usersStore = useUsersStore();

  const classes = useStyles();

  const [firstNameMessage, setFirstNameMessage] = useState('');
  const [LastNameMessage, setLastNameMessage] = useState('');
  const [userEmailMessage, setUserEmailMessage] = useState("");
  const [userPhoneNumberMessage, setUserPhoneNumberMessage] = useState("");
  const [ageMessage, setAgeMessage] = useState('');
  const [buttonMessage, setButtonMessage] = useState('');

  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [userCity, setUserCity] = useState("");
  const [userAge, setUserAge] = useState("");
  const [userGender, setUserGender] = useState("");
  const [userFamilyStatus, setUserFamilyStatus] = useState("");

  const history = useHistory();

  const [showSecondPart, setShowSecondPart] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (getCookie(OUR_COOKIE)) {
      history.push("/")
      usersStore.showErrorPopUp("לא ניתן להשיב על השאלון יותר מפעם אחת")
    } // cookies already exist
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFirstName = (e) => {
    let value = e.target.value;
    if (value.length > 20) {
      setFirstNameMessage("הגעת למספר התווים המקסימלי");
      return;
    }

    const check = nameRegExp.test(value);

    if (check || !value) {
      setFirstNameMessage('')
      setUserFirstName(value);
    } else {
      setFirstNameMessage("אנא הכנס רק אותיות");
    }
  };


  const handleUserEmail = (e) => {
    let value = e.target.value;
    if (value.length > 30) {
      setUserEmailMessage("הגעת למספר התווים המקסימלי");
      return;
    }
    setUserEmailMessage('')
    setUserEmail(value);
  };

  const handleUserPhoneNumber = (e) => {
    let value = e.target.value;
    if (value.length > 15) {
      setUserPhoneNumberMessage("הגעת למספר התווים המקסימלי");
      return;
    }

    const check = basicPhoneNumberRegExp.test(value);
    if (check || !value) {
      setUserPhoneNumberMessage('')
      setUserPhoneNumber(value);
    } else {
      setUserPhoneNumberMessage("אנא הכנס רק ספרות ותווים מתאימים");
    }

  };


  const handleLastName = (e) => {
    let value = e.target.value;
    if (value.length > 20) {
      setLastNameMessage("הגעת למספר התווים המקסימלי");
      return
    }
    //value of check is true if containes only cherecters or spacebar
    const check = nameRegExp.test(value);

    if (check || !value) {
      setLastNameMessage('')
      setUserLastName(value);
    } else {
      setLastNameMessage("אנא הכנס רק אותיות");
    }
  };

  const handleAge = (e) => {
    e.persist()
    const value = e.target.value;
    if (isNaN(value)) {
      setAgeMessage("אנא הכנס רק מספרים");
    } else {
      setAgeMessage('')
      setUserAge(value);
    }
  };
  const setCity = (value) => {
    const check = cityRegExp.test(value);
    if (check || !value) { setUserCity(value); }
  };

  const handleKey = (e) => {
    if (e.keyCode === 13) { showSecondPart ? submit() : submitFirst() }
  }
  const submitFirst = () => {
    let isGood = true;
    if (userFirstName.trim() === '' || userLastName.trim() === '' || userEmail.trim() === '' || userPhoneNumber.trim() === '') {
      setButtonMessage("אנא מלא את כל השדות");
      return
    }
    if (userFirstName.trim().length <= 1 || userLastName.trim().length <= 1) {
      isGood = false
      setFirstNameMessage("שדה השם חייב להכיל יותר מאות אחת")
    }
    if (!(emailRegExp.test(userEmail))) {
      isGood = false
      setUserEmailMessage("מייל אינו תקין")
    }
    if (!(phoneNumberRegExp.test(userPhoneNumber))) {
      isGood = false
      setUserPhoneNumberMessage("מספר הטלפון אינו תקין")
    }
    if (!isGood) {
      setButtonMessage("אחד השדות אינו תקין")
      return
    }
    setShowSecondPart(true)

  }

  const submit = () => {
    if (userFirstName.trim() === '' || userLastName.trim() === '' || userCity === '' || userAge === '' || userGender === '' || userFamilyStatus === '') {

      setButtonMessage("אנא מלא את כל השדות");
      return;
    }
    if (+(userAge) < 20 || +(userAge) > 120) {
      setAgeMessage("אנא הכנס גיל תקין בין 20 ל-120")
      return;
    }
    if (userFirstName.trim().length <= 1 || userLastName.trim().length <= 1) {
      setButtonMessage("שדה השם חייב להכיל יותר מאות אחת")
      return;
    }

    //need to check if there are options opens so you cant continue (autoshearch)

    let isActualCity = compareCityToDataBase(userCity);
    if (!isActualCity) { setButtonMessage("אנא הכנס עיר תקינה"); return; }

    const userInfo = {
      firstName: userFirstName.trim(),
      lastName: userLastName.trim(),
      email:userEmail.trim(),
      phoneNumber:userPhoneNumber.trim(),
      city: userCity,
      age: +(userAge),
      gender: userGender,
      familyStatus: userFamilyStatus
    }
    usersStore.updateUserInfo(userInfo);
    setClicked(true);
    if (isMobileOnly) {
      nextPageMobile();

    }
    else {
      setFadeOutAnimation('fade-out');
      setOvalAnimation2('fade-out-personal-data-oval2');
      setOvalAnimation1('fade-out');
      const animated = document.getElementById('data');
      animated.addEventListener('animationend', () => {
        nextPage();
      });
    }
  };


  useEffect(() => {
    let timeout;
    if (buttonMessage) {
      timeout = setTimeout(() => {
        setButtonMessage("")
      }, 5000)
    }
    return () => {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buttonMessage])


  const firstPart = (
    <>
      <GenericInput
        inputFocus={() => { usersStore.setIsKeyboardFocused(true); }}
        divId="firstName" divClassName="native-box" labelId={isMobileOnly ? "mobile-label" : null}
        labelValue="שם פרטי" inputClassName={`input-style ${isMobileOnly ? "mobile-input" : ""}`}
        inputType="text"
        inputName="firstName"
        inputValue={userFirstName}
        inputOnChange={handleFirstName}
        inputOnBlur={() => { setFirstNameMessage(""); usersStore.setIsKeyboardFocused(false); }}
        errMessage={firstNameMessage}
      />
      <GenericInput
        inputFocus={() => { usersStore.setIsKeyboardFocused(true); }}
        divId="lastName"
        divClassName="native-box"
        labelId={isMobileOnly ? "mobile-label" : null}
        labelValue="שם משפחה"
        inputClassName={`input-style ${isMobileOnly ? "mobile-input" : ""}`}
        inputType="text"
        inputName="lastName"
        inputValue={userLastName}
        inputOnChange={handleLastName}
        inputOnBlur={() => { setLastNameMessage(""); usersStore.setIsKeyboardFocused(false); }}
        errMessage={LastNameMessage}
      />
      <GenericInput
        inputFocus={() => { usersStore.setIsKeyboardFocused(true); }}
        divId="email"
        divClassName="native-box"
        labelId={isMobileOnly ? "mobile-label" : null}
        labelValue="מייל"
        inputClassName={`input-style ${isMobileOnly ? "mobile-input" : ""}`}
        inputType="text"
        inputName="email"
        inputValue={userEmail}
        inputOnChange={handleUserEmail}
        inputOnBlur={() => { setUserEmailMessage(""); usersStore.setIsKeyboardFocused(false); }}
        errMessage={userEmailMessage}
      />
      <GenericInput
        inputFocus={() => { usersStore.setIsKeyboardFocused(true); }}
        divId="phone"
        divClassName="native-box"
        labelId={isMobileOnly ? "mobile-label" : null}
        labelValue="מספר טלפון"
        inputClassName={`input-style ${isMobileOnly ? "mobile-input" : ""}`}
        inputType="text"
        inputName="phone-number"
        inputValue={userPhoneNumber}
        inputOnChange={handleUserPhoneNumber}
        inputOnBlur={() => { setUserPhoneNumberMessage(""); usersStore.setIsKeyboardFocused(false); }}
        errMessage={userPhoneNumberMessage}
      />
    </>)

  const secondPart = (
    <>
      <div>
        <div className=" autocomplete "  >
          <label id={isMobileOnly ? "mobile-label" : null} className=''>עיר מגורים</label>
          <AutocompleteCopy setCity={setCity} suggestions={citiesDB} />
        </div>
      </div>

      <GenericInput
        inputFocus={() => { usersStore.setIsKeyboardFocused(true) }}
        divClassName="native-box"
        labelId={isMobileOnly ? "mobile-label" : null}
        labelValue="גיל"
        inputClassName={`input-style ${isMobileOnly ? "mobile-input" : ""}`}
        inputType="number"
        inputName="age"
        inputValue={userAge}
        inputOnChange={handleAge}
        inputOnBlur={() => { setAgeMessage(""); usersStore.setIsKeyboardFocused(false); }}
        errMessage={ageMessage}
      />

      <MuiThemeProvider theme={theme1}>
        <div className=" native-box">
          <label id={isMobileOnly ? "mobile-label" : null} className='dropdown-label'>מגדר</label>
          <FormControl
            className={`${classes.formControl}  form-control-component  ${isMobileOnly ? "mobile-input" : null}`}
          >
            <NativeSelect
              disableUnderline={true}
              className={`${classes.nativeSelect}  ${isMobileOnly ? "mobile-input" : ""}`}
              value={userGender}
              onChange={(e) =>
                e.target.value !== "0"
                  ? setUserGender(e.target.value)
                  : ''
              }
              label="gender"
            >
              <option value={0} />
              <option value={"male"}>זכר</option>
              <option value={"female"}>נקבה</option>
              <option value={"other"}>אחר</option>
            </NativeSelect>
          </FormControl>
        </div>
        <div id='family-status-div' className=" native-box">
          <label id={isMobileOnly ? "mobile-label" : null} className="dropdown-label" >מצב משפחתי</label>
          <FormControl className={`${classes.formControl} form-control-component ${isMobileOnly ? "mobile-input" : null} `}>
            <NativeSelect

              disableUnderline={true}
              className={`${classes.nativeSelect}  ${isMobileOnly ? "mobile-input" : ""}`}
              value={userFamilyStatus}
              onChange={(e) =>
                e.target.value !== "0"
                  ? setUserFamilyStatus(e.target.value)
                  : ''
              }
              label="familyStatus"
            >
              <option value={0} />
              <option value={"single"}>רווק/ה</option>
              <option value={"divorced"}>גרוש/ה</option>
              <option value={"married"}>נשוי/אה</option>
              <option value={"widow"}>אלמן/ה</option>
              <option value={"other"}>אחר</option>
            </NativeSelect>
          </FormControl>
        </div>
      </MuiThemeProvider>
    </>)

  return (
    <div id={isMobileOnly ? "personal-data-page-mobile" : null} className={` ${!isMobileOnly && "fade-in"} ${!isMobileOnly && fadeOutAnimation} personal-data-page-general `} >
      {isMobileOnly && <div className="two-logos">
        <img alt="" src="/logos/phone_logo.png" className="mobile-logo" draggable={false} />
        <img alt="" src="/logos/digital-orientation-logo.png" className="mobile-logo" draggable={false} />
      </div>}

      <div id={isMobileOnly ? "mobile-header" : "phone-header"} className="phone-header">שאלון הכרות</div>
      <div id={isMobileOnly ? "personal-data-form-mobile" : isTablet ? "personal-data-form-tablet" : null} className={`personal-data-form ${isMobileOnly && 'fade-in'}`} >
        {!showSecondPart ? firstPart : secondPart}
      </div>

      {isMobileOnly && buttonMessage && <GeneralAlert isRelative={true} text={buttonMessage} center={true} />}
      {isMobileOnly ? <div onClick={showSecondPart?submit:submitFirst} className={clicked ? "disable-click" : ""}> {mobileAllButton} </div> : <div className={`${clicked ? "disable-click" : ""} ${isMobileOnly ? "mobile" : "form"}-btn phone-btn `} tabIndex="0" onClick={showSecondPart?submit:submitFirst} onKeyDown={handleKey}  >המשך</div>}
      {!isMobileOnly && buttonMessage && <GeneralAlert isRelative={true} text={buttonMessage} center={true} />}
    </div>

  );
}

export default PersonalData;
