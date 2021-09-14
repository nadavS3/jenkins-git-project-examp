import { AudioService, FilesType, ImageService } from '@hilma/fileshandler-server';
import { Injectable } from '@nestjs/common';
import { Questionnaire, QuestionnaireDocument } from '../schemas/questionnaire.schema';
import { QuestionInfo } from '../dtos/question.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserAnswerService } from 'src/userAnswer/userAnswer.service';
import { NO_MORE_QUESTIONS_MESSAGE, ANSWER_STATUS, Filters, matchDateRange, isMobile, addFieldsDestructorDevice, projectNoDevicesQuestionInfo, QUESTION_TYPES, matchQuestionnaire, DEVICES, BROWSER_QUESTION_INFO, MOBILE_QUESTION_INFO } from 'src/consts/consts';
import { FilesIdsObject, QuestionData, QuestionIdsCategories, QuestionInfoReadyForQuestionnaire, QuestionnaireData, QuestionReadyForUpdate, QuestionUnwinded, SpecificQuestionData } from 'src/consts/dtos/interfaces';
import { DeviceQuestionInfo } from 'src/consts/classes';
import { deleteUnnecessaryFields, destructorDeviceJS, replaceRootQuestions, unwindQuestionInfo } from 'src/consts/funcs';
import { UserAnswerInfo } from 'src/dtos/userAnswer.dto';

@Injectable()
export class QuestionnaireService {
    constructor(
        private readonly imageService: ImageService,
        private readonly audioService: AudioService,
        @InjectModel(Questionnaire.name) private questionnaireModel: Model<QuestionnaireDocument>,
        // protected readonly jwtService: JwtService,
        private readonly userAnswerService: UserAnswerService
    ) { }

    async fetchQuestionsByQuestionNumber(questionnaireId: Types.ObjectId, qNumber: number, device: string): Promise<QuestionUnwinded | QuestionUnwinded[]> {
        const matchQuestionnaireId = matchQuestionnaire(questionnaireId);
        const unwindQuestionnaire = { $unwind: "$questions" };
        // replaceRootQuestions
        const matchQuestionNumber = { $match: { "questionNumber": qNumber } };
        const addFields = addFieldsDestructorDevice(isMobile(device)) // destructor mobile/browser question info
        const sortSqqInnerOrder = { $sort: { "SQQInnerOrder": 1 } };
        // projectNoDevicesQuestionInfo

        const aggregation = [matchQuestionnaireId, unwindQuestionnaire, replaceRootQuestions, matchQuestionNumber, addFields, sortSqqInnerOrder, projectNoDevicesQuestionInfo];
        try {
            const res = await this.questionnaireModel.aggregate(aggregation);
            console.log('aggreres: ', res);
            if (res) {
                return (res.length === 1) ? res[0] : res;
            }

        }
        catch (err) {
            console.log('err: ', err);
            throw err;
        }
    }

