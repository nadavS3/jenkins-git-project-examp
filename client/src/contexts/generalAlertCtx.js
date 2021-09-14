import React, { useContext, useState } from 'react';
import { GeneralAlert } from '../genericComponents/generalAlerts';


const GenAlertContext = React.createContext()

export const useGenAlert = () => useContext(GenAlertContext)

let alertTO = null;
export const GenAlertProvider = ({ children }) => {

    const [showAlert, setShowAlert] = useState(false)

    const closeAlert = () => { setShowAlert(false) }

    const openGenAlertSync = async (obj) => {
        // useful for popup - you can use it as so: 
        // let userAccepts = await openGenAlertSync({ text, isPopup: { okayText: "מתאים לי", cancelText: "בטל" } })
        // the other way is to pass a cb to openGenAlert

        if (typeof obj !== "object" || Array.isArray(obj)) return;
        clearTimeout(alertTO)
        return await new Promise((resolve, reject) => {
            const popupCb = res => { resolve(res) }
            const alertObj = { text: obj.text, warning: obj.warning || false, block: obj.block || false, noTimeout: obj.noTimeout || false }
            if (obj.isPopup) alertObj.isPopup = { ...obj.isPopup, popupCb, closeSelf: () => { setShowAlert(false) } }
            setShowAlert(alertObj)
            if (!obj.isPopup && !obj.noTimeout) alertTO = setTimeout(closeAlert, 5000)
        })
    }
    const openGenAlert = (obj, popupCb = () => { }) => {
        /**
         * @Prop obj: 
         *      @ObjProp text :string alert text
         *      @ObjProp warning :boolean (for alerts only) will color the alert red-ish, 
         *      @ObjProp center :boolean (for alerts only) will enter the alert in the center of the screen
         *      @ObjProp noTimeout :boolean (for alerts only) if true the alert will not disappear after 5 sec
         *      @ObjProp okayText :string (for popups only) text value for "okay" button in popup, default is "אשר"
         *      @ObjProp cancelText :string (for popups only) text value for "cancel" button in popup, if didn't pass cancelText, there will be no "cancel" button
         * @Prop popupCb :Function - is used only if got obj.isPopup, returnes the user's answer (in the popup there could be two buttons: "okay" (true) or "cancel" (false) )
         */
        if (typeof obj !== "object" || Array.isArray(obj)) return;
        clearTimeout(alertTO)
        const alertObj = { text: obj.text, warning: obj.warning || false, center: obj.center || false, noTimeout: obj.noTimeout || false }
        if (obj.isPopup) alertObj.isPopup = { ...obj.isPopup, popupCb, closeSelf: () => { setShowAlert(false) } }
        setShowAlert(alertObj)
        if (!obj.isPopup && !obj.noTimeout) alertTO = setTimeout(closeAlert, 3000)
    }

    const ctxValue = {
        openGenAlertSync, openGenAlert, closeAlert
    }

    return <GenAlertContext.Provider value={ctxValue} >
        {children}
        {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} center={showAlert.center} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
    </GenAlertContext.Provider>
}

// * example:
// / first of all get the context: 
// const genAlertCtx = useGenAlert()
// open an alert: (nice text at the bottom left of the screen)
// genAlertCtx.openGenAlert({ text: "user info was updated successfully" });
// open a popup: (dialog with the use)
// genAlertCtx.openGenAlert({ text: "are you sure?", isPopup: { okayText: "yes", cancelText:"no, I take that back" } });
// / and to get the user's answer add:
// / 1:
// genAlertCtx.openGenAlert({ text: "are you sure?", isPopup: { okayText: "yes", cancelText:"no, I take that back" } }, (answer) => {  } );
// / or 2:
// let answer = await genAlertCtx.openGenAlertSync({ text: "are you sure?", isPopup: { okayText: "yes", cancelText:"no, I take that back" } });

// need help? -shani 