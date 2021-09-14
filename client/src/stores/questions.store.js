import { action, computed, makeObservable, observable, reaction } from "mobx";
import { AsyncTools } from "@hilma/tools";
import Axios from "axios";
import { ANSWER_STATUS, NO_MORE_QUESTIONS_MESSAGE, POP_UP_MESSAGE_PROBLEM, audioImgSrcs, DEVICES, QUESTION_TYPES } from "../consts/consts";
import { OUR_COOKIE, getCookie } from "../consts/cookies";
import { isMobileOnly } from "react-device-detect";

export class QuestionsStore {
  totalNumberOfQuestions = 0;

  answeredQuestions = 0;

  menuInfo = [];

  currentQuestionInfoObs = {
    questionInstruction: "",
    questionStory: "",
    questionNumber: 0,
    questionImageUrl: "",
    questionAudioUrl: "",
    questionId: "",
    questionType: "",
    questionCategory: {},
    questionAudio: new Audio(""),
    SQQInnerOrder: 0
  }

  questionTimer = null;

  progressBar = 0

  fadeOut = "";
  fadeIn = "fade-in";
  questionsToReview = [];
  imageLoaded = false;

  audioImg = {
    src: audioImgSrcs.first,
    classes: ""
  }

  cameToResultsFromReview = false; // used in QuestionProgressBar, in goToNextQuestion()

  // for mobile question info
  mobileQuestion = {
    displayStory: false,
  }

  canUserClickClass = "disable-click";
  reviewMode = false;

  mobileMCQVisible = false;

  imageContainerWidth = 0;

  autoPlayAudio = true;

  reviewShowCorrect = false;

  sqqArray = [];
  imagePathsObj = {};

  constructor() {
    makeObservable(this, {
      mobileMCQVisible: observable,
      imageContainerWidth: observable,
      fadeIn: observable,
      imageLoaded: observable,
      fadeOut: observable,
      progressBar: observable,
      autoPlayAudio: observable,
      questionTimer: observable,

      currentQuestionInfoObs: observable,
      totalNumberOfQuestions: observable,
      menuInfo: observable,
      answeredQuestions: observable,
      questionsToReview: observable,
      audioImg: observable,

      mobileQuestion: observable,

      canUserClickClass: observable,
      reviewMode: observable,
      reviewShowCorrect: observable,
      cameToResultsFromReview: observable,
      sqqArray: observable,
      imagePathsObj: observable,

      setAnsweredQuestions: action,
      setCurrentQuestionInfo: action,
      getInitialQuestionnaireInfo: action,
      fetchMenuInfo: action,
      postAnswerAndGetNextQuestion: action,

      setImageLoaded: action,
      setMenuInfo: action,
      setTotalNumberOfQuestions: action,
      getQuestionsReview: action,
      setQuestionsToReview: action,
      setFadeOut: action,
      setFadeIn: action,
      playQuestionAudio: action,
      stopQuestionAudio: action,
      audioImgFadeIn: action,

      resetReviewAndGoBack: action,
      setImageContainerWidth: action,
      setDisplayStory: action,
      setCanUserClickClass: action,
      setReviewMode: action,
      setMobileMCQVisible: action,
      dropDragElemToAnswer: action,
      setAutoPlayAudio: action,
      resetDDQ: action,
      resetDDQToInitial: action,
      setDDQQuestionReviewToCorrect: action,
      setDDQQuestionReviewToIncorrect: action,
      setReviewShowCorrect: action,
      setSqqArray: action,
      setImagePathsObj: action,

      currentQuestionInfo: computed,
      progressBarWidth: computed,
      getCorrectPositions: computed,
      getSkippedQuestions: computed,
      getIncorrectPlaces: computed,
      getLastUnanswerdQuestion: computed,
      getAudioImgSrc: computed,
      getAudioImgClasses: computed,
      getDDQElements: computed,
      getDDQDragElements: computed,
      getIsDdqResetButtonNeeded: computed,
      getIsDdqContinueButtonNeeded: computed,
      getCheckIfDDQCorrect: computed,
      getDDQUserAnswerIndexArr: computed,

      isMCQQuestion: computed,
      getDisplayStory: computed,
      onReviewMode: computed,
    });

    reaction(() => this.currentQuestionInfoObs, (value, prevValue) => { // start timer when new question
      if (value) {
        this.startQuestionTimer();
        if (isMobileOnly) {
          this.setDisplayStory(true);
        }
        // const { SQQInnerOrder } = this.currentQuestionInfo;
        // if (!this.onReviewMode && this.autoPlayAudio && (!SQQInnerOrder || SQQInnerOrder === 1)) {
        //   this.playQuestionAudio();
        // }
      }
    })
  }