    async fetchById(questionId: Types.ObjectId, device: string): Promise<QuestionUnwinded> {

        const unwind = { $unwind: "$questions" }

        const questionObjectId = new Types.ObjectId(questionId);
        const matchQuestionId = { $match: { "questions._id": questionObjectId } };
        const lookupCategory = {
            $lookup: {
                from: 'questionCategories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'categoryInfo'
            }
        };
        const addFields = addFieldsDestructorDevice(isMobile(device)) // destructor mobile/browser question info
        const projectRemoveDevices = projectNoDevicesQuestionInfo; // removes mobile/browser question info
        let q: QuestionUnwinded[] = await this.questionnaireModel.aggregate([unwind, matchQuestionId, replaceRootQuestions, lookupCategory, addFields, projectRemoveDevices]);
        let questionInfo = q[0];

        questionInfo = deleteUnnecessaryFields(questionInfo, device);
        return questionInfo;
    }
    async fetchByIdBothDevices(questionId: Types.ObjectId) {

        const questionObjectId = new Types.ObjectId(questionId);
        const matchQuestionnaire = { $match: { 'questions._id': questionObjectId } };
        const firstProject = {
            $project: {
                _id: 0,
                questionInfo: {
                    $filter: {
                        input: "$questions",
                        as: "question",
                        cond: { $eq: ["$$question._id", questionObjectId] }
                    }
                }
            }
        }
        const replaceRootQuestionInfo = { $replaceWith: "$questionInfo" }
        const lookupCategory = {
            $lookup: {
                from: 'questionCategories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'categoryInfo'
            }
        };
        const unwindCategoryInfo = { $unwind: "$categoryInfo" };
        const project = {
            $project: {
                _id: 1,
                questionType: 1,
                categoryId: 1,
                "categoryName": "$categoryInfo.categoryName",
                questionNumber: 1,
                questionStory: 1,
                questionInstruction: 1,
                audioPath: 1,
                browserQuestionInfo: 1,
                mobileQuestionInfo: 1,
                multipleChoiceAnswers: 1,
                SQQInnerOrder: 1,
            }
        }
        let results = await this.questionnaireModel.aggregate(
            [matchQuestionnaire, firstProject, unwindQuestionInfo, replaceRootQuestionInfo, lookupCategory, unwindCategoryInfo, project]
        );
        let questionInfo = results[0];

        return questionInfo;
    }

    async getMenuInfo(userId: string, questionnaireId: Types.ObjectId): Promise<Array<any>> {

        let allQuestions = (await this.questionnaireModel.findOne(
            { _id: questionnaireId },
            { _id: 0, "questions._id": 1, "questions.questionNumber": 1, "questions.SQQInnerOrder": 1, }
        )).questions.sort((a, b) => (a.questionNumber === b.questionNumber) ? (a.SQQInnerOrder - b.SQQInnerOrder) : (a.questionNumber - b.questionNumber));

        const answeredQuestions = await this.userAnswerService.answeredQuestionsForUser(userId);

        let questionNumbersSet = new Set();

        let reducedMenuInfo = [];
        allQuestions.forEach((q) => {
            const answer = answeredQuestions.find(aq => String(aq.questionId) === String(q._id));
            if (!questionNumbersSet.has(q.questionNumber)) {
                questionNumbersSet.add(q.questionNumber);
                let answerStatus = ANSWER_STATUS.UNANSWERED;
                if (answer) {
                    answerStatus = answer.answerStatus;
                }
                reducedMenuInfo.push({ _id: q._id, answerStatus: answerStatus, questionNumber: q.questionNumber });
            }
            else {
                if (answer && answer.answerStatus) {
                    reducedMenuInfo[q.questionNumber - 1].answerStatus = answer.answerStatus; // in case all questions are here // question 1 is on position 0
                }

                // ! old way
                // if one answer of same questionNumber is not UNANSWERED-> set reducedMenuInfo[length-1] to current questionStatus

                // for (let i = 0; i < reducedMenuInfo.length; i++) {
                //     const menuQ = reducedMenuInfo[i];
                //     if (menuQ.questionNumber === q.questionNumber) {
                //         if (answer?.answerStatus &&
                //             (menuQ.answerStatus !== ANSWER_STATUS.UNANSWERED || menuQ.answerStatus !== ANSWER_STATUS.SKIPPED) &&
                //             (menuQ.answerStatus !== answer?.answerStatus)) {
                //             reducedMenuInfo[i].answerStatus = ANSWER_STATUS.SKIPPED;
                //             break;
                //         }
                //     }
                // }
            }
        })
        return reducedMenuInfo;
    }

