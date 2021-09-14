import { makeObservable, observable, action, computed } from 'mobx';
import { AsyncTools } from '@hilma/tools';
import Axios from 'axios';
import { ALL_ORGANIZATIONS_FILTER, HEBREW_QUESTION_TYPES, QUESTION_TYPES, REAL_QUESTIONNAIRE_ID, USER_ROLE } from '../consts/consts';

export class superAdminStore {

    categoriesAndIds = [];
    currentCategory = {};
    currentCategoryData = [];
    specificQuestionInfo = null;
    onEditQuestionMode = false; // true for edit mode, false for add question mode
    nextQuestionNumber = 0;

    currentCategoryComponent = 0; // 0 for allCategories, 1 for specificCategory

    organizationsAndIds = [];
    //* all questionnaires for filter
    questionnairesAndIds = [];

    constructor() {
        makeObservable(this, {
            currentCategory: observable,
            categoriesAndIds: observable,
            currentCategoryData: observable,
            specificQuestionInfo: observable,
            onEditQuestionMode: observable,
            nextQuestionNumber: observable,
            currentCategoryComponent: observable,
            organizationsAndIds: observable,
            questionnairesAndIds: observable,

            categoryNames: computed,
            categoryIds: computed,
            questionnaireTitles: computed,
            organizationsForFilterIncludeAll: computed,
            organizationNamesForFilterIncludeAll: computed,

            editedQuestionId: computed,
            editedQuestionNumber: computed,
            editedQuestionStory: computed,
            editedQuestionInstruction: computed,
            editedBrowserImage: computed,
            editedMobileImage: computed,
            editedQuestionType: computed,
            editedQuestionTypeHebrew: computed,
            editedAnswerPositions: computed,
            editedQuestionMultipleChoiceAnswers: computed,

            setCategoriesAndIds: action,
            fetchCategoriesAndIds: action,
            fetchSpecificCategoryQuestions: action,
            setCurrentCategory: action,
            setCurrentCategoryData: action,
            fetchOrganizationsAndIds: action,
            addCategoryToDB: action,
            setSpecificQuestionInfo: action,
            setCurrentCategoryComponent: action,
            setOrganizationsAndIds: action,
            setQuestionnairesAndIds: action,
        })
    }

    get categoryNames() { // indexes should be exactly as ids
        return this.categoriesAndIds.map(cat => cat.categoryName);
    }
    get categoryIds() { // indexes should be exactly as names
        return this.categoriesAndIds.map(cat => cat._id);
    }
    get questionnaireTitles() {
        return this.questionnairesAndIds.map(q => q.title);
    }
    get organizationsForFilterIncludeAll() {
        return [ALL_ORGANIZATIONS_FILTER].concat(this.organizationsAndIds);
    }
    get organizationNamesForFilterIncludeAll() {
        return this.organizationsForFilterIncludeAll.map(org => org.organizationName);
    }
    // getters in order not to do kinon every time :
    get editedQuestionId() {
        if (this.specificQuestionInfo) { return this.specificQuestionInfo._id }
        return "";
    }
    get editedQuestionNumber() {
        if (this.specificQuestionInfo) { return this.specificQuestionInfo.questionNumber }
        return "לא נמצאה";
    }
    get editedQuestionStory() {
        if (this.specificQuestionInfo) { return this.specificQuestionInfo.questionStory }
        return "סיפור רקע לא נמצא";
    }
    get editedQuestionInstruction() {
        if (this.specificQuestionInfo) { return this.specificQuestionInfo.questionInstruction }
        return "שאלה לא נמצאה";
    }
    get editedQuestionType() {
        if (this.specificQuestionInfo) { return this.specificQuestionInfo.questionType }
        return "סוג שאלה לא נמצא";
    }
    get editedBrowserImage() {
        try { return this.specificQuestionInfo.browserQuestionInfo.imagePaths[0] }
        catch (err) { return "" }
    }
    get editedMobileImage() {
        try { return this.specificQuestionInfo.mobileQuestionInfo.imagePaths[0] }
        catch (err) { return "" }
    }
    get editedQuestionAudio() {
        try { return this.specificQuestionInfo.audioPath }
        catch (err) { return "" }
    }
    get editedAnswerPositions() {
        if (this.specificQuestionInfo.questionType && this.specificQuestionInfo.questionType === QUESTION_TYPES.PSQ) {
            return {
                browser: { correctArray: this.specificQuestionInfo.browserQuestionInfo.correctPositions, incorrectArray: this.specificQuestionInfo.browserQuestionInfo.incorrectPositions },
                mobile: { correctArray: this.specificQuestionInfo.mobileQuestionInfo.correctPositions, incorrectArray: this.specificQuestionInfo.mobileQuestionInfo.incorrectPositions }
            }
        }
        else {
            return {
                browser: { correctArray: [], incorrectArray: [] },
                mobile: { correctArray: [], incorrectArray: [] }
            }
        }
    }
    get editedQuestionMultipleChoiceAnswers() {
        if (this.specificQuestionInfo.questionType && this.specificQuestionInfo.questionType === QUESTION_TYPES.MCQ) {
            return this.specificQuestionInfo.multipleChoiceAnswers
        }
        return [];
    }
    get editedQuestionTypeHebrew() {
        if (this.specificQuestionInfo) {
            let hebrewType;
            switch (this.specificQuestionInfo.questionType) {
                case QUESTION_TYPES.MCQ:
                    hebrewType = HEBREW_QUESTION_TYPES[0]; // אמריקאית
                    break;
                case QUESTION_TYPES.PSQ:
                    hebrewType = HEBREW_QUESTION_TYPES[1]; // בחירת מיקום נכון
                    break;
                default:
                    hebrewType = HEBREW_QUESTION_TYPES[1]; // בחירת מיקום נכון
                    break;
            }
            return hebrewType;
        }
        return "סוג שאלה לא נמצא";
    }