  startQuestionTimer() {
    this.questionTimer = Date.now();
  }
  get getQuestionTimer() {
    return this.questionTimer;
  }
  setMenuInfo(value) {
    this.menuInfo = value;
  }
  setMobileMCQVisible(bool) {
    this.mobileMCQVisible = bool
  }
  setFadeIn(value) {
    this.fadeIn = value;
  }
  setFadeOut(value) {
    this.fadeOut = value;
  }
  setImageContainerWidth(value) {
    this.imageContainerWidth = value
  }
  setTotalNumberOfQuestions(value) {
    this.totalNumberOfQuestions = value;
  }

  setAnsweredQuestions(value) {
    this.answeredQuestions = value;
  }
  setImageLoaded = (value) => {
    this.imageLoaded = value;
  }
  setQuestionsToReview(questionsToReview) {
    this.questionsToReview = questionsToReview;
  }
  playQuestionAudio = () => {
    if (this.currentQuestionInfoObs.questionAudio.paused) {
      this.audioImg.classes = "audio-img-out";
      if (this.currentQuestionInfoObs.questionAudio.played.length === 0) {
        window.gtag(
          "event",
          `question_${this.currentQuestionInfo.questionNumber}_audio_play`,
          { event_category: "question_audio_play", event_label: "Counts question desc audio plays" }
        )
      }
      this.currentQuestionInfoObs.questionAudio.play();
      setTimeout(() => this.audioImgFadeIn(audioImgSrcs.pause, "audio-img-in"), 1000)
    }
    else { // paused by click
      if (this.currentQuestionInfoObs.questionAudio.played.end(0) !== this.currentQuestionInfoObs.questionAudio.duration) { // user manually paused first audio play
        this.setAutoPlayAudio(false);
      }
      this.audioImg.classes = "audio-img-out";
      this.currentQuestionInfoObs.questionAudio.pause();
      setTimeout(() => this.audioImgFadeIn(audioImgSrcs.first, "audio-img-in"), 1000)
    }
  }
  stopQuestionAudio = () => {
    this.currentQuestionInfoObs.questionAudio.pause();
    this.audioImg.src = audioImgSrcs.first;
  }
  audioImgFadeIn = (src, classes) => {
    this.audioImg.src = src;
    this.audioImg.classes = classes;
  }
  setDisplayStory = (bool) => {
    this.mobileQuestion.displayStory = bool;
  }
  setCanUserClickClass = (str) => {
    this.canUserClickClass = str;
  }
  setReviewMode = (bool) => {
    this.reviewMode = bool;
  }
  setAutoPlayAudio(bool) {
    this.autoPlayAudio = bool;
  }
  setReviewShowCorrect(bool) {
    this.reviewShowCorrect = bool;
  }
  setSqqArray(questionsArray) {
    this.sqqArray = questionsArray;
  }
  setImagePathsObj(imagePathsArray) {
    let obj = {};
    imagePathsArray.forEach(p => {
      obj[p] = new Image();
      obj[p].src = p;
    })
    this.imagePathsObj = obj;
  }
  get currentQuestionInfo() {
    let cQInfo = this.currentQuestionInfoObs;
    return cQInfo;
  }
  get isMCQQuestion() {
    let cQInfo = this.currentQuestionInfoObs;
    return (cQInfo.questionType === QUESTION_TYPES.MCQ);
  }
  get onReviewMode() {
    return this.reviewMode;
  }
  get getDisplayStory() {
    return this.mobileQuestion.displayStory;
  }
  get progressBarWidth() {
    return (((this.answeredQuestions) / this.totalNumberOfQuestions) * 100);
  }
  get getCorrectPositions() {
    if (this.currentQuestionInfoObs.questionCorrectPositions) {
      return this.currentQuestionInfoObs.questionCorrectPositions[0];
    }
    return null;
  }
  get getLastUnanswerdQuestion() {
    for (let i = 0; i < this.menuInfo.length; i++) {
      if (this.menuInfo[i].answerStatus === ANSWER_STATUS.UNANSWERED) {

        return this.menuInfo[i].questionNumber
      }
    }
    return null;
  }