    /**
     * if user stopped answering an sqq in the middle (through the menu),
     * need to create a user answer for the rest of the sqq questions,
     * with an answerStatus of INCORRECT.
     */
    async updateSQQRest(questionnaireId: Types.ObjectId, userId: string, currQuestionNumber: string, device: string, questionId: string) {
        if (!currQuestionNumber) {
            console.log('updateSQQRest didn\'t get currQuestionNumber. - ', currQuestionNumber);
            return
        }
        const sqqQuestionnaire = (await this.questionnaireModel.findOne({ _id: questionnaireId }));

        // filter- keep only current sqq questions:
        const sqqQuestions = sqqQuestionnaire.questions.filter(q => Number(q.questionNumber) === Number(currQuestionNumber))

        // order ssq
        sqqQuestions.sort((a, b) => a.SQQInnerOrder - b.SQQInnerOrder);

        //array of ids of answers that were answered by this user:
        const answeredQuestionsIds = await this.userAnswerService.answeredQuestionsForUser(userId);
        const unansweredQuestions = sqqQuestions.filter((q) => { // remove question from <sqqQuestions> that have already been answered by the user
            return answeredQuestionsIds.filter((a) => a.questionId.equals(q._id)).length === 0;
        }); // return the next unanswered questions

        //if there is an next question goes in
        let currUnansweredQuestion = unansweredQuestions[0];
        let i = 0;
        while (currUnansweredQuestion /* && (nextUnansweredQuestion.questionNumber === lastQuestionNumber) */) {
            if (Number(currUnansweredQuestion.questionNumber) === Number(currQuestionNumber)) {
                // don't set anything for current question!!! just entered it, don't set it to be incorrect.
                i++;
                currUnansweredQuestion = unansweredQuestions[i];
                continue
            }
            const answerInfo = {
                questionId: String(currUnansweredQuestion._id),
                answerDuration: 0, // to show this is a fictitious answer
                answerStatus: ANSWER_STATUS.INCORRECT, // temp
                answerDevice: device,
            }
            await this.userAnswerService.createUserAnswer(answerInfo, userId, questionnaireId);
            i++;
            currUnansweredQuestion = unansweredQuestions[i];
        }

    }

