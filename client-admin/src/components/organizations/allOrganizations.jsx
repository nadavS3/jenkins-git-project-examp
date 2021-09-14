import React, { useMemo, useState } from "react";
import '../../consts/class_names.scss';
import './allOrganizations.scss'
import { Box } from '../../generic-components/Box';
import { observer } from "mobx-react-lite";
import { useSuperAdminStore } from "../../stores/index.store";
import GenericRowForSA from "../../generic-components/genericRowForSA";
import { useGenAlert } from "../../context/generalAlertCtx";
import GenericShowUpSubmit from "../../generic-components/genericShowUpSubmit";
import { emailRegexp, organizationRegExp, passwordRegExp } from "../../consts/regexp";
import EditPopUp from "../editPopUp";
import axios from "axios";
function AllOrganizations(props) {

    const superAdminStore = useSuperAdminStore()
    const genAlertCtx = useGenAlert();

    const [displayShowUp, setDisplayShowUp] = useState(false);
    const [editPopUp, setEditPopUp] = useState(false);

    const [organizationIdToEdit, setOrganizationIdToEdit] = useState("");

    const [organizationName, setOrganizationName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");

    const [organizationNameWarning, setOrganizationNameWarning] = useState('');
    const [organizationNameWarningText, setOrganizationNameWarningText] = useState(null);

    const [adminEmailWarning, setAdminEmailWarning] = useState('');
    const [adminEmailWarningText, setAdminEmailWarningText] = useState(null);

    const [adminPasswordWarning, setAdminPasswordWarning] = useState('');
    const [adminPasswordWarningText, setAdminPasswordWarningText] = useState(null);

    const resetData = () => {
        setOrganizationName('')
        setAdminEmail('')
        setAdminPassword('')
        setOrganizationIdToEdit('')
    }

    const setAllwariningFalse = () => {
        setOrganizationNameWarning(false)
        setAdminEmailWarning(false)
        setAdminPasswordWarning(false)
    }
    const deleteOrganization = async (id) => {
        let userAccepts = await genAlertCtx.openGenAlertSync({ text: "האם את/ה בטוח/ה שברצונך למחוק את הארגון?", isPopup: { okayText: "מחק", cancelText: "ביטול" } });
        if (userAccepts) {
            await superAdminStore.deleteOrganizationAndFetch(id);
        }
    }
    const handleOrganizationName = e => {
        if (organizationNameWarning) {
            setOrganizationNameWarning(null);
        }
        typeof e === "object" ? setOrganizationName(e.target.value) : setOrganizationName(e)
    }
    const handleAdminEmail = e => {
        if (adminEmailWarning) {
            setAdminPasswordWarning(null);
        }
        typeof e === "object" ? setAdminEmail(e.target.value) : setAdminEmail(e)
    }
    const handleAdminPassword = e => {
        if (adminPasswordWarning) {
            setAdminPasswordWarning(null);
        }
        typeof e === "object" ? setAdminPassword(e.target.value) : setAdminPassword(e)
    }
    const handleOrganizationClick = async (organizationId) => {
        let res = await axios.get(`/api/organization/specific-organization/${organizationId}`)
        handleOrganizationName(res.data.organizationName);
        if (editPopUp) setEditPopUp(false);
        setDisplayShowUp(true);
        setAdminEmail('')
        setAdminPassword('')
    }
    const addOrganization = async () => {
        let isRequestOkay = true;
        const checkOrganization = organizationRegExp.test(organizationName);
        const checkEmail = emailRegexp.test(adminEmail);
        const checkPassword = passwordRegExp.test(adminPassword);
        if (!organizationName) {
            setOrganizationNameWarningText("אנא הכנס שם ארגון")
            setOrganizationNameWarning(true)
            isRequestOkay = false
        } else if (organizationName.length > 100 || organizationName.length < 3) {
            setOrganizationNameWarningText("שם הארגון צריך להכיל בין שלוש למאה תווים")
            setOrganizationNameWarning(true)
            isRequestOkay = false

        } else if (!checkOrganization) {
            setOrganizationNameWarningText("נא להכניס שם ארגון תקין")
            setOrganizationNameWarning(true)
            isRequestOkay = false
        }

        //* in edit mode those values wont change whatsoever
        if (!editPopUp) {
            if (!adminEmail) {
                setAdminEmailWarningText("אנא הכנס כתובת מייל")
                setAdminEmailWarning(true)
                isRequestOkay = false
            } else if (!checkEmail) {
                setAdminEmailWarningText("נא להכניס כתובת מייל תקינה")
                setAdminEmailWarning(true)
                isRequestOkay = false
            }
            if (!adminPassword) {
                setAdminPasswordWarningText("אנא הכנס סיסמא")
                setAdminPasswordWarning(true)
                isRequestOkay = false
            } else if (!checkPassword) {
                setAdminPasswordWarningText("הסיסמה צריכה להיות באורך של לפחות שמונה תווים ולכלול אותיות קטנות וגדולות באנגלית, סימן מיוחד, ומספרים")
                setAdminPasswordWarning(true)
                isRequestOkay = false
            }
        }
        if (!isRequestOkay) {
            return "FAILURE"
        }

        if (editPopUp) {
            let userAcceptsUpdate = await genAlertCtx.openGenAlertSync({ text: " את/ה עומד/ת לבצע עריכה של ארגון קיים, השדות שנערכו יתעדכנו בהתאם, שדות שלא השתנו יישארו ללא שינוי, האם את/ה בטוח/ה בשינויים?", isPopup: { okayText: "המשך", cancelText: "חזור" } });
            if (!userAcceptsUpdate) return "FAILURE";
        } else {
            let userAccepts = await genAlertCtx.openGenAlertSync({ text: "את/ה עומד/ת להוסיף ארגון חדש", isPopup: { okayText: "המשך", cancelText: "חזור" } });
            if (!userAccepts) return "FAILURE";
        }
        if (editPopUp) {
            let res = await superAdminStore.updateOrganizationAndAdmin(organizationIdToEdit, organizationName);
            if (res === "SUCCESS") {
                genAlertCtx.openGenAlert({ text: "הארגון עודכן בהצלחה" })
                return "SUCCESS"
            }
            genAlertCtx.openGenAlert({ text: "עדכון ארגון נכשלה", warning: true })
            return
        } else {
            let res = await superAdminStore.addNewOrganizationAndAdmin(organizationName, adminEmail, adminPassword);
            if (res === "SUCCESS") {
                genAlertCtx.openGenAlert({ text: "הארגון נוצר בהצלחה" })
                return "SUCCESS"
            }
            genAlertCtx.openGenAlert({ text: "הוספת ארגון נכשלה", warning: true })
            return
        }
    }
    const closeEditMode = () => {
        setAllwariningFalse();
        setEditPopUp(false);
    }
    const handlePenClick = async (organizationId) => {
        try {
            let res = await axios.get(`/api/organization/specific-organization-admin/${organizationId}`);
            if (!res.data._id || !res.data.organizationName || !res.data.email) { throw Error('bad response') }
            handleOrganizationName(res.data.organizationName);
            setEditPopUp(true)
            setAllwariningFalse()
            setAdminEmail(res.data.email)
            setOrganizationIdToEdit(res.data._id)
            setDisplayShowUp(true);

        } catch (error) {
            genAlertCtx.openGenAlert({ text: "לא ניתן לערוך ארגון שאין לו מנהל" })
        }
    }
    const organizations = useMemo(() => superAdminStore.organizationsAndIds.map((value, index) => (
        <GenericRowForSA index={index} onPenClick={() => { handlePenClick(value._id) }} onGeneralClick={() => { handleOrganizationClick(value._id) }} id={value._id} text={value.organizationName} key={value._id} onTrashClick={() => deleteOrganization(value._id)} />
        // eslint-disable-next-line react-hooks/exhaustive-deps
    )), [superAdminStore.organizationsAndIds])

    const organizationNameField = useMemo(() => ({
        mainElemType: 'input',
        placeholder: "שם הארגון",
        fieldValue: organizationName,
        warningElem: organizationNameWarning,
        warningElemText: organizationNameWarningText,
        handleFieldChange: handleOrganizationName
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [organizationName, organizationNameWarning, organizationNameWarningText]);

    const emailField = useMemo(() => ({
        visibleOnlyMode: editPopUp,
        mainElemType: 'input',
        placeholder: "דואר אלקטרוני של המנהל",
        fieldValue: adminEmail,
        warningElem: adminEmailWarning,
        warningElemText: adminEmailWarningText,
        handleFieldChange: handleAdminEmail
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [editPopUp, adminEmail, adminEmailWarning, adminEmailWarningText]);

    const passwordField = useMemo(() => ({
        visibleOnlyMode: editPopUp,
        mainElemType: 'input',
        placeholder: "סיסמה",
        fieldValue: adminPassword,
        warningElem: adminPasswordWarning,
        warningElemText: adminPasswordWarningText,
        handleFieldChange: handleAdminPassword
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [editPopUp, adminPassword, adminPasswordWarning, adminPasswordWarningText]);

    const acceptOrDelete = useMemo(() => ({
        mainElemType: 'special',
        minorElemDoesExist: true,
        minorElemCancel: 'ביטול',
        minorElemAdd: 'הוסף',
        minorElemSubmit: addOrganization
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

    return (
        <>
            <div id="title-organizations-page" className="generic-title page-title">ארגונים</div>
            <Box id='organizations-box' className="width85">
                <div className="organizations-rows-container">
                    {organizations}
                </div>
                {!editPopUp &&
                    <div className="generic-show-up-submit-container" onFocus={setAllwariningFalse} >
                        <GenericShowUpSubmit
                        resetData={resetData}
                        setOpenShowUp={setDisplayShowUp}
                        openShowUp={displayShowUp}
                        mainText="הוספת ארגון"
                        elementsArray={[organizationNameField, emailField, passwordField, acceptOrDelete]}
                        />
                    </div>
                }
            </Box>
            {/* only visible if editPopup state is true */}
            <EditPopUp onFocus={setAllwariningFalse} editPopUp={editPopUp} genericShowUpSubmit={<GenericShowUpSubmit closeEditMode={closeEditMode} editMode={true} minorText="*בעת שמירה יימחקו כל הערכים אשר שונו בזמן העריכה" resetData={resetData} setOpenShowUp={setDisplayShowUp} openShowUp={displayShowUp} mainText="עריכת ארגון" elementsArray={[organizationNameField, emailField, passwordField, acceptOrDelete]} />} />

        </>
    )
}

export default observer(AllOrganizations);