  get getDDQElements() {
    if (this.currentQuestionInfoObs.draggingQuestionPositions && this.currentQuestionInfoObs.draggingQuestionPositions.length > 0) {
      let ddqPositionsArray = [];
      this.currentQuestionInfoObs.draggingQuestionPositions.forEach((positions, index) => {
        let ddqElem = {
          ...positions,
          answerPositions: {
            top: (positions.top * 100) + "%",
            left: (positions.left * 100) + "%",
            height: ((positions.bottom - positions.top) * 100) + "%",
            width: ((positions.right - positions.left) * 100) + "%"
          },
        }
        ddqPositionsArray.push(ddqElem)
      })
      return ddqPositionsArray;
    }
    return null;
  }
  get getCorrectPlace() { // for showing correct place after answering
    if (this.currentQuestionInfoObs.questionCorrectPositions && this.currentQuestionInfoObs.questionCorrectPositions.length > 0) {
      const correctPositions = this.currentQuestionInfoObs.questionCorrectPositions[0];
      return {
        top: (correctPositions.top * 100) + "%",
        left: (correctPositions.left * 100) + "%",
        height: ((correctPositions.bottom - correctPositions.top) * 100) + "%",
        width: ((correctPositions.right - correctPositions.left) * 100) + "%"
      }
    }
    return null;
  }
  get getIncorrectPlaces() { // get all wrong answers, with index
    if (this.currentQuestionInfoObs.questionIncorrectPositions && this.currentQuestionInfoObs.questionIncorrectPositions.length > 0) {
      let incorrectArray = [];
      this.currentQuestionInfoObs.questionIncorrectPositions.forEach((positions, index) => {
        incorrectArray.push({
          answerPositions: {
            top: (positions.top * 100) + "%",
            left: (positions.left * 100) + "%",
            height: ((positions.bottom - positions.top) * 100) + "%",
            width: ((positions.right - positions.left) * 100) + "%"
          },
          answerIndex: index
        })
      })
      return incorrectArray;
    }
    return null;
  }
  get getSkippedQuestions() {
    if (this.menuInfo && this.menuInfo.length > 0) {
      let skippedArray = [];
      this.menuInfo.forEach((question) => {
        if (question.answerStatus === ANSWER_STATUS.SKIPPED) {
          skippedArray.push(question);
        }
      })
      return skippedArray;
    }
    return null;
  }
  get getAudioImgSrc() {
    return this.audioImg.src;
  }
  get getAudioImgClasses() {
    return this.audioImg.classes;
  }

  get getDDQDragElements() {
    if (this.currentQuestionInfoObs.questionType === QUESTION_TYPES.DDQ) {
      return this.currentQuestionInfoObs.draggingQuestionPositions
    } else return null;
  }

  get getIsDdqResetButtonNeeded() {
    if (this.currentQuestionInfoObs.questionType === QUESTION_TYPES.DDQ && !this.onReviewMode) {
      return !!(this.currentQuestionInfoObs.draggingQuestionPositions.find(ddqElem => ddqElem.userAnswerIndex > -1))
    } else return false;
  }

  get getIsDdqContinueButtonNeeded() {
    if (this.onReviewMode) {
      return false
    }
    if (this.currentQuestionInfoObs.questionType === QUESTION_TYPES.DDQ) {
      return !(this.currentQuestionInfoObs.draggingQuestionPositions.find(ddqElem => ddqElem.userAnswerIndex <= -1))
    } else return false;
  }

  get getCheckIfDDQCorrect() {
    if (this.currentQuestionInfoObs.questionType === QUESTION_TYPES.DDQ) {
      return !(this.currentQuestionInfoObs.draggingQuestionPositions.find((ddq, index) => ddq.userAnswerIndex !== index))
    } else throw Error("question type is not accepted")
  }

  get getDDQUserAnswerIndexArr() {
    if (this.currentQuestionInfoObs.questionType === QUESTION_TYPES.DDQ) {
      return this.currentQuestionInfoObs.draggingQuestionPositions.map(ddq => ddq.userAnswerIndex)
    } else throw Error("question type is not accepted")
  }