    setEditQuestionMode(data) {
        this.onEditQuestionMode = data;
    }
    setCurrentCategoryData(data) {
        this.currentCategoryData = data;
    }
    setCurrentCategory(data) {
        this.currentCategory = data;
    }
    setCategoriesAndIds(data) {
        this.categoriesAndIds = data;
    }
    setOrganizationsAndIds(data) {
        this.organizationsAndIds = data;
    }
    setQuestionnairesAndIds(data) {
        this.questionnairesAndIds = data;
    }
    setSpecificQuestionInfo(data) {
        this.specificQuestionInfo = data;
        this.displayImage = "BROWSER";
    }
    setCurrentCategoryComponent(value) {
        this.currentCategoryComponent = value;
    }
    async fetchCategoriesAndIds() {
        let categoriesFetch = await Axios.get("/api/admin/admin-get-category");
        this.setCategoriesAndIds(categoriesFetch.data)
    }
    async fetchOrganizationsAndIds() {
        let organizationsFetch = await Axios.get("/api/organization/all");
        this.setOrganizationsAndIds(organizationsFetch.data)
    }
    async fetchSpecificCategoryQuestions(id) {
        const [err, res] = await AsyncTools.to(Axios.post(`api/questionnaire/admin-category-data`, { categoryId: id, questionnaireId: REAL_QUESTIONNAIRE_ID }));
        if (res) {
            this.setCurrentCategoryData(res.data)
            return res;
        }
        else {
            throw err;
        }
    }
    async addCategoryToDB(newCategoryData) {
        const [err, res] = await AsyncTools.to(Axios.post(`api/questionnaireCategory`, newCategoryData));
        if (res) {
            this.setCategoriesAndIds(res.data)
            return res;
        }
        else {
            throw err;
        }
    }
    async deleteOrganizationAndFetch(id) {
        const [err, res] = await AsyncTools.to(Axios.put(`api/organization/delete-one-and-fetch`, { organizationId: id }));
        if (res) {
            this.setOrganizationsAndIds(res.data)
        }
        else {
            throw err;
        }
    }

    async updateOrganizationAndAdmin(organizationId, organizationName) {
        const [err, res] = await AsyncTools.to(Axios.post(`api/admin/update-organization`, { organizationName: organizationName, organizationId: organizationId }));
        if (res) {
            this.setOrganizationsAndIds(res.data)
            return "SUCCESS";
        }
        else {
            return err;
        }
    }

    async addNewOrganizationAndAdmin(organizationName, email, password) {
        const [err, res] = await AsyncTools.to(Axios.post(`api/admin/add-organization`, { organizationName: organizationName, email: email, password: password }));
        if (res) {
            this.setOrganizationsAndIds(res.data)
            return "SUCCESS";
        }
        else {
            return err;
        }
    }
    async fetchSpecificQuestionInfo(questionId) {
        const [err, res] = await AsyncTools.to(Axios.get(`api/questionnaire/fetch-question-for-edit/${questionId}`));
        if (res) {
            this.setSpecificQuestionInfo(res.data);
        }
        else {
            throw err;
        }
    }
    async fetchNextQuestionNumber() {
        const [err, res] = await AsyncTools.to(Axios.post(`api/questionnaire/next-question-number`, { questionnaireId: REAL_QUESTIONNAIRE_ID }));
        if (res) {
            this.nextQuestionNumber = res.data;
        }
        else {
            throw err;
        }
    }
    async fetchDataForFilters(userRole) {
        const [err, res] = await AsyncTools.to(Axios.get(`api/admin/${userRole === USER_ROLE.SUPERADMIN ? 'questionnaires-and-organizations' : 'all-questionnaires'}`));
        if (res) {
            this.setQuestionnairesAndIds(res.data.questionnaires);
            if (userRole === USER_ROLE.SUPERADMIN) {
                this.setOrganizationsAndIds(res.data.organizations);
            };
        }
        else { throw err; }
    }
}

