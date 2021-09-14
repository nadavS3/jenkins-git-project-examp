import { action, computed, makeObservable, observable, reaction, toJS } from 'mobx'
import { AsyncTools } from "@hilma/tools";
import { AGES, ANSWER_STATUS, DGO_LEVELS, QUESTION_TYPES, TIMES, USERS_TO_FETCH_INFINITE_SCROL } from '../consts/consts'
import Axios from 'axios'
import { millisToMinutesAndSeconds, extractFamilyStatus, extractDgoLevel, extractDGOLevelsFromDGOArr, extractAgeFromAgeArr, TimeToDateFilter } from '../consts/functions';
import { SuperAdminStoreInstance } from './index.store';

export class usersPageStore {
  //* can use for filters
  superAdminStore = SuperAdminStoreInstance;
  //* data for usersPage which will be inserted in table
  usersData = [];
  //* we have an array of usersId in sync with the users in the usersPage table
  usersId = [];
  specificUserData = {};
  specificUserQuestions = [];
  //*when fetching this set to true for anumation of Loader
  isLoadingUsersData = true;
  //*tracks if we are in usersPage or in SpecificUser component
  showSpecificUser = false;
  //* for usersPage we want to fetch more users only when we at the bottom of the page so we count how many fetch request already has been made at this specific table and we multiplay that by the limit amount to skip the correct amount of users in the users collection
  fetchCountSpecificQuery = 0
  //* inside specificUser we keep track of the index of the selected row so we know its location even after we insert the special data row and manipulate the table
  specificAnswerSelectedIndex = null
  //* when fetch is finished turns to false, infinite scroll know not to make more requests when its false
  isFetchFinished = true;
  //* when true infinite scroll will stop making fetch requests
  isEndOfUsers = false;
  //* xls to export for admin
  xlsUrl = null;

  //* filters for users filter bar
  filters = {
    dateRange: TIMES[0],
    digitalOrientationLevel: DGO_LEVELS[DGO_LEVELS.length - 1],
    age: AGES[AGES.length - 1],
  };

  constructor() {
    makeObservable(this, {
      isFetchFinished: observable,
      isEndOfUsers: observable,
      fetchCountSpecificQuery: observable,
      specificAnswerSelectedIndex: observable,
      showSpecificUser: observable,
      usersData: observable,
      isLoadingUsersData: observable,
      usersId: observable,
      specificUserData: observable,
      specificUserQuestions: observable,
      xlsUrl: observable,
      filters: observable,

      setSpecificUserQuestions: action,
      reverseShowSpecificUser: action,
      setIsLoadingUsersData: action,
      setUsersData: action,
      setUsersId: action,
      setSpecificAnswerSelectedIndex: action,
      fetchUsersData: action,
      setSpecificUserData: action,
      setIsFetchFinished: action,
      setIsEndOfUsers: action,
      setFetchCountSpecificQuery: action,
      setFilters: action,

      getSelectedQuestionData: computed,
    });

    reaction(() => this.filters, () => { this.filters.questionnaireId && this.prepareForFetch() }); // must have questionnaireId
  }

  get getSelectedQuestionData() {
    if (this.specificAnswerSelectedIndex !== 'undefind') {
      return this.specificUserQuestions[this.specificAnswerSelectedIndex + 1][2]
    }
    else {
      return ''
    }
  }

  setIsEndOfUsers(bool) {
    this.isEndOfUsers = bool
  }
  setIsFetchFinished(bool) {
    this.isFetchFinished = bool
  }
  setFetchCountSpecificQuery(num) {
    this.fetchCountSpecificQuery = num
  }
  setSpecificAnswerSelectedIndex(num) {
    this.specificAnswerSelectedIndex = num;
  }
  reverseShowSpecificUser(bool) {
    this.showSpecificUser = bool
  }
  setUsersData(data) {
    this.usersData = data;
  }
  setIsLoadingUsersData(bool) {
    this.isLoadingUsersData = bool
  }
  setUsersId(data) {
    this.usersId = data
  }
  setSpecificUserData(userObj) {
    this.specificUserData = userObj;
  }
  setSpecificUserQuestions(data) {
    this.specificUserQuestions = data;
  }
  setFilters(addFilters) { // in each filter: name, value
    let prevFilters = { ...this.filters };
    for (const filter of addFilters) { prevFilters[filter.name] = filter.value; }
    this.filters = prevFilters;
  }

  get getSpecificUserTotalDuration() {
    return (this.specificUserData && this.specificUserData.totalDuration && this.specificUserData.totalDuration !== "0:00") ? this.specificUserData.totalDuration : "שאלון לא הושלם";
  }