  setDDQQuestionReviewToCorrect() {
    if (this.currentQuestionInfoObs.questionType === QUESTION_TYPES.DDQ && this.onReviewMode) {

      this.currentQuestionInfoObs.draggingQuestionPositions = this.currentQuestionInfoObs.draggingQuestionPositions.map((ddq, index) => {
        if (ddq.userAnswerIndex === index) { return { ...ddq }; }
        else {
          return { ...ddq, userAnswerIndexIncorrect: ddq.userAnswerIndex, userAnswerIndex: index };
        }

      });
    }
  }

  setDDQQuestionReviewToIncorrect() {
    if (this.currentQuestionInfoObs.questionType === QUESTION_TYPES.DDQ && this.onReviewMode) {
      this.currentQuestionInfoObs.draggingQuestionPositions = this.currentQuestionInfoObs.draggingQuestionPositions.map((ddq, index) => {
        if (!("userAnswerIndexIncorrect" in ddq)) return { ...ddq }
        return { ...ddq, userAnswerIndex: ddq.userAnswerIndexIncorrect };
      });
    }
  }
  //WHEN: if user click the reset button
  //FLOW:reset all the ddqElement.userAnswerIndex to -1     so when we map through them and see its -1 we know its not in any of the droppable squares
  resetDDQ() {
    if (this.currentQuestionInfoObs.questionType === QUESTION_TYPES.DDQ) {
      this.currentQuestionInfoObs.draggingQuestionPositions = this.currentQuestionInfoObs.draggingQuestionPositions.map(ddq => {
        const pos = ddq.userAnswerIndex === -2 ? -2 : -1;
        return { ...ddq, userAnswerIndex: pos };
      });
    }
  }

  //*WHEN: happens after a drop has occurred in DDQ
  //*INPUT: dragElemIndex = the actual element place in the arr of draggingQuestionPositions.   ddqPointTo = to which square this element we found with dragElemIndex should refer to 
  //*FLOW: we first check if ddq, then we take the draggingQuestionPositions arr and reassign it to itself with a map, inside the  map for each element, if 
  //*userAnswerIndex equal to the argument ddqPointTo that means we are dropping and element to a certain square and some other element already pointing there
  //* so if ddq.userAnswerIndex===ddqPointTo we change ddq.userAnswerIndex to -1 so he will return to the sideMenuInfo component and then we point our wanted element (which again, is the draggingQuestionPositions[dragElemIndex]) to the index of the square we dropped it to
  //*OUTPUT:none
  dropDragElemToAnswer(dragElemIndex, ddqPointTo) {
    if (this.currentQuestionInfoObs.questionType === QUESTION_TYPES.DDQ) {
      this.currentQuestionInfoObs.draggingQuestionPositions = this.currentQuestionInfoObs.draggingQuestionPositions.map(ddq => {
        if (ddq.userAnswerIndex === ddqPointTo) { ddq.userAnswerIndex = -1; }
        return ddq
      })
      this.currentQuestionInfoObs.draggingQuestionPositions[dragElemIndex].userAnswerIndex = ddqPointTo;
    }
  }

  resetDDQToInitial() {
    if (this.currentQuestionInfoObs.questionType === QUESTION_TYPES.DDQ) {
      this.currentQuestionInfoObs.draggingQuestionPositions = this.currentQuestionInfoObs.draggingQuestionPositions.map(ddq => {
        const pos = ddq.userAnswerIndex === -1 ? -2 : ddq.userAnswerIndex;
        return { ...ddq, userAnswerIndex: pos };
      });
    }
  }

  resetReviewAndGoBack() {
    if (this.onReviewMode) {
      this.resetReviewMode();
    } else throw Error("not on review mode, cant reset")
  }

