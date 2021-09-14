import React, { useState } from "react";
import '../../consts/class_names.scss';
import './allCategories.scss'
import GenericShowUpSubmit from "../../generic-components/genericShowUpSubmit";
import { Box } from '../../generic-components/Box';
import { observer } from "mobx-react-lite";
import { somethingWentWrong } from "../../consts/consts";
import { useSuperAdminStore } from "../../stores/index.store";
import GenericRowForSA from "../../generic-components/genericRowForSA";
// import GenericShowUpSubmit from "../../generic-components/genericShowUpSubmit";
import { useGenAlert } from "../../context/generalAlertCtx";
import { useFiles } from "@hilma/fileshandler-client";
import EditPopUp from "../editPopUp";
import { categoryNameRegExp, categoryDescriptionRegExp, categoryLinkRegExp } from "../../consts/regexp";
import axios from "axios";

function AllCategories() {

    const genAlertCtx = useGenAlert();
    const filesUploader = useFiles();
    const superAdminStore = useSuperAdminStore();
    const [editPopUp, setEditPopUp] = useState(false);
    const [categoryIdToEdit, setCategoryIdToEdit] = useState("");

    const [displayShowUp, setDisplayShowUp] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [descriptionValue, setDescriptionValue] = useState("");
    const [linkValue, setLinkValue] = useState("");
    const [iconImageId, setIconImageId] = useState(-1);

    const [warningLinkText, setWarningLinkText] = useState('a');
    const [warningLink, setWarningLink] = useState(false);

    const [warningCategoryNameText, setWarningCategoryNameText] = useState('a');
    const [warningCategoryName, setWarningCategoryName] = useState(false);

    const [warningCategoryDescriptionText, setWrningCategoryDescriptionText] = useState('a');
    const [warningCategoryDescription, setWrningCategoryDescription] = useState(false);

    const [warningCategoryIconText, setWarningCategoryIconText] = useState('a');
    const [warningCategoryIcon, setWarningCategoryIcon] = useState(false);

    //to remove all the warning from the screen an once
    const setAllWariningFalse = () => {
        setWarningLink(false);
        setWarningCategoryName(false);
        setWrningCategoryDescription(false);
        setWarningCategoryIcon(false);
    }
    const resetNewCategoryData = () => {
        setInputValue('')
        setDescriptionValue('')
        setLinkValue('')
        setIconImageId(-1)
        filesUploader.deleteAll()

    }
    const handleCategoryNameClick = (categoryId, categoryName) => {
        superAdminStore.fetchSpecificCategoryQuestions(categoryId);
        superAdminStore.setCurrentCategory({ categoryName: categoryName, categoryId: categoryId });
        superAdminStore.setCurrentCategoryComponent(1)

    }
    const handleInputChange = (e) => {
        let value = e.target.value;
        setInputValue(value)
    }
    const handleDescriptionChange = (e) => {
        let value = e.target.value;
        setDescriptionValue(value)
    }
    const handleLinkchange = (e) => {
        let value = e.target.value;
        setLinkValue(value)
    }
    const handleSubmitCategory = async () => {
        //* if we want to edit a category then editmode will be true, edit mode being turned to false every time genericshowup being closed. if not edit mode regular adding
        if (editPopUp) {
            let userAcceptsUpdate = await genAlertCtx.openGenAlertSync({
                text: " את/ה עומד/ת לבצע עריכה של קטגוריה קיימת, השדות שנערכו יתעדכנו בהתאם, שדות שלא השתנו יישארו ללא שינוי, האם את/ה בטוח/ה בשינויים?",
                isPopup: { okayText: "המשך", cancelText: "חזור" }
            });
            if (!userAcceptsUpdate) return "FAILURE";
        } else {
            let userAccepts = await genAlertCtx.openGenAlertSync({
                text: "את/ה עומד/ת להוסיף קטגוריה חדשה",
                isPopup: { okayText: "המשך", cancelText: "חזור" }
            });
            if (!userAccepts) return "FAILURE";
        }
        //* we change isRequestOK to false if one of the inputs is not good and not fetching anything 
        let isRequestOK = true;
        const categoryName = inputValue.trim();
        let checkcategoryName = categoryNameRegExp.test(categoryName);
        if (!categoryName) {
            setWarningCategoryNameText('אנא הכנס את שם הקטגוריה')
            setWarningCategoryName(true)
            isRequestOK = false;
        } else if (categoryName.length > 50 || categoryName.length < 3) {
            setWarningCategoryNameText('אנא הכנס לפחות שלושה תווים ולא יותר מחמישים תווים')
            setWarningCategoryName(true)
            isRequestOK = false;
        } else if (!checkcategoryName) {
            setWarningCategoryNameText('אנא הכנס רק תווים תקינים, ללא מספרים, וללא סימנים מיוחדים')
            setWarningCategoryName(true)
            isRequestOK = false;
        } else {
            superAdminStore.categoriesAndIds.forEach(value => {
                //*we can have the same name if in edit mode
                if (value.categoryName === categoryName && !editPopUp) {
                    setWarningCategoryNameText('השם שהכנסת כבר קיים, אנא בחר שם שונה')
                    setWarningCategoryName(true)
                    isRequestOK = false;
                }
            })
        }
        if (!linkValue) {
            setWarningLinkText('אנא הכנס לינק לאתר אינטרנט')
            setWarningLink(true);
            isRequestOK = false;
        } else {
            let checkCategoryLink = categoryLinkRegExp.test(linkValue);
            if (!checkCategoryLink) {
                setWarningLinkText('אנא וודא שהלינק שהזנת כתוב בפורמט המתאים(http://, https://)')
                setWarningLink(true);
                isRequestOK = false;
            }
        }
        if (!descriptionValue) {
            setWrningCategoryDescriptionText("אנא הכנס תיאור לקטגוריה")
            setWrningCategoryDescription(true)
            isRequestOK = false;
        } else if (descriptionValue.length > 200 || descriptionValue.length <= 5) {
            setWrningCategoryDescriptionText("אנא הכנס בין חמישה למאתיים תווים")
            setWrningCategoryDescription(true)
            isRequestOK = false;
        } else {
            let checkDescriptionValue = categoryDescriptionRegExp.test(descriptionValue);
            if (!checkDescriptionValue) {
                setWrningCategoryDescriptionText(`אנא הכנס רק תווים תקינים, התווים המותרים הם:"!?,.()-${"`"}' `)
                setWrningCategoryDescription(true)
                isRequestOK = false;
            }
        }

        if (!filesUploader.nextId && !editPopUp) {
            setWarningCategoryIconText("אנא בחר אייקון")
            setWarningCategoryIcon(true)
            isRequestOK = false;
        }
        if (!isRequestOK) {
            return "FAILURE"
        }
        //*if validation on category name is okay open a text window for category description


        const data = {
            name: categoryName,
            description: descriptionValue,
            courseLink: linkValue
        }
        try {
            if (editPopUp) {
                data.categoryId = categoryIdToEdit;
                let res = await filesUploader.put("/api/admin/update-category", JSON.stringify(data));
                if (res.status === 200) {
                    superAdminStore.fetchCategoriesAndIds();
                    genAlertCtx.openGenAlert({ text: "הקטגוריה עודכנה בהצלחה" })
                    return "SUCCESS"
                }
            } else {
                let res = await filesUploader.post("/api/admin/create-category", JSON.stringify(data));
                if (res.status === 201) {
                    superAdminStore.fetchCategoriesAndIds()
                    genAlertCtx.openGenAlert({ text: "הקטגוריה התווספה בהצלחה" })
                    setDisplayShowUp(false);
                    return "SUCCESS"
                }
            }
        } catch (error) {
            genAlertCtx.openGenAlert({ text: somethingWentWrong })
            return "FAILURE"
        }
    }

    const handlePenClick = async (categoryId) => {
        try {
            let res = await axios.get(`/api/admin/specific-category/${categoryId}`);
            if (res.data && res.data.categoryDescription && res.data.categoryName && res.data.courseLink && res.data.iconPath && res.data._id) {
                let { categoryName, categoryDescription, courseLink, _id } = res.data;
                setAllWariningFalse()
                setInputValue(categoryName);
                setDescriptionValue(categoryDescription);
                setLinkValue(courseLink)
                setDisplayShowUp(true);
                setEditPopUp(true)
                setIconImageId(-1)
                setCategoryIdToEdit(_id)
            } else {
                throw Error("משהו השתבש")
            }

        } catch (error) {
            genAlertCtx.openGenAlert({ text: somethingWentWrong })
        }
    }

    //*here we check if file input has changed so we can notify the admin if his changing an exsisting image, we reseting iconimageid every time we close genericshowup
    window.onload = () => {
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.addEventListener('change', (e) => {
            setIconImageId(filesUploader.nextId)
        })
    }

    const handleIconImage = async (e) => {
        const fileInput = document.getElementById('file-input');
        //* we have an eventlistener attached to fileinput so on change of file input we add 1 to iconimageid so if it is not -1 we know he gonna change other image, we reset iconimageId in resetData()
        if (iconImageId !== -1) {
            let userAccepts = await genAlertCtx.openGenAlertSync({ text: "אתה עומד להחליף תמונה קיימת, האם להמשיך?", isPopup: { okayText: "המשך", cancelText: "ביטול" } });
            if (userAccepts) {
                fileInput.click();
            }
        } else {
            fileInput.click();
        }
    }
    const handleDeleteCategoryClick = async (id) => {
        let userAccepts = await genAlertCtx.openGenAlertSync({ text: "מחיקת הקטגוריה תוציא את השאלות מכלל שימוש בשאלונים אך הסטטיסטיקה לא תאבד, האם את/ה בטוח/ה שאת/ה רוצה למחוק קטגוריה זו?", isPopup: { okayText: "מחק", cancelText: "ביטול" } });
        if (userAccepts) {
            let res = await axios.put("/api/admin/delete-and-fetch-category", { categoryId: id })
            superAdminStore.setCategoriesAndIds(res.data)
        }
    }
    //*functin we pass to genericshowup to only close the editpopup
    const closeEditMode = () => {
        setAllWariningFalse();
        setEditPopUp(false);
    }

    const categoryNameField = { hint: true, hintText: `על שם הקטגוריה לכלול אותיות והתווים הבאים בלבד: "${"`"}'- אורך השם צריך להיות בין שלושה לחמישים תווים`, mainElemType: 'input', placeholder: "שם הקטגוריה", fieldValue: inputValue, handleFieldChange: handleInputChange, warningElem: warningCategoryName, warningElemText: warningCategoryNameText };
    const courseLinkField = { mainElemType: 'input', placeholder: "לינק לקורס מותאם", fieldValue: linkValue, handleFieldChange: handleLinkchange, warningElemText: warningLinkText, warningElem: warningLink };
    const categoryDescriptionField = { hint: true, hintText: `על תיאור הקטגוריה לכלול אותיות והתווים הבאים בלבד: "!?-,.()${"`"}' אורך השם צריך להיות בין חמישה למאתיים תווים`, mainElemType: 'textarea', placeholder: "תיאור הקטגוריה", fieldValue: descriptionValue, handleFieldChange: handleDescriptionChange, fieldId: "textarea-input", warningElemText: warningCategoryDescriptionText, warningElem: warningCategoryDescription };
    const categoryIcon = { hint: true, hintText: 'התמונה שתחבר צריכה להיות בפורמט הבא: jpg,jpeg,png. התמונה שתבחר תוצג למשתמש בסוף השאלון יחד עם שם הקטגוריה ', mainElemType: 'button', fieldValue: 'העלה אייקון', handleFieldChange: handleIconImage, fieldId: "button-icon", filesUploader: filesUploader, warningElem: warningCategoryIcon, warningElemText: warningCategoryIconText };
    const acceptOrDelete = { mainElemType: 'special', minorElemDoesExist: true, minorElemCancel: 'ביטול', minorElemAdd: 'הוסף', minorElemSubmit: handleSubmitCategory }

    const categories = superAdminStore.categoriesAndIds.map((value, index) => (
        <GenericRowForSA onTrashClick={() => { handleDeleteCategoryClick(value._id) }} onPenClick={() => { handlePenClick(value._id) }} onGeneralClick={() => { handleCategoryNameClick(value._id, value.categoryName) }} index={index} id={value._id} text={value.categoryName} key={value._id} />
    ))

    return (
        <>
            <div id="title-categories-page" className="generic-title page-title">קטגוריות</div>
            <Box id='categories-box' className="width85">
                <div className="categories-rows-container">
                    {categories}
                </div>

                {!editPopUp &&
                    <div className="generic-show-up-submit-container" onFocus={setAllWariningFalse}>
                        <GenericShowUpSubmit
                            resetData={resetNewCategoryData}
                            openShowUp={displayShowUp}
                            setOpenShowUp={setDisplayShowUp}
                            mainText="הוספת קטגוריה"
                            elementsArray={[categoryNameField, courseLinkField, categoryDescriptionField, categoryIcon, acceptOrDelete]}
                        />
                    </div>
                }

            </Box>
            {/* only visible if editPopup state is true */}
            <EditPopUp editPopUp={editPopUp} onFocus={setAllWariningFalse} genericShowUpSubmit={<GenericShowUpSubmit editMode={true} minorText="*בעת שמירה יימחקו כל הערכים אשר שונו בזמן העריכה" closeEditMode={closeEditMode} resetData={resetNewCategoryData} openShowUp={displayShowUp} setOpenShowUp={setDisplayShowUp} mainText='עריכת קטגוריה' elementsArray={[categoryNameField, courseLinkField, categoryDescriptionField, categoryIcon, acceptOrDelete]} />} />

        </>
    )
}

export default observer(AllCategories);