  //*when admin press a specific user in the usersPage table
  async fetchSpecificUserData(userId) {
    const [err, res] = await AsyncTools.to(Axios.post(`api/admin/specific-user-data`, { userId: userId }));
    if (res) {
      let userInfo = res.data.userData;
      userInfo.totalDuration = millisToMinutesAndSeconds(userInfo.totalDuration)
      res.data.userData.familyStatus = extractFamilyStatus(userInfo.familyStatus, userInfo.gender)
      res.data.userData.gender = userInfo.gender === 'MALE' ? 'זכר' : 'נקבה'
      switch (userInfo.DigitalOrientationLevel) {
        case 'UNKNOWN':
          res.data.userData.DigitalOrientationLevel = 'לא ידוע'
          break
        case 'GOOD':
          res.data.userData.DigitalOrientationLevel = "גבוהה"
          break
        case 'BAD':
          res.data.userData.DigitalOrientationLevel = "נמוך"
          break
        case 'INTERMEDIATE':
          res.data.userData.DigitalOrientationLevel = "בינוני"
          break
        default:
          break
      }
      //* this is the data like name and city
      this.setSpecificUserData(res.data.userData)
      //* here we create the data for the answers of this user
      let updatedDataArray = [];
      res.data.userAnswers.forEach((userAnswer) => {
        const dataObject = {
          questionNumber: `שאלה ${userAnswer.questionNumber}${userAnswer.questionSQQOrder ? ` (חלק ${userAnswer.questionSQQOrder})` : ""}`,
          answerStatus: userAnswer.answerDuration ? userAnswer.answerStatus : ANSWER_STATUS.SKIPPED,
          answerDuration: userAnswer.answerDuration ? millisToMinutesAndSeconds(userAnswer.answerDuration) : "המשתמש לא הגיע לחלק זה",
          questionId: userAnswer.questionId,
          answerDevice: userAnswer.answerDevice,
        }
        if ("answerPositions" in userAnswer) dataObject.answerPositions = userAnswer.answerPositions;
        else if ("multipleChoiceAnswerId" in userAnswer) dataObject.multipleChoiceAnswerId = userAnswer.multipleChoiceAnswerId;
        else if ("answerIndexDDQ" in userAnswer) dataObject.answerIndexDDQ = userAnswer.answerIndexDDQ;
        updatedDataArray.push(dataObject);
      })
      this.setSpecificUserQuestions(updatedDataArray)
      return res
    } else {
      console.log(err);
      throw err
    }
  }

  async getExcel() {
    const filters = this.setFiltersForFetch();
    const [err, res] = await AsyncTools.to(Axios.post(`api/admin/get-excel`, { filters: filters }));
    if (res) {
      this.downloadExcel(res.data.data);
    }
    else {
      throw err;
    }
  }