  setCurrentQuestionInfo(newQuestionInfo, isFromMenu) {

    if (this.currentQuestionInfoObs && this.currentQuestionInfoObs.questionAudio) { this.stopQuestionAudio(); }
    if (newQuestionInfo !== NO_MORE_QUESTIONS_MESSAGE) {
      const { questionInstruction, questionStory, correctPositions, incorrectPositions, imagePaths, audioPath, questionType, _id, questionNumber, multipleChoiceAnswers, multipleChoiceAnswerId, ddqPositions, SQQInnerOrder } = newQuestionInfo;
      this.currentQuestionInfoObs = {
        SQQInnerOrder: SQQInnerOrder,
        questionInstruction: questionInstruction,
        questionStory: questionStory,
        questionImageUrl: imagePaths[0], // for now // todo imagePaths
        questionAudioUrl: audioPath,
        questionId: _id,
        questionType: questionType,
        questionNumber: questionNumber,
        questionAudio: new Audio(audioPath),
      }
      if (questionType === QUESTION_TYPES.PSQ) {
        this.currentQuestionInfoObs.questionCorrectPositions = correctPositions;
        this.currentQuestionInfoObs.questionIncorrectPositions = incorrectPositions || [];
      } else if (questionType === QUESTION_TYPES.MCQ) {
        this.currentQuestionInfoObs.multipleChoiceAnswers = multipleChoiceAnswers;
        if (multipleChoiceAnswerId) { this.currentQuestionInfoObs.multipleChoiceAnswerId = multipleChoiceAnswerId }
      } else if (questionType === QUESTION_TYPES.DDQ) {
        //*DDQ EXPLAINED
        //* here we add userAnswerIndex property to the ddq elem, its represents on which answer its reside, if the value is -1 (default) then its not inside any droppable square and needs to be
        //* in the sideMenuInfo component. a bit confusing is that each element here has label|imagePath and positions and when we render the drop squares we take only the positions and in Menu component we take only the label|imagePath
        //* and then we decide where this label|imagePath will show via userAnswerIndex.  EXAMPLE: we have 3 elements in the arr : top , right , left (in that order, each has different position and label|imagePath) so maybe top has label:"food" and after 
        //* a drag and drop of label "food" to square right(whos index is 2) userAnswerIndex is 2 so now the value of top elem is presented on the left square
        //* if on review mode we already have the userAnswerIndex positions set up to the userAnswers
        this.onReviewMode ?
          this.currentQuestionInfoObs.draggingQuestionPositions = ddqPositions
          :
          this.currentQuestionInfoObs.draggingQuestionPositions = ddqPositions.map(ddq => { return { ...ddq, userAnswerIndex: -2 } });

      }
      this.currentQuestionInfoObs.questionAudio.onended = action(() => {
        this.audioImg.classes = "audio-img-out";
        setTimeout(() => this.audioImgFadeIn(audioImgSrcs.first, "audio-img-in"), 1000)
      })
      if (!isFromMenu && !this.onReviewMode) { // todo fix -> when coming from menu to SQQ
        this.setAnsweredQuestions(questionNumber);
      }
    }
    else {
      this.currentQuestionInfoObs = null;
      this.displayCategoryPage = false;
    }
  }

  async fetchMenuInfo() {
    if (getCookie(OUR_COOKIE)) {
      // todo something
    } // cookies already exist
    else {
      const [err, res] = await AsyncTools.to(Axios.get("/api/questionnaire/menu-info"));
      if (res) {
        this.setMenuInfo(res.data)
      } else {
        console.log("fail   ", err);
      }
    }
  }

  /**
   * 
   * @param {*} questionId 
   * @param {*} resetAnsweredQuestion detects whether to make all this question's answers SKIPPED because the user wanted to go back to this question 
   * @returns 
   */
  async fetchQuestionById(questionId, qNumberToFetch) { //* fetching by questionNumber right now
    if (getCookie(OUR_COOKIE)) {
      // todo something
    } // cookies already exist
    else {
      const [err, res] = await AsyncTools.to(Axios.get(`/api/questionnaire/fetch-by-id/${qNumberToFetch}?device=${isMobileOnly ? DEVICES.MOBILE : DEVICES.BROWSER}&qNumber=${this.currentQuestionInfo?.questionNumber}&currentQId=${this.currentQuestionInfo?.questionId}`));
      if (res) {
        if (Array.isArray(res.data)) {
          let sqqQueue = res.data;
          const firstQ = sqqQueue.shift();
          this.setSqqArray(sqqQueue);
          this.setCurrentQuestionInfo(firstQ, true);
        } else {
          this.setSqqArray([]);
          this.setCurrentQuestionInfo(res.data);
        }
        return true;
      } else {
        console.log("fail ", err);
        return false;
      }
    }
  }