    async getNextQuestion(userId: string, device: string, questionnaireId: Types.ObjectId, lastAnswerInfo?: UserAnswerInfo): Promise<QuestionUnwinded | string | QuestionUnwinded[]> { // todo change promise

        //* input the userId and bring back an array of ids of answers that were answered by this user
        try {

            const answeredQuestionsIds = await this.userAnswerService.answeredQuestionsForUser(userId);

            //*we fetch all of the question in order by category and then by id and apply a filter that goes through all the elements
            //*inside we  do another filter that goes through all the id's of the questions that this user answered
            //*we go through each question in the db and for each of them we compare it with all the ids of the answered questions, if theres a match then the length 
            //*of the array will be greater then 0 thus this question already been answered, when there is no id of a userAnswer the match the question id then it is an unanswered question

            const allQuestions = (await this.questionnaireModel.findOne({ _id: questionnaireId })).questions;

            // sort by questionNumber
            allQuestions.sort((a, b) => (a.questionNumber === b.questionNumber) ? (a.SQQInnerOrder - b.SQQInnerOrder) : (a.questionNumber - b.questionNumber));

            const unansweredQuestions = allQuestions.filter((q) => {
                return answeredQuestionsIds.filter((a) => {
                    return a.questionId.equals(q._id);
                }).length === 0;
            }); // return the next unanswered question, by the order
            //if there is an next question goes in

            let nextQuestionIndex = 0;

            if (lastAnswerInfo && lastAnswerInfo.answerStatus !== ANSWER_STATUS.CORRECT) { // came from !createUserAnswerAndGetNextQuestion!
                const lastQuestionNumber = (await this.fetchByIdBothDevices(Types.ObjectId(lastAnswerInfo.questionId))).questionNumber;
                let nextUnanswered = unansweredQuestions[nextQuestionIndex];
                while (nextUnanswered && (nextUnanswered.questionNumber === lastQuestionNumber)) {
                    const answerInfo = {
                        questionId: String(nextUnanswered._id),
                        answerDuration: 0, // to show this is a fictitious answer
                        answerStatus: ANSWER_STATUS.INCORRECT, // temp
                        answerDevice: lastAnswerInfo.answerDevice,
                    }
                    await this.userAnswerService.createUserAnswer(answerInfo, userId, questionnaireId);
                    nextQuestionIndex++;
                    nextUnanswered = unansweredQuestions[nextQuestionIndex];
                }
            }
            const nextUnansweredQuestion = unansweredQuestions[nextQuestionIndex];

            if (nextUnansweredQuestion) {
                if ("SQQInnerOrder" in nextUnansweredQuestion) {
                    let arrayOfSequenceQuestions: QuestionUnwinded[] = [destructorDeviceJS(nextUnansweredQuestion, device)];
                    let i = nextQuestionIndex + 1;
                    while (unansweredQuestions[i] && unansweredQuestions[i].questionNumber === nextUnansweredQuestion.questionNumber) {
                        arrayOfSequenceQuestions.push(destructorDeviceJS(unansweredQuestions[i], device));
                        i++;
                    }
                    return arrayOfSequenceQuestions;
                }
                return destructorDeviceJS(nextUnansweredQuestion, device);
            } else {
                return NO_MORE_QUESTIONS_MESSAGE;
            }
        }
        catch (err) {
            console.log(err);
        }
        // if (nextUnansweredQuestion) { //* old
        //     if ("SQQInnerOrder" in nextUnansweredQuestion) {
        //         let arrayOfSequenceQuestions: QuestionUnwinded[] = [];
        //         const matchQuestionnaire = { $match: { _id: questionnaireId } };
        //         const unwindQuestionnaire = { $unwind: "$questions" };
        //         const match = { $match: { "questions._id": new Types.ObjectId(nextUnansweredQuestion._id) } };
        //         const addFields = addFieldsDestructorDevice(isMobile(device) /* return if mobile */); // destructor mobile/browser question info
        //         const projectRemoveDevices = projectNoDevicesQuestionInfo; // removes mobile/browser question info
        //         let nextQuestionInfo = await this.questionnaireModel.aggregate([matchQuestionnaire, unwindQuestionnaire, match, replaceRootQuestions, addFields, projectRemoveDevices])
        //         let questionInfo: QuestionUnwinded = deleteUnnecessaryFields(nextQuestionInfo[0], device);
        //         arrayOfSequenceQuestions.push(questionInfo);
        //         let i = 1
        //         // nextUnansweredQuestion = unansweredQuestions[i];
        //         while (nextUnansweredQuestion.questionNumber === questionInfo.questionNumber) {
        //             const match = { $match: { "questions._id": new Types.ObjectId(nextUnansweredQuestion._id) } };
        //             const addFields = addFieldsDestructorDevice(isMobile(device) /* return if mobile */); // destructor mobile/browser question info
        //             let nextQuestionInfo = await this.questionnaireModel.aggregate([matchQuestionnaire, unwindQuestionnaire, match, replaceRootQuestions, addFields, projectRemoveDevices])
        //             let questionInfo = deleteUnnecessaryFields(nextQuestionInfo[0], device);
        //             arrayOfSequenceQuestions.push(questionInfo);
        //             i++
        //             // nextUnansweredQuestion = unansweredQuestions[i];

        //         }
        //         return arrayOfSequenceQuestions
        //     }
        //     //we query the category info of the specific question we filtered right now.
        //     //first we match the user Questionnaire and unwind the data of that Questionnaire to get the question objects
        //     //then  we do a match on the nextUnansweredQuestion so npw we only have our specific question we need
        //     //and not all the documents in questions collection, so we have one document that match the id and this document has a categoryId and then we query this 
        //     //categoryId with questionCategories _id and get all the data back after removing some unnecessary fields

        //     const matchQuestionnaire = { $match: { _id: questionnaireId } };
        //     const unwindQuestionnaire = { $unwind: "$questions" };
        //     const match = { $match: { "questions._id": new Types.ObjectId(nextUnansweredQuestion._id) } };
        //     const addFields = addFieldsDestructorDevice(isMobile(device) /* return if mobile */); // destructor mobile/browser question info
        //     const projectRemoveDevices = projectNoDevicesQuestionInfo; // removes mobile/browser question info
        //     let nextQuestionInfo = await this.questionnaireModel.aggregate([matchQuestionnaire, unwindQuestionnaire, match, replaceRootQuestions, addFields, projectRemoveDevices])
        //     let questionInfo = deleteUnnecessaryFields(nextQuestionInfo[0], device);

        //     return questionInfo;
        // } else {
        //     return NO_MORE_QUESTIONS_MESSAGE;
        // }
    }

