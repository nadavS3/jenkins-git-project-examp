import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useFiles } from "@hilma/fileshandler-client";

import { useSuperAdminStore } from "../stores/index.store";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";

import AddQuestionImageData from "../components/addQuestion/addQuestionImageData";
import AddQuestionInfo from "../components/addQuestion/addQuestionInfo";
import Box from "../generic-components/Box";

import GenericFilter from '../generic-components/genericFilterDropDown';
import { useGenAlert } from "../context/generalAlertCtx";
import { ANSWER_STATUS, AUDIO, DEVICES, QUESTION_TYPES, REAL_QUESTIONNAIRE_ID, somethingWentWrong } from "../consts/consts";
import { checkAllMCQAnswers, checkAllPSQAnswers, filesUploaderChecker, isOverlapping } from "../consts/functions";

import "./addQuestionPage.scss";
import "../consts/class_names.scss"
import "../consts/ErrorMessages.scss";
import GenericButton from "../generic-components/genericButton";

function AddQuestionPage() {
  const superAdminStore = useSuperAdminStore();
  const genAlert = useGenAlert();
  const history = useHistory();

  const [categorySelected, setCategorySelected] = useState(superAdminStore.currentCategory.categoryName);
  const [questionInfo, setQuestionInfo] = useState({
    categoryId: superAdminStore.currentCategory.categoryId, // irrelevant for edit
    story: superAdminStore.onEditQuestionMode ? superAdminStore.editedQuestionStory : "",
    instruction: superAdminStore.onEditQuestionMode ? superAdminStore.editedQuestionInstruction : "",
    questionType: superAdminStore.onEditQuestionMode ? superAdminStore.editedQuestionType : "",
  });

  const [browserImageUrl, setBrowserImageUrl] = useState(superAdminStore.onEditQuestionMode ? superAdminStore.editedBrowserImage : "");
  const [mobileImageUrl, setMobileImageUrl] = useState(superAdminStore.onEditQuestionMode ? superAdminStore.editedMobileImage : "");
  const [audioUrl, setAudioUrl] = useState(superAdminStore.onEditQuestionMode ? superAdminStore.editedQuestionAudio : ""); // add
  const [filesIds, setFilesIds] = useState({});
  const filesUploader = useFiles();

  // for image
  const [displayImage, setDisplayImage] = useState(superAdminStore.onEditQuestionMode ? DEVICES.BROWSER : "")
  const [addAnswerType, setAddAnswerType] = useState("");
  const [allPSQAnswers, setAllPSQAnswers] = useState(superAdminStore.onEditQuestionMode ? toJS(superAdminStore.editedAnswerPositions) :
    {
      browser: { correctArray: [], incorrectArray: [] },
      mobile: { correctArray: [], incorrectArray: [] }
    });
  const [allMCQAnswers, setAllMCQAnswers] = useState(superAdminStore.onEditQuestionMode ? toJS(superAdminStore.editedQuestionMultipleChoiceAnswers) : null)
  const imgRef = useRef(null);
  const [lastBoxSize, setLastBoxSize] = useState({ width: 50, height: 50 })

  useEffect(() => {
    return () => {
      // superAdminStore.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!superAdminStore.onEditQuestionMode && questionInfo.questionType === QUESTION_TYPES.PSQ) {
      genAlert.openGenAlert({ text: "שים לב, עליך להעלות תשובות אפשריות מתאימות" }); // if MCQ changed to PSQ
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionInfo.questionType])

  useEffect(() => {
    //todo not working good , there is a lot of problems with the facr that its the same elemnt for mobile and browser
    // if (browserImageUrl.length > 0 && displayImage === DEVICES.BROWSER) checkBrowserImageDimensions()

  }, [browserImageUrl])

  useEffect(() => {
    //todo not working good , there is a lot of problems with the facr that its the same elemnt for mobile and browser
    // if (mobileImageUrl.length > 0 &&displayImage === DEVICES.MOBILE) checkMobileImageDimensions()

  }, [mobileImageUrl])
  //* need to be fixed
  // const checkBrowserImageDimensions = () => {
  //   let a = document.getElementById('img');
  //   console.log('inside browser');
  //   if (!a) return;
  //   a.onload = () => {
  //     console.log('inside browser on load');
  //     if (a.naturalWidth < 1200 || a.naturalWidth / a.naturalHeight < 1) {
  //       console.log('inside browser on load inside if');
  //       if (a.naturalWidth < 1200) {
  //         genAlert.openGenAlertSync({ text: "התמונה לדפדפן צריכה להיות ברוחב מינימלי של 1200 פיקסלים. תמונה קטנה מזו תתעוות על רוב המסכים ולכן לא ניתן להעלותה", isPopup: { okayText: "המשך" } });
  //       } else {
  //         genAlert.openGenAlertSync({ text: "התמונה לדפדפן צריכה להיות בעלת יחס הגיוני בין הרוחב לגובה, תמונה שבה היחס בין הרוחב לגובה קטן מ1 תתעוות על רוב המסכים ולכן לא ניתן להעלותה", isPopup: { okayText: "המשך" } });
  //       }
  //       setBrowserImageUrl('');
  //     }
  //     a.onload = null;
  //   }
  //   return
  // }
  //* need to be fixed
  // const checkMobileImageDimensions = () => {
  //   let elm = document.getElementById('img')
  //   console.log('inside mobile');
  //   if (!elm) return;
  //   elm.onload = () => {
  //     console.log('inside mobile on load');
  //     if (elm.naturalWidth / elm.naturalHeight > 0.75) {
  //       console.log('inside mobile on load inside if');
  //       genAlert.openGenAlertSync({ text: "התמונה לטלפון צריכה להיות תמונה בעלת גובה גדול מרוחב, כדי לשמור על מראה תקין", isPopup: { okayText: "המשך" } });
  //       setMobileImageUrl('')

  //     }
  //     elm.onload = null
  //   }
  //   return
  // }


  const handleBrowserImage = async (e) => {
    setBrowserImageUrl(e.link);
    setDisplayImage(DEVICES.BROWSER);
    setFilesIds({ ...filesIds, browserImageId: e.id });
    setAllPSQAnswers({ mobile: { ...allPSQAnswers.mobile }, browser: { correctArray: [], incorrectArray: [] } });
  };
  const handleMobileImage = async (e) => {
    setMobileImageUrl(e.link);
    setDisplayImage(DEVICES.MOBILE);
    setFilesIds({ ...filesIds, mobileImageId: e.id });
    setAllPSQAnswers({ browser: { ...allPSQAnswers.browser }, mobile: { correctArray: [], incorrectArray: [] } });
  };
  const handleAudio = (e) => {
    setAudioUrl(e.link);
    setFilesIds({ ...filesIds, audioId: e.id });
  };
  const handleCategorySelect = (optionSelected) => {
    const categoryIndex = superAdminStore.categoryNames.findIndex((catName) => catName === optionSelected);
    setCategorySelected(optionSelected);
    setQuestionInfo((questionInfo) => ({ ...questionInfo, categoryId: superAdminStore.categoryIds[categoryIndex] }));
  }

  async function submit() {
    if (superAdminStore.onEditQuestionMode) {
      const userAccepts = await genAlert.openGenAlertSync({ text: "האם את/ה בטוח/ה שברצונך להחליף את השאלה הקיימת?", isPopup: { okayText: "החלף", cancelText: "חזור" } });
      if (!userAccepts) { return }
    }

    let problems = [];

    if (questionInfo) {
      if (questionInfo.story || questionInfo.instruction) {
        if (questionInfo.story && questionInfo.story.length < 5) { problems.push("אורך סיפור הרקע קצר מדי") }
        if (questionInfo.instruction && questionInfo.instruction.length < 5) { problems.push("אורך השאלה קצר מדי") }
      }
      else { problems.push("נא להכניס סיפור רקע או שאלה") }
      if (questionInfo.questionType) {
        if (questionInfo.questionType === QUESTION_TYPES.PSQ) {
          if (allPSQAnswers) {
            if (!checkAllPSQAnswers(allPSQAnswers)) { problems.push("שגיאה בתשובות האפשריות לשאלה") }
          }
          else { problems.push("נא לבחור תשובות") }
        }
        else if (questionInfo.questionType === QUESTION_TYPES.MCQ) {
          if (!checkAllMCQAnswers(allMCQAnswers)) { problems.push("שגיאה בתשובות האפשריות לשאלה") }
        }
        else { problems.push("סוג שאלה לא נמצא") }
      }
      else { problems.push("נא לבחור סוג שאלה") }
    }
    else { // something went wrong
      genAlert.openGenAlert({ text: somethingWentWrong });
      return;
    }

    if (superAdminStore.onEditQuestionMode) {
      if (!(browserImageUrl && mobileImageUrl && audioUrl)) { problems.push("נא לבחור קבצים") }
    }
    else { // not on edit mode
      if (filesIds.browserImageId !== undefined) {
        const browserChecker = filesUploaderChecker(filesUploader.uploadedFiles, filesIds.browserImageId, 'image');
        if (!browserChecker) { problems.push("בעיה בהוספת התמונה לדפדפן") }
      }
      else { problems.push("נא להוסיף תמונה לדפדפן") }
      if (filesIds.mobileImageId !== undefined) {
        const mobileChecker = filesUploaderChecker(filesUploader.uploadedFiles, filesIds.mobileImageId, 'image');
        if (!mobileChecker) { problems.push("בעיה בהוספת התמונה למובייל") }
      }
      else { problems.push("נא להוסיף תמונה למובייל") }
      if (filesIds.audioId !== undefined) {
        const audioChecker = filesUploaderChecker(filesUploader.uploadedFiles, filesIds.audioId, 'audio');
        if (!audioChecker) { problems.push("בעיה בהוספת התיאור הקולי") }
      }
      else { problems.push("נא להוסיף תיאור קולי") }
    }

    if (categorySelected) {
      if (questionInfo.categoryId) {
        if (!superAdminStore.categoryIds.includes(questionInfo.categoryId) || !superAdminStore.categoryNames.includes(categorySelected)) { problems.push("קטגוריה לא נמצאה") }
      }
      else { problems.push("נא לבחור קטגוריה") }
    }
    else { problems.push("נא לבחור קטגוריה") }


    if (problems.length) {
      let problemsStr = "";
      problems.forEach(p => { console.log(p); problemsStr += `${p} \n` })
      genAlert.openGenAlert({ text: problemsStr, warning: true, center: true })
    } else { // no porblems
      let questionForDB = { ...questionInfo, questionNumber: superAdminStore.onEditQuestionMode ? superAdminStore.editedQuestionNumber : superAdminStore.nextQuestionNumber }
      if (questionForDB.story) { questionForDB.questionStory = questionForDB.story; delete questionForDB.story; }
      if (questionForDB.instruction) { questionForDB.questionInstruction = questionForDB.instruction; delete questionForDB.instruction; }
      if (questionInfo.questionType === QUESTION_TYPES.PSQ) {
        questionForDB.browserQuestionInfo = {
          correctPositions: allPSQAnswers.browser.correctArray,
          incorrectPositions: allPSQAnswers.browser.incorrectArray,
        }
        questionForDB.mobileQuestionInfo = {
          correctPositions: allPSQAnswers.mobile.correctArray,
          incorrectPositions: allPSQAnswers.mobile.incorrectArray,
        }
      }
      else if (questionForDB.questionType === QUESTION_TYPES.MCQ) {
        questionForDB.multipleChoiceAnswers = allMCQAnswers;
        questionForDB.multipleChoiceAnswers.map((mcqAnswer, index) => { return { ...mcqAnswer, answerId: index + 1 } })
      }

      if (superAdminStore.onEditQuestionMode) {
        const data = { questionId: superAdminStore.editedQuestionId, questionInfo: questionForDB, questionnaireId: REAL_QUESTIONNAIRE_ID, filesIds: filesIds };
        let res = await filesUploader.put("/api/questionnaire/update-question", JSON.stringify(data));
        if (res.data && res.data.success) {
          genAlert.openGenAlert({ text: "השאלה עודכנה בהצלחה" })
          superAdminStore.fetchSpecificCategoryQuestions(superAdminStore.currentCategory.categoryId);
          setTimeout(() => {
            history.push("categories");
          }, 2000)
        }
      }
      else {
        const data = { questionInfo: questionForDB, ...filesIds };
        let res = await filesUploader.post("/api/questionnaire/create-question", JSON.stringify(data));
        if (res.data && res.data.success) {
          genAlert.openGenAlert({ text: "השאלה הועלתה בהצלחה" })
          superAdminStore.fetchSpecificCategoryQuestions(superAdminStore.currentCategory.categoryId);
          setTimeout(() => {
            history.push("categories");
          }, 2000)
        }
      }
    }
  };

  const overlapsWithOthers = (newAnswer) => {
    const correctArray = displayImage === DEVICES.BROWSER ? allPSQAnswers.browser.correctArray : allPSQAnswers.mobile.correctArray;
    const incorrectArray = displayImage === DEVICES.BROWSER ? allPSQAnswers.browser.incorrectArray : allPSQAnswers.mobile.incorrectArray;
    for (let i = 0; i < correctArray.length; i++) {
      if (isOverlapping(newAnswer, correctArray[i])) {
        return true;
      }
    }
    for (let i = 0; i < incorrectArray.length; i++) {
      if (isOverlapping(newAnswer, incorrectArray[i])) {
        return true;
      }
    }
    return false;
  }

  const submitAnswer = (currentPositions) => {
    let imageWidth = imgRef.current.width;
    let imageHeight = imgRef.current.height;
    setLastBoxSize(currentPositions.size);
    const answerForDB = {
      left: currentPositions.pos.x / imageWidth,
      right: (currentPositions.pos.x + currentPositions.size.width) / imageWidth,
      top: currentPositions.pos.y / imageHeight,
      bottom: (currentPositions.pos.y + currentPositions.size.height) / imageHeight
    };
    if (overlapsWithOthers(answerForDB)) {
      genAlert.openGenAlert({ text: "המיקום שסימנת נמצא מעל למיקום קיים" })
      return;
    }
    setAllPSQAnswers(prevAllPSQAnswers => {
      let newAllPSQAnswers = { ...prevAllPSQAnswers }
      if (displayImage === DEVICES.BROWSER) {
        if (addAnswerType === ANSWER_STATUS.CORRECT) {
          return { mobile: { ...newAllPSQAnswers.mobile }, browser: { ...newAllPSQAnswers.browser, correctArray: [...prevAllPSQAnswers.browser.correctArray, answerForDB] } }
        }
        else { // answer type incorrect
          return { mobile: { ...newAllPSQAnswers.mobile }, browser: { ...newAllPSQAnswers.browser, incorrectArray: [...prevAllPSQAnswers.browser.incorrectArray, answerForDB] } }
        }
      }
      else { // mobile image
        if (addAnswerType === ANSWER_STATUS.CORRECT) {
          return { browser: { ...newAllPSQAnswers.browser }, mobile: { ...newAllPSQAnswers.mobile, correctArray: [...prevAllPSQAnswers.mobile.correctArray, answerForDB] } }
        }
        else { // answer type incorrect
          return { browser: { ...newAllPSQAnswers.browser }, mobile: { ...newAllPSQAnswers.mobile, incorrectArray: [...prevAllPSQAnswers.mobile.incorrectArray, answerForDB] } }
        }
      }
    })
    setAddAnswerType("");
  }

  const addAnswer = type => {
    const correctArray = displayImage === DEVICES.BROWSER ? allPSQAnswers.browser.correctArray : allPSQAnswers.mobile.correctArray;
    if (type === ANSWER_STATUS.CORRECT && correctArray && correctArray.length) {
      genAlert.openGenAlert({ text: "האפשרות לבחור שני מקומות נכונים אינה קיימת כרגע" })
      setAddAnswerType("");
      return;
    }
    setAddAnswerType(type);
  }
  const doneAddingAnswersForDevice = async () => {
    const userAccepts = await genAlert.openGenAlertSync({ text: "האם את/ה בטוח/ה שסיימת להעלות תשובות לשאלה זו?", isPopup: { okayText: "סיימתי", cancelText: "חזור" } });
    if (!userAccepts) { return }
    if (displayImage === DEVICES.BROWSER) {
      if (allPSQAnswers.browser.correctArray.length && allPSQAnswers.browser.incorrectArray.length) {
        setDisplayImage("");
        genAlert.openGenAlert({ text: "מיקומי התשובות הנכונות הוזנו בהצלחה" });
      }
      else { // not valid
        genAlert.openGenAlert({ text: "נא להוסיף תשובות נכונות ולא נכונות עבור התמונה" });
      }
    }
    else if (displayImage === DEVICES.MOBILE) {
      if (allPSQAnswers.mobile.correctArray.length && allPSQAnswers.mobile.incorrectArray.length) {
        setDisplayImage("");
        genAlert.openGenAlert({ text: "מיקומי התשובות הנכונות הוזנו בהצלחה" });
      }
      else { // not valid
        genAlert.openGenAlert({ text: "נא להוסיף תשובות נכונות ולא נכונות עבור התמונה" });
      }
    }
  }

  const deleteCurrentImage = async () => {
    const userAccepts = await genAlert.openGenAlertSync({ text: "האם את/ה בטוח/ה שברצונך למחוק את התמונה?", isPopup: { okayText: "מחק", cancelText: "ביטול" } });
    if (userAccepts) {
      try {
        deleteFile(displayImage, displayImage === DEVICES.BROWSER ? filesIds.browserImageId : filesIds.mobileImageId, false)
      }
      catch (err) {
        genAlert.openGenAlert({ text: somethingWentWrong });
      }
    }
  }
  const deleteFile = (fileType, fileId, toBeReplaced = false /* default false */) => {
    setFilesIds(oldFilesIds => {
      let newFilesIds = { ...oldFilesIds };
      switch (fileType) {
        case DEVICES.BROWSER:
          delete newFilesIds.browserImageId;
          break;
        case DEVICES.MOBILE:
          delete newFilesIds.mobileImageId;
          break;
        case AUDIO:
          delete newFilesIds.audioId;
          break;
        default:
          break;
      }
      return newFilesIds;
    })
    fileType === DEVICES.BROWSER && setBrowserImageUrl("");
    fileType === DEVICES.MOBILE && setMobileImageUrl("");
    if (!toBeReplaced) {
      setDisplayImage("");
    }
  }
  const finishAddingAnswers = (answers) => {
    setAllMCQAnswers(answers);
  }
  const deletePSQAnswer = async (device, answerType, answerIndex) => {
    const userAccepts = await genAlert.openGenAlertSync({ text: "האם את/ה בטוח/ה שברצונך למחוק את התשובה?", isPopup: { okayText: "מחק", cancelText: "ביטול" } });
    if (!userAccepts) { return; }

    setAllPSQAnswers((prevState) => {
      let newState = { ...prevState };
      let newArr = [...newState[device.toLowerCase()][`${answerType.toLowerCase()}Array`]];
      newArr.splice(answerIndex, 1)
      if (device === DEVICES.BROWSER) {
        if (answerType === ANSWER_STATUS.CORRECT) { return { mobile: { ...newState.mobile }, browser: { correctArray: newArr, incorrectArray: newState.browser.incorrectArray } } }
        else if (answerType === ANSWER_STATUS.INCORRECT) { return { mobile: { ...newState.mobile }, browser: { correctArray: newState.browser.correctArray, incorrectArray: newArr } } }
      }
      else if (device === DEVICES.MOBILE) {
        if (answerType === ANSWER_STATUS.CORRECT) { return { browser: { ...newState.browser }, mobile: { correctArray: newArr, incorrectArray: newState.mobile.incorrectArray } } }
        else if (answerType === ANSWER_STATUS.INCORRECT) { return { browser: { ...newState.browser }, mobile: { correctArray: newState.mobile.correctArray, incorrectArray: newArr } } }
      }
    })
  }
  const goBackToLastPage = async () => {
    if (!superAdminStore.onEditQuestionMode || somethingChanged()) {
      const userAccepts = await genAlert.openGenAlertSync({ text: superAdminStore.onEditQuestionMode ? "האם אתה בטוח שברצונך לחזור ולבטל את השינויים?" : "במידה ותחזור, פרטי השאלה לא יישמרו.", isPopup: { okayText: "חזור", cancelText: "ביטול" } });
      if (!userAccepts) { return; }
    }
    history.push("categories")
  }
  const somethingChanged = () => { // returns if something is changed
    return (questionInfo.story !== superAdminStore.editedQuestionStory ||
      questionInfo.instruction !== superAdminStore.editedQuestionInstruction ||
      questionInfo.questionType !== superAdminStore.editedQuestionType ||
      questionInfo.categoryId !== superAdminStore.currentCategory.categoryId ||
      allPSQAnswers !== superAdminStore.editedAnswerPositions ||
      allMCQAnswers !== superAdminStore.editedQuestionMultipleChoiceAnswers || filesIds.length)
  }
  return (
    <div id="add-question-page" className="width85">
      <div className="return-button-div" onClick={goBackToLastPage}>  <img id='back-arrow-btn' alt="" src="images/icons/Icon-back.svg"></img> חזור </div>
      <div id="above-box">
        <div id="question-number" className="generic-add-question-title big-title">
          {`שאלה ${superAdminStore.onEditQuestionMode ? `${superAdminStore.editedQuestionNumber} ${superAdminStore.specificQuestionInfo.SQQInnerOrder ? `חלק ${superAdminStore.specificQuestionInfo.SQQInnerOrder}` : ""}` : `חדשה - ${superAdminStore.nextQuestionNumber}`}`}
        </div> {/* for now */}
        <div id="category-and-submit">
          <div id="category-container">
            <div id="category-title" className="generic-add-question-title big-title"> קטגוריה: </div>
            <div className="generic-filter-container">
              <GenericFilter options={superAdminStore.categoryNames} selectedOption={categorySelected} handleOptionSelect={handleCategorySelect} />
            </div>
          </div>
          <GenericButton
            btnColor="blue"
            onClick={submit}
            btnText="שמור"
            btnSize="L"
          />
        </div>
      </div>
      <Box id="add-question-box" className="width85">
        <div id="add-question-form">
          <AddQuestionInfo
            filesIds={filesIds}
            questionInfo={questionInfo}
            allPSQAnswers={allPSQAnswers}
            allMCQAnswers={allMCQAnswers}
            browserImageUrl={browserImageUrl}
            mobileImageUrl={mobileImageUrl}
            audioUrl={audioUrl}
            filesUploader={filesUploader}
            displayImage={displayImage}
            setQuestionInfo={setQuestionInfo}
            handleAudio={handleAudio}
            addAnswer={addAnswer}
            doneAddingAnswersForDevice={doneAddingAnswersForDevice}
            deletePSQAnswer={deletePSQAnswer}
            setAudioUrl={setAudioUrl}
            setFilesIds={setFilesIds}
            deleteFile={deleteFile}
            finishAddingAnswers={finishAddingAnswers}
          />
          <AddQuestionImageData
            filesIds={filesIds}
            browserImageUrl={browserImageUrl}
            mobileImageUrl={mobileImageUrl}
            imgRef={imgRef}
            addAnswerType={addAnswerType}
            lastBoxSize={lastBoxSize}
            questionType={questionInfo.questionType}
            filesUploader={filesUploader}
            displayImage={displayImage}
            handleBrowserImage={handleBrowserImage}
            handleMobileImage={handleMobileImage}
            setAddAnswerType={setAddAnswerType}
            submitAnswer={submitAnswer}
            deleteCurrentImage={deleteCurrentImage}
            deleteFile={deleteFile}
            setDisplayImage={setDisplayImage}
          />
        </div>
      </Box>
    </div>
  );
}

export default observer(AddQuestionPage);