  async getInitialQuestionnaireInfo() { // get total num of questions and first question + // ? menu info
    if (getCookie(OUR_COOKIE)) {
      this.setCurrentQuestionInfo(NO_MORE_QUESTIONS_MESSAGE)
      // todo something
    } // cookies already exist
    else {

      let [err, res] = await AsyncTools.to(Axios.get(`/api/questionnaire/initial-questionnaire-info?device=${isMobileOnly ? DEVICES.MOBILE : DEVICES.BROWSER}`, { headers: { 'Cache-Control': 'no-cache' } }));
      if (res) {
        this.setTotalNumberOfQuestions(res.data.totalQuestions);
        this.setImagePathsObj(res.data.allQuestionsImagePaths)
        if (res.data.sqqQuestionsArr) {
          let sqqQueue = res.data.sqqQuestionsArr;
          const firstQ = sqqQueue.shift();
          this.setSqqArray(sqqQueue);
          this.setCurrentQuestionInfo(firstQ);
        }
        else if (res.data.nextQuestionInfo) {
          this.setSqqArray([]);
          this.setCurrentQuestionInfo(res.data.nextQuestionInfo);
        }
      }
      else {
        if (err.response.status === 500) { let errMessage = POP_UP_MESSAGE_PROBLEM; throw errMessage }
        throw new Error(err)
      }
    }
  }

  async postAnswerAndGetNextQuestion(userAnswer) {
    if (getCookie(OUR_COOKIE)) {
      // todo something
    } // cookies already exist
    else {
      if (this.menuInfo.length > 0) { // changing answer status of answered question
        this.menuInfo.forEach(question => {
          if (question._id === userAnswer.questionId) {
            question.answerStatus = userAnswer.answerStatus;
          }
        })
      }
    }

    let onlyPostUserAnswer = (this.sqqArray.length && userAnswer.answerStatus === ANSWER_STATUS.CORRECT)
    const [err, res] = await AsyncTools.to(Axios.post(`/api/userAnswer/post-answer-and-get-question`, { userAnswer: userAnswer, onlyPostUserAnswer: onlyPostUserAnswer }));
    if (onlyPostUserAnswer) {
      const newQuestion = this.sqqArray.shift();
      this.setCurrentQuestionInfo(newQuestion);
    }
    else if (res) {
      if (res.data.sqqQuestionsArr || res.data.newQuestion) {
        if (res.data.sqqQuestionsArr) {
          let sqqQueue = res.data.sqqQuestionsArr;
          const firstQ = sqqQueue.shift();
          this.setSqqArray(sqqQueue);
          this.setCurrentQuestionInfo(firstQ);
        }
        else if (res.data.newQuestion) {
          this.setSqqArray([]);
          this.setCurrentQuestionInfo(res.data.newQuestion);
        }
      }

    } else {
      let errMessage;
      if (!err) { errMessage = "אין חיבור אינטרנט אנא נסו שנית מאוחר יותר"; throw errMessage }
      if (err.status === 500) {
        errMessage = POP_UP_MESSAGE_PROBLEM;
        throw errMessage;
      }
    }
  }

