import { action, computed, makeObservable, observable } from "mobx";
import { AsyncTools } from "@hilma/tools";
import Axios from "axios";
import { POP_UP_MESSAGE_PROBLEM, PAGE_NUMBERS } from "../consts/consts"
export class UsersStore {
  userInfo = {
    organizationId: "",
    firstName: "",
    lastName: "",
    city: "",
    age: "",
    gender: "",
    familyStatus: "",
    sector: "",
    email: "",
    phoneNumber: "",
  };
  isKeyboardFocused = false;
  errorPopUp = false;
  errorPopUpMessage = "";
  currentPage = PAGE_NUMBERS.INTRODUCTION_PAGE;
  customOrganization = "";

  constructor() {
    makeObservable(this, {
      errorPopUp: observable,
      errorPopUpMessage: observable,
      userInfo: observable,
      isKeyboardFocused: observable,
      currentPage: observable,
      customOrganization: observable,

      firstName: computed,

      updateUserInfo: action,
      showErrorPopUp: action,
      setErrorPopUpMessage: action,
      setErrorPopUp: action,
      setIsKeyboardFocused: action,
      setCurrentPage: action,
      setCustomOrganization: action,
    });
  }

  setIsKeyboardFocused(bool) {
    this.isKeyboardFocused = bool
  }
  setErrorPopUpMessage(message) {
    this.errorPopUpMessage = message
  }
  showErrorPopUp(message) {
    if (!this.errorPopUp) {
      this.setErrorPopUpMessage(message)
      this.setErrorPopUp(true);
      setTimeout(() => {
        this.setErrorPopUp(false);
      }, 3000);
    }
  }
  setErrorPopUp(val) { this.errorPopUp = val }
  setCurrentPage(pageNum) { this.currentPage = pageNum; }
  setCustomOrganization(org) { this.customOrganization = org; }
  get firstName() {
    return this.userInfo.firstName;
  }

  whatPageShouldIView() {
    const { organizationId, firstName, lastName, city, age, gender, familyStatus, sector } = this.userInfo;
    if (!organizationId || !firstName || !lastName || !city || !age || !gender || !familyStatus || !sector) { return 'IntroductionPage' }
  }

  async getUserResults() {

    const [err, res] = await AsyncTools.to(Axios.get("/api/userAnswer/user-results"));
    if (res) {
      return res
    }
    if (err) {
      return err
    }

  }

  async postUserInfo() {
    //check if all the info exists and if not return error
    for (const info in this.userInfo) {
      if (!this.userInfo[info]) { return POP_UP_MESSAGE_PROBLEM }
    }

    //! todo: questionnaireId hard coded
    //real questionnaire
    this.userInfo.questionnaireId = "606ada841623e2ba3f789e4c"; // hard coded questionnaire id

    //fake questionnaire
    // this.userInfo.questionnaireId = "60740f3e50805ebb241505dc"; // hard coded questionnaire id

    // Yom Patuah questionnaire id
    // this.userInfo.questionnaireId = "610109d023dc6a35c3ea88a5"; // hard coded questionnaire id

    let registerPostObj = { userInfo: this.userInfo };
    if (this.customOrganization) { registerPostObj.customOrganization = this.customOrganization; }
    const [err, res] = await AsyncTools.to(
      Axios.post("/api/my-user/register", registerPostObj)
    );
    if (err) {
      let errMessage;
      if (!err) { errMessage = "אין חיבור אינטרנט אנא נסו שנית מאוחר יותר"; throw errMessage }
      if (err.status === 500) {
        errMessage = POP_UP_MESSAGE_PROBLEM
        throw errMessage;
      }
      return err;
    } else {
      return res;
    }
  }

  //takes an object and insert its values into userinfo (when the field is matching)
  updateUserInfo(obj) {
    for (const property in obj) {
      for (const dataField in this.userInfo) {
        if (property === dataField) {
          this.userInfo[dataField] = obj[property];
        }
      }
    }
  }

}
