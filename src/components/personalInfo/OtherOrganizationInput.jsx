import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { isMobileOnly } from 'react-device-detect';
import { nameRegExp } from '../../consts/RegExps';
import GenericInput from '../../genericComponents/genericInput';
import { useUsersStore } from '../../stores/index.store';

const OtherOrganizationInput = ({ display }) => {
    const usersStore = useUsersStore();
    const [customOrganizationMessage, setCustomOrganizationMessage] = useState("");

    const handleCustomOrganization = (e) => {
        let value = e.target.value;
        if (value.length > 50) {
            setCustomOrganizationMessage("הגעת למספר התווים המקסימלי");
            return;
        }
        const check = nameRegExp.test(value);
        if (check || !value) {
            setCustomOrganizationMessage('')
            usersStore.setCustomOrganization(value);
        } else {
            setCustomOrganizationMessage("אנא הכנס רק אותיות");
        }
    };

    return (
        <div id="other-organization-input-container" className={display ? "show-input" : "hide-input"}>
            <GenericInput
                inputFocus={() => { usersStore.setIsKeyboardFocused(true); }}
                divId="otherOrganization" divClassName="native-box" labelId={isMobileOnly ? "mobile-label" : null}
                labelValue="שם התכנית" inputClassName={`input-style ${isMobileOnly ? "mobile-input" : ""}`}
                inputType="text"
                inputName="otherOrganization"
                inputValue={usersStore.customOrganization}
                inputOnChange={handleCustomOrganization}
                inputOnBlur={() => { setCustomOrganizationMessage(""); usersStore.setIsKeyboardFocused(false); }}
                errMessage={customOrganizationMessage}
            />
        </div>
    )
}

export default observer(OtherOrganizationInput);