  //function for questions review
  //get all the question the user answered incorrectly with their correct answer
  getQuestionsReview = async () => {
    const [err, res] = await AsyncTools.to(Axios.get(`/api/userAnswer/questions-review?device=${isMobileOnly ? DEVICES.MOBILE : DEVICES.BROWSER}`, { headers: { 'Cache-Control': 'no-cache' } }));
    // here to avoid warning about not using error
    if (err) { } // todo handle error
    if (res && res.data && (Array.isArray(res.data)) && res.data.length) {
      const firstQ = res.data[0];
      const questionInfo = {
        questionInstruction: firstQ.questionInstruction,
        questionStory: firstQ.questionStory,
        imagePaths: firstQ.imagePaths,
        questionAudioUrl: firstQ.audioPath,
        questionNumber: firstQ.questionNumber,
        _id: firstQ._id,
        questionType: firstQ.questionType,
        questionAudio: new Audio(firstQ.audioPath),
      }
      if (firstQ.questionType === QUESTION_TYPES.PSQ) {
        questionInfo.correctPositions = firstQ.correctPositions;
        questionInfo.incorrectPositions = firstQ.answerPositions ? [firstQ.answerPositions] : [];
      } else if (firstQ.questionType === QUESTION_TYPES.MCQ) {
        questionInfo.multipleChoiceAnswers = firstQ.multipleChoiceAnswers;
        if (firstQ.multipleChoiceAnswerId) { questionInfo.multipleChoiceAnswerId = firstQ.multipleChoiceAnswerId }
      } else if (firstQ.questionType === QUESTION_TYPES.DDQ) {
        questionInfo.ddqPositions = firstQ.ddqPositions.map((ddq, index) => {
          //* check if we actually have the specific userAnswer matching the ddqPositions 
          if (("imagePath" in ddq && ddq.imagePath === firstQ.answerIndexDDQ[index].imagePath) || ("label" in ddq && ddq.label === firstQ.answerIndexDDQ[index].label)) {
            return { ...ddq, userAnswerIndex: firstQ.answerIndexDDQ[index].userAnswerIndex }
          }
          throw Error("something went wrong with drag and drop question")
        })
      }
      const numberOfDifferentQuestions = new Set(res.data.map(q => q.questionNumber));
      this.setCurrentQuestionInfo(questionInfo);
      this.setTotalNumberOfQuestions(numberOfDifferentQuestions.size);
      this.setAnsweredQuestions(1);
      this.setQuestionsToReview(res.data);
      let fakeMenuInfoArr = []
      // this.menuInfo = [];//reset menu info 
      res.data.forEach((q) => {
        fakeMenuInfoArr.push({ questionNumber: q.questionNumber, answerStatus: ANSWER_STATUS.UNANSWERED });
      });
      this.setMenuInfo(fakeMenuInfoArr)
      return res.data;
    }
    else {
      return null;
    }
  }

  //set the next question to review
  setNextQuestion = () => {
    const nextQ = this.questionsToReview[this.questionsToReview.findIndex(q => q._id === this.currentQuestionInfoObs.questionId) + 1];
    if (nextQ.questionNumber !== this.currentQuestionInfoObs.questionNumber) {
      this.setAnsweredQuestions(this.answeredQuestions + 1);
    }
    const questionInfo = {
      questionInstruction: nextQ.questionInstruction,
      questionStory: nextQ.questionStory,
      imagePaths: nextQ.imagePaths,
      questionAudioUrl: nextQ.audioPath,
      _id: nextQ._id,
      questionType: nextQ.questionType,
      questionNumber: nextQ.questionNumber,
      questionCategory: '',
      questionAudio: new Audio(nextQ.audioPath),
    }
    if (nextQ.questionType === QUESTION_TYPES.PSQ) {
      questionInfo.correctPositions = nextQ.correctPositions;
      questionInfo.incorrectPositions = nextQ.answerPositions ? [nextQ.answerPositions] : [];
    } else if (nextQ.questionType === QUESTION_TYPES.MCQ) {
      questionInfo.multipleChoiceAnswers = nextQ.multipleChoiceAnswers;
      if (nextQ.multipleChoiceAnswerId) { questionInfo.multipleChoiceAnswerId = nextQ.multipleChoiceAnswerId }
    } else if (nextQ.questionType === QUESTION_TYPES.DDQ) {
      questionInfo.ddqPositions = nextQ.ddqPositions.map((ddq, index) => {
        //* check if we actually have the specific userAnswer matching the ddqPositions 
        if (("imagePath" in ddq) || ("label" in ddq)) {
          if ("answerIndexDDQ" in nextQ) {
            return { ...ddq, userAnswerIndex: nextQ.answerIndexDDQ[index].userAnswerIndex }
          }
          return { ...ddq, userAnswerIndex: index }
        }
        throw Error("something went wrong with drag and drop question")
      })
    }
    this.setReviewShowCorrect(false);
    this.setCurrentQuestionInfo(questionInfo);
  }

  resetReviewMode = () => {
    this.currentQuestionInfoObs = {};
    this.answeredQuestions = 0;
    this.totalNumberOfQuestions = 0;
    this.cameToResultsFromReview = true; // added questionsStore.cameToResultsFromReview in order to prevent the "ניתן לענות על השאלון פעם אחת בלבד" alert on FinishQuestionnaire
    this.setReviewMode(false)
  }
}