  async downloadExcel(ba) {
    let array = [];
    // eslint-disable-next-line
    for (const [key, value] of Object.entries(ba)) {

      array.push(value)
    }
    let arr = new Uint8Array(array);
    var string = new TextDecoder().decode(arr);
    var blob = new Blob([string]);
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, "users.csv");
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "users.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  //* main fetch of usersPage 
  async fetchUsersData(filtersForFetch) {
    const [err, res] = await AsyncTools.to(Axios.post(`api/admin/all-users-data`, { filters: filtersForFetch, limit: USERS_TO_FETCH_INFINITE_SCROL, skip: this.fetchCountSpecificQuery * USERS_TO_FETCH_INFINITE_SCROL }));
    this.setFetchCountSpecificQuery(this.fetchCountSpecificQuery + 1)

    if (res && res.data) {

      let updatedDataArray = [];

      let idArray = []
      //* looping through all elements and and creating arrays 
      for (let i = 0; i < res.data.length; i++) {
        let userElem = res.data[i];
        //* in the case there are no more users to fetch we send a false statement as the last element of the usersData array and here we stop the loop if thats the case and apply the needed functions
        if (!userElem) {
          this.setIsEndOfUsers(true);
          this.setUsersId(this.usersId.concat(idArray))
          this.setUsersData(this.usersData.concat(updatedDataArray))
          this.setIsLoadingUsersData(false)
          this.setIsFetchFinished(false);
          return
        }
        let dataInstance = [];
        const MISSING = "נתון חסר"
        dataInstance[0] = userElem.firstName || MISSING;
        dataInstance[1] = userElem.lastName || MISSING;
        dataInstance[2] = userElem.age || MISSING;
        dataInstance[3] = userElem.organizationName || MISSING;
        dataInstance[4] = userElem.questionnaireTitle || MISSING;
        dataInstance[5] = extractDgoLevel(userElem.DigitalOrientationLevel) || MISSING;
        updatedDataArray.push(dataInstance);
        idArray.push(userElem._id)
      }
      this.setUsersId(this.usersId.concat(idArray))
      this.setUsersData(this.usersData.concat(updatedDataArray))
      this.setIsLoadingUsersData(false)
      this.setIsFetchFinished(false)
      return res
    } else {
      throw err
    }
  }
  //*inside specificUser when clicking on specific answer
  //*before hand checks if the user is incorrect, if so we already have the positions of the userAnswer so we send an alert to server not to fetch position
  async fetchQuestionData(question, arrayIndex) {
    const { questionId, answerDevice, answerStatus } = question;
    const [err, res] = await AsyncTools.to(Axios.post(`api/admin/specific-question-data`, { questionId: questionId, answerDevice: answerDevice, questionnaireId: this.specificUserData.questionnaireId }));
    if (res) {
      //* making a deep copy of array to avoid warnings
      let copyAnswerArr = JSON.parse(JSON.stringify(this.specificUserQuestions))
      //*now add the data about the question, first extract the position of userAnswer
      let newRow = {
        questionStory: res.data.questionStory,
        questionInstruction: res.data.questionInstruction,
        imagePath: res.data.imagePaths[0],
        answerStatus: answerStatus,
        questionType: res.data.questionType,
        answerDevice: res.data.answerDevice
      };
      let answerPositions;
      if (res.data.questionType === QUESTION_TYPES.PSQ) {

        if (!(answerStatus === ANSWER_STATUS.INCORRECT)) { answerPositions = res.data.correctPositions[0]; }
        else {
          answerPositions = toJS(copyAnswerArr[arrayIndex]).answerPositions
        }
        //* determens the position of the div of the userAnswer
        let styleUserAnswerEval = {
          top: (answerPositions.top * 100) + "%",
          left: (answerPositions.left * 100) + "%",
          height: ((answerPositions.bottom - answerPositions.top) * 100) + "%",
          width: ((answerPositions.right - answerPositions.left) * 100) + "%"
        }
        newRow.styleUserAnswerEval = styleUserAnswerEval;
        newRow.answerDevice = answerDevice;
      } else if (res.data.questionType === QUESTION_TYPES.MCQ) {
        let userSelectedAnswerId;
        // console.log(copyAnswerArr);
        if (copyAnswerArr[arrayIndex].answerStatus === ANSWER_STATUS.SKIPPED) {
          userSelectedAnswerId = ANSWER_STATUS.SKIPPED
        } else {
          userSelectedAnswerId = toJS(copyAnswerArr[arrayIndex].multipleChoiceAnswerId)
        }
        newRow.multipleChoiceAnswers = res.data.multipleChoiceAnswers;
        newRow.userSelectedAnswerId = userSelectedAnswerId;
      } else if (res.data.questionType === QUESTION_TYPES.DDQ) {
        // console.log(res.data);
        let styleUserAnswerEvalArr = res.data.ddqPositions.map(ddqPos => {
          console.log(ddqPos);
          let styleUserAnswerEval = {
            top: (ddqPos.top * 100) + "%",
            left: (ddqPos.left * 100) + "%",
            height: ((ddqPos.bottom - ddqPos.top) * 100) + "%",
            width: ((ddqPos.right - ddqPos.left) * 100) + "%"
          }
          "label" in ddqPos ? styleUserAnswerEval.label = ddqPos.label : styleUserAnswerEval.imagePath = ddqPos.imagePath;
          return styleUserAnswerEval
        })
        newRow.ddqPositions = styleUserAnswerEvalArr
      }
      //* change the arrow icon and bold the question number
      this.setSpecificAnswerSelectedIndex(arrayIndex)
      //*insert the question data onto a new psaudo row
      copyAnswerArr.splice(arrayIndex + 1, 0, newRow)
      this.setSpecificUserQuestions(copyAnswerArr)
    }
    else {
      throw err
    }
  }




  //*in specificUser when we want to present other user or to close this user we first remove the special extra data row because it messes up the actual index position of the click
  removeOpenQuestionRow(arrayIndex) {
    let copyAnswerArr = this.specificUserQuestions;
    copyAnswerArr.splice(arrayIndex + 1, 1);
    this.setSpecificUserQuestions(copyAnswerArr);
  }

  //*some values we want to reset before fetch
  prepareForFetch() {
    this.setFetchCountSpecificQuery(0)
    this.setUsersData([]);
    this.setUsersId([]);
    this.setIsFetchFinished(true);
    this.setIsEndOfUsers(false);
    this.setIsLoadingUsersData(true);
    const filters = this.setFiltersForFetch();
    this.fetchUsersData(filters);
  }

  setFiltersForFetch() { // organizing filters
    let filtersForFetch = {};
    if (this.filters.questionnaireId) {
      filtersForFetch.questionnaireId = this.superAdminStore.questionnairesAndIds.find(q => q.title === this.filters.questionnaireId)._id;
    }
    if (this.filters.organizationId !== undefined) {
      filtersForFetch.organizationId = this.superAdminStore.organizationsForFilterIncludeAll.find(org => org.organizationName === this.filters.organizationId)._id;
    }
    if (this.filters.dateRange) {
      filtersForFetch.dateRange = TimeToDateFilter(this.filters.dateRange);
    }
    if (this.filters.digitalOrientationLevel) {
      filtersForFetch.digitalOrientationLevel = extractDGOLevelsFromDGOArr(this.filters.digitalOrientationLevel);
    }
    if (this.filters.age) {
      filtersForFetch.age = extractAgeFromAgeArr(this.filters.age);
    }
    return filtersForFetch;
  }
}