    //* new admin
    async getTotalNumberOfQuestions(questionnaireId: Types.ObjectId) {
        let questionnaire = await this.questionnaireModel.findOne({ _id: questionnaireId });
        let numberOfQuestions = [...new Set(questionnaire.questions.map(q => q.questionNumber))].length;
        return numberOfQuestions;
    }

    async createQuestion(questionnaireId: string, files: FilesType, body: { questionInfo: QuestionInfo, mobileImageId: number, browserImageId: number, audioId: number })/*: Promise<Question | Error>*/ {
        try {
            const { questionInfo, mobileImageId, browserImageId, audioId } = body;

            const savedMobileImagePath = await this.imageService.saveInSize(files, mobileImageId, 1500);
            const savedBrowserImagePath = await this.imageService.saveInSize(files, browserImageId, 1500);
            const savedAudioPath = await this.audioService.save(files, audioId);

            let mobileQuestionInfo: DeviceQuestionInfo = { imagePaths: [savedMobileImagePath] };
            let browserQuestionInfo: DeviceQuestionInfo = { imagePaths: [savedBrowserImagePath] };
            if (questionInfo.questionType === QUESTION_TYPES.PSQ) {
                mobileQuestionInfo.correctPositions = questionInfo.mobileQuestionInfo.correctPositions;
                mobileQuestionInfo.incorrectPositions = questionInfo.mobileQuestionInfo.incorrectPositions;
                browserQuestionInfo.correctPositions = questionInfo.browserQuestionInfo.correctPositions;
                browserQuestionInfo.incorrectPositions = questionInfo.browserQuestionInfo.incorrectPositions;
            }
            let newQuestionForDB: QuestionInfoReadyForQuestionnaire = { // * THE QUESTION READY FOR DB
                _id: Types.ObjectId(),
                audioPath: savedAudioPath,
                questionType: questionInfo.questionType,
                mobileQuestionInfo: mobileQuestionInfo,
                browserQuestionInfo: browserQuestionInfo,
                categoryId: Types.ObjectId(questionInfo.categoryId),
                questionNumber: questionInfo.questionNumber,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
                questionStory: questionInfo.questionStory,
                questionInstruction: questionInfo.questionInstruction,
            }
            if (questionInfo.questionType === QUESTION_TYPES.MCQ) {
                newQuestionForDB.multipleChoiceAnswers = questionInfo.multipleChoiceAnswers
            }

            const res = await this.questionnaireModel.updateOne({ _id: Types.ObjectId(questionnaireId) }, { $push: { questions: newQuestionForDB }, timestamps: true })
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    }

    updateQuestion = async (files: FilesType, body: { questionId: string, questionInfo: QuestionInfo, filesIds: FilesIdsObject }) => {
        const { questionId, questionInfo, filesIds } = body; // hard coded questionnaire id
        let questionReadyForUpdate: QuestionReadyForUpdate = {
            ...questionInfo,
            categoryId: Types.ObjectId(questionInfo.categoryId),
            updatedAt: new Date(Date.now()),
        }
        try {
            if (filesIds.browserImageId !== undefined) {
                const savedBrowserImagePath = await this.imageService.saveInSize(files, filesIds.browserImageId, 1500);
                questionReadyForUpdate.browserQuestionInfo = { ...questionReadyForUpdate.browserQuestionInfo, imagePaths: [savedBrowserImagePath] };
            }
            if (filesIds.mobileImageId !== undefined) {
                const savedMobileImagePath = await this.imageService.saveInSize(files, filesIds.mobileImageId, 1500);
                questionReadyForUpdate.mobileQuestionInfo = { ...questionReadyForUpdate.mobileQuestionInfo, imagePaths: [savedMobileImagePath] };
            }
            if (filesIds.audioId !== undefined) {
                const savedAudioPath = await this.audioService.save(files, filesIds.audioId);
                questionReadyForUpdate.audioPath = savedAudioPath;
            }
        }
        catch (e) { throw e; }
        let setters = {};
        let changes = {};
        if (questionReadyForUpdate.questionType === QUESTION_TYPES.PSQ) { // add the positions if needed
            setters["questions.$.browserQuestionInfo.correctPositions"] = questionReadyForUpdate.browserQuestionInfo.correctPositions;
            setters["questions.$.browserQuestionInfo.incorrectPositions"] = questionReadyForUpdate.browserQuestionInfo.incorrectPositions;
            setters["questions.$.mobileQuestionInfo.correctPositions"] = questionReadyForUpdate.mobileQuestionInfo.correctPositions;
            setters["questions.$.mobileQuestionInfo.incorrectPositions"] = questionReadyForUpdate.mobileQuestionInfo.incorrectPositions;
            if (questionReadyForUpdate.browserQuestionInfo.imagePaths) {
                setters["questions.$.browserQuestionInfo.imagePaths"] = questionReadyForUpdate.browserQuestionInfo.imagePaths;
            }
            if (questionReadyForUpdate.mobileQuestionInfo.imagePaths) {
                setters["questions.$.mobileQuestionInfo.imagePaths"] = questionReadyForUpdate.mobileQuestionInfo.imagePaths;
            }
            delete questionReadyForUpdate.browserQuestionInfo;
            delete questionReadyForUpdate.mobileQuestionInfo;
            changes[`$unset`] = { "questions.$.multipleChoiceAnswers": "" };
        }
        Object.keys(questionReadyForUpdate).forEach((key) => { setters[`questions.$.${key}`] = questionReadyForUpdate[key]; });
        changes[`$set`] = setters;

        const questionnaireId = "606ada841623e2ba3f789e4c"; // hard coded questionnaire id

        return await this.questionnaireModel.updateOne({ _id: Types.ObjectId(questionnaireId), "questions._id": Types.ObjectId(questionId) }, changes)
    }
    async getQuestionsCorrectIncorrect(filters: Filters = {}, limit?: number): Promise<Array<QuestionData>> {
        try { // ! questionnaireId needed !!
            let aggregation = [];
            const matchQuestionnaireId = matchQuestionnaire(Types.ObjectId(filters.questionnaireId), '_id');
            const unwindQuestions = { $unwind: "$questions" };
            const lookupUserAnswers = {
                $lookup: {
                    from: 'userAnswers',
                    localField: 'questions._id',
                    foreignField: 'questionId',
                    as: 'answers'
                }
            };
            const firstProject = {
                $project: {
                    _id: "$questions._id",
                    questionNumber: "$questions.questionNumber",
                    answers: 1,
                }
            }
            const unwindAnswers = { $unwind: "$answers" };
            const groupByQuestionId = {
                $group: {
                    _id: "$_id",
                    questionNumber: { $first: "$questionNumber" },
                    total: { $sum: 1 },
                    correct: { $sum: { $cond: { if: { $eq: ["$answers.answerStatus", ANSWER_STATUS.CORRECT] }, then: 1, else: 0 } } },
                    avgTime: { $avg: "$answers.answerDuration" }
                }
            };
            const addIncorrectField = {
                $addFields: {
                    incorrect: { $subtract: ["$total", "$correct"] }
                }
            };
            const finalProject = {
                $project: {
                    _id: 0,
                    questionNumber: 1,
                    total: 1,
                    correct: 1,
                    incorrect: 1,
                    avgTime: 1,
                }
            }
            const sortQuestions = { $sort: { questionNumber: 1 } };
            const limitResults = { $limit: limit };
            aggregation.push(matchQuestionnaireId, unwindQuestions, lookupUserAnswers, firstProject, unwindAnswers)
            if (filters.organizationId) {
                //in case the fetch was made by regular admin we will use this match so admin will see only his organization data
                const lookupUsersOrganizationId = {
                    $lookup: {
                        from: 'users',
                        localField: 'answers.userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                }
                //in case the fetch was made by regular admin we will use this match so admin will see only his organization data
                const matchOrganizationId = { $match: { 'user.organizationId': Types.ObjectId(filters.organizationId) } }
                aggregation.push(lookupUsersOrganizationId, matchOrganizationId);
            }
            if (filters.dateRange) { aggregation.push(matchDateRange(filters.dateRange, "answers.createdAt")) };
            aggregation.push(groupByQuestionId, addIncorrectField, finalProject, sortQuestions);
            if (limit) { aggregation.push(limitResults) };
            const results = await this.questionnaireModel.aggregate(aggregation);

            return results;
        } catch (err) {
            return null;
        }
    }

    async getSQQIdsByQuestionNumber(questionnaireId: Types.ObjectId, questionNumber: number): Promise<Types.ObjectId[]> {
        const matchQuestionnaireId = matchQuestionnaire(questionnaireId, '_id');
        const unwindQuestions = { $unwind: "$questions" };
        const matchQuestionNumber = { $match: { questionNumber: questionNumber } };
        const sort = { $sort: { SQQInnerOrder: 1 } };
        const project = { $project: { _id: 1 } };

        const results = await this.questionnaireModel.aggregate([matchQuestionnaireId, unwindQuestions, replaceRootQuestions, matchQuestionNumber, sort, project]);
        return results.map((id) => Types.ObjectId(id._id));
    }

    async getSpecificQuestionData(questionId: string, answerDevice: string, questionnaireId: string): Promise<SpecificQuestionData> {
        try {
            let questionObjectId = new Types.ObjectId(questionId);
            let questionnaireIdObject = new Types.ObjectId(questionnaireId);
            const matchQuestionnaire = { $match: { _id: questionnaireIdObject } }
            const unwindQuestionnaire = { $unwind: "$questions" }
            const matchQuestion = { $match: { _id: questionObjectId } };

            const project = {
                $project: {
                    questionStory: 1,
                    questionInstruction: 1,
                    imagePaths: 1,
                    correctPositions: 1,
                    multipleChoiceAnswers: 1,
                    questionType: 1,
                    ddqPositions: 1,
                }

            }
            const addFields = addFieldsDestructorDevice(isMobile(answerDevice) /* return if mobile */) //return correctPositions, incorrectPosition and image path of the device

            const results = await this.questionnaireModel.aggregate([matchQuestionnaire, unwindQuestionnaire, replaceRootQuestions, matchQuestion, addFields, project])
            results[0].answerDevice = answerDevice;
            let questionInfo = results[0];
            questionInfo = deleteUnnecessaryFields(questionInfo, answerDevice);

            return questionInfo;
        } catch (err) {
            return err
        }
    }
    async getCategoryData(categoryId: Types.ObjectId, questionnaireId: Types.ObjectId) {
        try {
            //todo the data is good but we need to project the data, can be done if adding another curly brackets after first, check web for more
            const matchQuestionnaire = { $match: { _id: questionnaireId } }
            const unwindQuestionnaire = { $unwind: "$questions" }
            const matchCategoryId = { $match: { $and: [{ categoryId: categoryId }, { deleted: { $exists: false } }] } }
            const project = { $project: { _id: 1, questionNumber: 1, SQQInnerOrder: 1 } }
            let aggregation = [];
            aggregation.push(matchQuestionnaire, unwindQuestionnaire, replaceRootQuestions, matchCategoryId, project)
            const categoryData = await this.questionnaireModel.aggregate(aggregation).sort({ questionNumber: 1 })

            return categoryData;
        } catch (err) {
            console.log(err);
        }
    }
    async customDeleteQuestion(questionId: Types.ObjectId) {
        try {
            let res = await this.questionnaireModel.findOneAndUpdate({ "questions._id": questionId }, { $set: { "questions.$.deleted": true } }, { useFindAndModify: false });
            return res
        } catch (err) {
            return err
        }
    }
    async getQuestionnaireQuestions(questionnaireId: Types.ObjectId) {
        try {
            return await this.questionnaireModel.findOne({ _id: questionnaireId });
        } catch (error) {
            return error
        }
    }

    //* here we return all the categories ids and for each we return all the questionsIds 
    async getAllQuestionIdsCategories(questionnaireId: Types.ObjectId): Promise<Array<QuestionIdsCategories>> {
        try {
            //todo the data is good but we need to project the data, can be done if adding another curly brackets after first, check web for more
            const matchQuestionnaire = { $match: { _id: questionnaireId } }
            const unwindQuestionnaire = { $unwind: "$questions" }
            const groupByCategory = {
                $group: {
                    _id: "$categoryId",
                    questionsIdArr: { $push: "$_id" }

                }
            }
            const sort = { $sort: { _id: 1 } }
            let aggregation = [matchQuestionnaire, unwindQuestionnaire, replaceRootQuestions, groupByCategory, sort]
            const categoryData = await this.questionnaireModel.aggregate(aggregation)
            return categoryData;
        } catch (err) {
            console.log(err);
        }
    }

    async getImagePathsForUser(device: string, userId: Types.ObjectId, questionnaireId: Types.ObjectId): Promise<string[]> {
        const answeredQuestionsObject = await this.userAnswerService.answeredQuestionsForUser(String(userId));
        const answeredQuestionsIdsArray = answeredQuestionsObject.map((q) => q.questionId);

        const matchQuestionnaire = { $match: { _id: questionnaireId } };
        const unwindQuestions = { $unwind: "$questions" };

        const matchUnAnsweredQuestions = { $match: { _id: { $nin: answeredQuestionsIdsArray } } };
        const deviceQuestionInfo = (device === DEVICES.BROWSER) ? BROWSER_QUESTION_INFO : MOBILE_QUESTION_INFO;
        const projectImagePath = { $project: { _id: 0, imagePath: `$${deviceQuestionInfo}.imagePaths` } };
        const unwindImagePaths = { $unwind: "$imagePath" };

        const aggregation = [matchQuestionnaire, unwindQuestions, replaceRootQuestions, matchUnAnsweredQuestions, projectImagePath, unwindImagePaths];
        try {
            const imagePathsArr: { imagePath: string }[] = await this.questionnaireModel.aggregate(aggregation);
            const res = imagePathsArr.map(i => i.imagePath);
            return res;
        }
        catch (err) {
            console.log(err);
            return [];
        }
    }

    async getAllQuestionnairesIdAndTitle(): Promise<Array<QuestionnaireData>> {
        //! test

        // const q = (await this.questionnaireModel.findOne({ title: "אוריינות דיגיטלית" })).questions;
        // const findings = q.find(ques => ques.questionStory && ques.questionStory.includes('נחל שיח'));
        // console.log('findings: ', findings);

        //! test

        return this.questionnaireModel.find({}, { _id: 1, title: 1 });
    }

}
