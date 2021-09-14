import React, { useState } from "react";
import './genericShowUpSubmit.scss'
import { FileInput } from '@hilma/fileshandler-client';

/** props:
 * @mainText : string (the main string that will be visible all the time)
 * @minorText (optional) :string (minor text under main text for small comments)
 * @editMode (optional) :boolean (if true that icon will change to an X )
 * @closeEditMode (optional) : cb (a cb to turn editmode to false after we close the component)
 * @openShowUp : boolean (each render the component check if (props.openShowUp && hideAddCategory === "hidden"){ setHideAddCategory('')} meant to be a way to open the component from the outside if hidden )
 *@setOpenShowUp : cb (a cb to turn openshowUp to false after we turned it to true and opened the component)
* @resetData  : cb (happens when clicking on the mainlabel icon)
* @elementsArray : an array of object each consisting of the next values
*       @elementsArrayProp mainElemType : "input" | "textarea" | "button"  | "special"
*       @elementsArrayProp placeholder (optional) : string(placeholder for element if not button)
*       @elementsArrayProp fieldValue : string (text inside mainElemType)
*       @elementsArrayProp handleFieldChange : cb 
*       @elementsArrayProp hint (optional) : boolean (declare if hint is exist, if true will add a hint icon before the element) 
*       @elementsArrayProp hintText (optional): string (if hint true this text will show ) 
*       @elementsArrayProp warningElem (optional) : boolean (if true the warningElemText will be displayed)
*       @elementsArrayProp warningElemText (optional) : string (the text here will be displayed when warningElem is true)
*       @elementsArrayProp filesUploader (optional) : filesUploader (if the mainElemType is input a filesUploader needs to be provided) 
*       @elementsArrayProp minorElemDoesExist (optional) : boolean (if true adds a minorElem next to the mainElem, needs to provide also:minorElemCancel,minorElemAdd,minorElemSubmit) 
*       @elementsArrayProp minorElemCancel (optional) : string (text in the cancel part of minorElem) 
*       @elementsArrayProp minorElemAdd (optional) : string (text in the submit part of the minorElem) 
*       @elementsArrayProp minorElemSubmit (optional) : cb (cb to be executed when clicking minorElemAdd) 
        * 
        */
function GenericShowUpSubmit(props) {
    //* when value is "hidden" all data will be hidden exept mainlabel
    const [hideAddCategory, setHideAddCategory] = useState("hidden");

    //* needed to open the component from outside , in handleClose turn to false
    if (props.openShowUp && hideAddCategory === "hidden") { setHideAddCategory('') }

    // let hintIconElem = false;
    // switch (props.hint) {
    //     case hintIconElem = <div className={`${hideAddCategory}`} id="hint-icon-container" ><img id="hint-icon" alt="" src="images/icons/QuestionMarkIcon.svg" /></div>:
    //         break;
    //     default:
    //         break;
    // }
    //* a general function to close the component, can be activated when clicking the close icon or when clicking the minorElemCancel 
    //*or when minorElemsubmit cb return success(if we update or add an element we want to return success and to close the component/popup) 
    const handleClose = () => {
        props.setOpenShowUp(false);
        props.resetData && props.resetData();
        hideAddCategory ? setHideAddCategory('') : setHideAddCategory('hidden')
        if (props.editMode) props.closeEditMode()
    }
    return (
        <>
            <div onClick={handleClose} className="outside-visible-label cursor-pointer blue"> <img id="plus-icon-img" src={`images/icons/${props.editMode ? 'Icon-cancel.svg' : 'Icon-plus.svg'}`} alt="" /> <div id="add-category-label">{props.mainText} </div></div>
            <div className="blue" id="add-category-minor-label" >{props.minorText}</div>
            {
                props.elementsArray && props.elementsArray.map((elementObj, index) =>
                    (
                        <div key={index} className={`show-up-container-${elementObj.mainElemType}  ${hideAddCategory ? 'hidden-show-up-container' : ''}`} id="show-up-container">
                            {<div className={`${hideAddCategory} ${!elementObj.hint && 'hidden'}`} id="hint-icon-container" ><img id="hint-icon" alt="" src="images/icons/QuestionMarkIcon.svg" /></div>}
                            <InputRow
                                elementObj={elementObj}
                                handleClose={handleClose}
                                hideAddCategory={hideAddCategory}
                                setHideAddCategory={setHideAddCategory}
                            />
                        </div>
                    )
                )
            }
        </>
    )
}
export default GenericShowUpSubmit;

export function InputRow(props) {
    let mainElem = false;
    //* here decide on what actual mainElement will be displayed
    switch (props.elementObj.mainElemType) {
        case 'input':
            mainElem = <div id="add-field-mainElem-container" ><input onChange={(e) => { props.elementObj.handleFieldChange(e) }} value={props.elementObj.fieldValue} className="blue add-field-mainElem" id={props.elementObj.fieldId} placeholder={props.elementObj.placeholder} ></input></div>
            break;
        case 'textarea':
            mainElem = <div id="add-field-mainElem-container" ><textarea onChange={(e) => { props.elementObj.handleFieldChange(e) }} value={props.elementObj.fieldValue} className="blue add-field-mainElem" id={props.elementObj.fieldId} placeholder={props.elementObj.placeholder} ></textarea></div>
            break;
        case 'button':
            //on fileInput we workaround the usual method because we want to notify the admin if hes changing an existing image so we do e.stopPropagation and simulate a click from the outside with a getElementById
            mainElem = <div id="add-field-mainElem-container" className="cursor-pointer" ><div className=" blue add-field-mainElem" id={props.elementObj.fieldId} onClick={(e) => props.elementObj.handleFieldChange(e)} >{props.elementObj.fieldValue}
                <FileInput id="file-input" singleUpload={true} type="image" className="files-uploader cursor-pointer" text="adsfasdf" onClick={(e) => { e.stopPropagation() }} filesUploader={props.elementObj.filesUploader} />
            </div></div>
            break;
        default:
            break;
    }
    //* deault of minor elem is false and if we recive minorElemDoesExist true we add him
    let minorElem = false;

    switch (props.elementObj.minorElemDoesExist) {
        case true:
            minorElem = <div id="add-field-minorElem"> <div onClick={() => { props.handleClose() }} className="cursor-pointer">{props.elementObj.minorElemCancel} </div> <div onClick={async () => { let res = await props.elementObj.minorElemSubmit(); res === "SUCCESS" && props.handleClose() }} className="cursor-pointer" ><b>{props.elementObj.minorElemAdd}</b> </div></div>
            break;
        case false:
            break;
        default:
            break;
    }

    let warningElem = <div className="add-category-warning-container"   ><div className={`warning ${props.elementObj.warningElem ? 'display-width' : ' hidden-width'}`} id="add-field-warning">{props.elementObj.warningElemText ? props.elementObj.warningElemText : 'hidden-text'} </div> </div>;

    let hintElem = props.elementObj.hint && <div className={`${props.hideAddCategory} ${props.elementObj.hint && 'hint-available'} hint`}>{props.elementObj.hintText && props.elementObj.hintText}</div>;

    return (
        <div id='' className={`container-add-field-hidden-row ${props.elementObj.mainElemType}-container ${props.hideAddCategory} `} >
            <div id='' className={`${props.elementObj.visibleOnlyMode ? 'visible-only' : ''} ${props.elementObj.mainElemType} blue add-field-hidden-row`}> {mainElem && mainElem}{minorElem && minorElem} </div>
            {warningElem}
            {hintElem}
        </div>

    )
}