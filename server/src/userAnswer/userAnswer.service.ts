import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ANSWER_STATUS, CREATED, Filters, matchDateRange, UPDATED, addFieldsDestructorDevice, isMobile, projectNoDevicesQuestionInfo, matchOrganization, matchQuestionnaire, FACT_TYPES } from 'src/consts/consts';
import { CategoryData, SpecificUserAnswerData } from 'src/consts/dtos/interfaces';
import { deleteUnnecessaryFields, lookupQuestionnaire, unwindQuestionInfo } from 'src/consts/funcs';
import { UserAnswerInfo } from 'src/dtos/userAnswer.dto';
import { UserAnswer, UserAnswerDocument } from 'src/schemas/userAnswer.schema';
import { QuestionnaireService } from 'src/questionnaire/questionnaire.service';
import { FactService } from 'src/fact/fact.service'
import { QuestionCategory } from 'src/schemas/questionCategory.schema';
import { QuestionCategoryService } from 'src/questionCategory/questionCategory.service';
import { async } from 'rxjs';

@Injectable()
export class UserAnswerService {
    constructor(
        // private readonly imageService: ImageService,
        // private readonly audioService: AudioService,
        @InjectModel(UserAnswer.name) private userAnswerModel: Model<UserAnswerDocument>,
        @Inject(forwardRef(() => QuestionnaireService))
        private readonly questionnaireService: QuestionnaireService,
        private readonly factService: FactService,
        private readonly questionCategoryService: QuestionCategoryService,
        // @InjectModel()

    ) { }



    //*input:1) userAnswerInfo:questionId ,answerPositions ,answerStatus ,answerDuration 2)userId
    async createUserAnswer(userAnswerInfo: UserAnswerInfo, userId: string, questionnaireId: Types.ObjectId): Promise<string> {

        const oldAnswer = await this.userAnswerModel.findOne({ questionId: userAnswerInfo.questionId, userId: Types.ObjectId(userId) });

        if (oldAnswer) {
            let updateData: any = {
                $set: {
                    "answerStatus": userAnswerInfo.answerStatus,
                    "updatedAt": new Date(Date.now()),
                },
                $inc: {
                    "answerDuration": userAnswerInfo.answerDuration,
                }
            }
            if (userAnswerInfo.answerPositions) { updateData.$set["answerPositions"] = userAnswerInfo.answerPositions }
            const questionNumber = (await this.questionnaireService.fetchByIdBothDevices(Types.ObjectId(userAnswerInfo.questionId))).questionNumber;
            const deletedRes = await this.deleteAllSQQAnswers(Types.ObjectId(userId), questionnaireId, questionNumber);
            const res = await this.userAnswerModel.updateOne({ questionId: userAnswerInfo.questionId, userId: Types.ObjectId(userId) }, updateData)
        }
        else {
            const userAnswerForDB = {
                ...userAnswerInfo,
                userId: userId
            }
            const createdUserAnswer = new this.userAnswerModel(userAnswerForDB); // ready for DB
            try {
                const res = await createdUserAnswer.save();
                await this.handleUserAnswerFact(userAnswerInfo, userId, questionnaireId);

                if (res) { return CREATED }
            }
            catch (err) {
                console.log('err: ', err);
            }
        }
        //*what: goes through all the userAnswers, if the answer id is equal to the id of the question from input, that means if a user skipped a question
        //*we wont create new answer but rather update an existing one
        // for (let i = 0; i < answeredQuestions.length; i++) {
        //     if (String(answeredQuestions[i].questionId) === String(userAnswerInfo.questionId)) {
        //         console.log('toUpdate');
        //         toUpdate = true;
        //         const questionNumber = (await this.questionnaireService.fetchById(Types.ObjectId(userAnswerInfo.questionId), userAnswerInfo.answerDevice)).questionNumber;
        //         await this.deleteAllSQQAnswers(Types.ObjectId(userId), questionnaireId, questionNumber);
        //         break;
        //     }
        // }
        // if (toUpdate) { // todo delete user answers as updating DDQ

        //     let userObjectId = new Types.ObjectId(userId);
        //     let questionId = new Types.ObjectId(userAnswerInfo.questionId)

        //     const match = { $match: { questionId: questionId, userId: userObjectId } }
        //     const updateDataCorrect = {
        //         $set: {
        //             "answerStatus": userAnswerInfo.answerStatus,
        //             "answerDuration": { $sum: ["$answerDuration", userAnswerInfo.answerDuration] }
        //         }
        //     }
        //     const updateDataIncorrect = {
        //         $set: {
        //             "answerStatus": userAnswerInfo.answerStatus,
        //             "answerDuration": { $sum: ["$answerDuration", userAnswerInfo.answerDuration] },
        //             "answerPositions": userAnswerInfo.answerPositions
        //         }
        //     }
        //     let aggregation = [];
        //     aggregation.push(match)
        //     if (!userAnswerInfo.answerPositions) {
        //         aggregation.push(updateDataCorrect)
        //     }
        //     else if (Object.keys(userAnswerInfo.answerPositions).length === 0) { aggregation.push(updateDataCorrect) }
        //     else { aggregation.push(updateDataIncorrect) }
        //     const res = await this.userAnswerModel.aggregate(aggregation);

        //     if (res?.length) {
        //         const deleteUserFromCollection = await this.userAnswerModel.deleteOne({ _id: res[0]._id })
        //         if (!deleteUserFromCollection) { throw "failed to delete userAnswer" }
        //         const insertUpdated = await this.userAnswerModel.insertMany(res[0])
        //         if (!insertUpdated) { throw "failed to update userAnswer" }
        //         if (userAnswerInfo && typeof userAnswerInfo === "object") {

        //             //* Adding updated user answer fact
        //             //! testing
        //             const updateAnswerSuccess = [FACT_TYPES.ANSWER, userAnswerInfo.answerStatus, userAnswerInfo.questionId];
        //             this.factService.addFacts(updateAnswerSuccess, userId);
        //         }
        //         return UPDATED
        //     }
        // }
        // const userAnswerForDB = {
        //     ...userAnswerInfo,
        //     userId: userId
        // }
        // const createdUserAnswer = new this.userAnswerModel(userAnswerForDB); // ready for DB
        // try {
        //     const res = await createdUserAnswer.save();

        //     //! testing 
        //     await this.handleUserAnswerFact(userAnswerInfo, userId, questionnaireId);
        //     if (res) { return CREATED }

        // }
        // catch (err) {
        //     return err;
        // }
    }

    async answeredQuestionsForUser(userId: string): Promise<Array<{ questionId: Types.ObjectId, answerStatus: string }>> { // return array of answered questions for specific user
        return await this.userAnswerModel.find({ userId: userId }, { questionId: 1, answerStatus: 1, _id: 0, updatedAt: 1 }).sort({ updatedAt: 1 });
    }

    async getUserResults(userId: string, questionnaireId: Types.ObjectId) {

        let userObjectId = new Types.ObjectId(userId);

        const matchUser = { $match: { userId: userObjectId } };
        const addFieldQuestionnaireId = { $addFields: { questionnaireId: questionnaireId } };
        const project1 = {
            $project: {
                answerStatus: 1,
                question: {
                    $filter: {
                        input: "$questionInfo.questions",
                        as: "question",
                        cond: { $eq: ["$$question._id", "$questionId"] }
                    }
                }
            }
        };
        const project2 = {
            $project: {
                answerStatus: 1,
                "question.categoryId": 1,
                "question.questionNumber": 1,
                "question.SQQInnerOrder": 1,
            }
        };
        const unwindQuestion = { $unwind: "$question" };
        const sortByQuestionNumberAndSQQOrder = { $sort: { "question.questionNumber": 1, "question.SQQInnerOrder": 1 } };
        const groupByQuestionNumber = {
            $group: {
                _id: "$question.questionNumber",
                categoryId: { $first: "$question.categoryId" }, // all the same
                answerStatus: { $last: "$answerStatus" }, // as last answer
            }
        };
        const groupByCategory = {
            $group: {
                _id: "$categoryId",
                numberOfQuestions: { $sum: 1 },
                correctAnswers: { $sum: { $cond: { if: { $eq: ["$answerStatus", ANSWER_STATUS.CORRECT] }, then: 1, else: 0 } } }
            }
        };
        const lookupQuestionCategories = {
            $lookup: {
                from: "questionCategories",
                localField: "_id",
                foreignField: "_id",
                as: "categoryInfo"
            }
        };
        const unwindCategoryInfo = { $unwind: "$categoryInfo" };
        const project3 = {
            $project: {
                "_id": "$categoryInfo._id",
                "categoryName": "$categoryInfo.categoryName",
                "courseLink": "$categoryInfo.courseLink",
                "iconPath": "$categoryInfo.iconPath",
                "correctAnswers": 1,
                "numberOfQuestions": 1,
            }
        };
        const sort = { $sort: { _id: 1 } };

        let aggregation = [
            matchUser,
            addFieldQuestionnaireId,
            lookupQuestionnaire,
            unwindQuestionInfo,
            project1,
            project2,
            unwindQuestion,
            sortByQuestionNumberAndSQQOrder,
            groupByQuestionNumber,
            groupByCategory,
            lookupQuestionCategories,
            unwindCategoryInfo,
            project3,
            sort
        ]
        let results = await this.userAnswerModel.aggregate(aggregation);

        return results; // array of categories including name, correct answers and num of questions
    }

    async getSpecificUserAnswers(userId: string, questionnaireId: Types.ObjectId): Promise<Array<SpecificUserAnswerData>> { // params: from, to include both edges, result: "PASS", "FAIL"
        try {
            let userObjectId = new Types.ObjectId(userId);

            const matchUser = { $match: { userId: userObjectId } };
            const addQuestionnaireIdField = { $addFields: { questionnaireId: questionnaireId } }
            const unwindQuestionInfo = { $unwind: "$questionInfo" };

            const projectFirst = {
                $project: {
                    questionId: 1,
                    answerPositions: 1,
                    answerDuration: 1,
                    answerStatus: 1,
                    multipleChoiceAnswerId: 1,
                    answerIndexDDQ: 1,
                    answerDevice: 1,
                    questionInfo: {
                        $filter: {
                            input: "$questionInfo.questions",
                            as: "question",
                            cond: { $eq: ["$$question._id", "$questionId"] }
                        }
                    }
                }
            };

            const project = {
                $project: {
                    answerPositions: 1,
                    answerDuration: 1,
                    answerStatus: 1,
                    answerIndexDDQ: 1,
                    multipleChoiceAnswerId: 1,
                    answerDevice: 1,
                    "categoryId": "$questionInfo.categoryId",
                    "questionId": "$questionInfo._id",
                    "questionNumber": "$questionInfo.questionNumber",
                    "questionSQQOrder": "$questionInfo.SQQInnerOrder",
                }
            };
            const sort = { $sort: { questionNumber: 1 } };

            let aggregation = [matchUser, addQuestionnaireIdField, lookupQuestionnaire, unwindQuestionInfo, projectFirst, unwindQuestionInfo, project, sort]

            let results = await this.userAnswerModel.aggregate(aggregation)

            return results; // number of users succeed/failed in specific age
        }
        catch (err) {
            console.log(err);

            return null;
        }
    }

    // admin funcs
    async getStatsByCategories(filters: Filters = {}): Promise<Array<CategoryData>> {
        try {
            let aggregation = [];
            const lookupQuestions = {
                $lookup: {
                    from: "questionnaires",
                    localField: "questionId",
                    foreignField: "questions._id",
                    as: "questionnaireInfo"
                }
            };
            const unwindQuestionnaireInfo = { $unwind: "$questionnaireInfo" };
            const projectGetQuestion = {
                $project: {
                    _id: 1,
                    questionId: 1,
                    userId: 1,
                    answerDevice: 1,
                    answerStatus: 1,
                    answerDuration: 1,
                    // createdAt: 1,
                    // updatedAt: 1,
                    answerPositions: 1,
                    questionInfo: {
                        $filter: {
                            input: "$questionnaireInfo.questions",
                            as: "question",
                            cond: { $eq: ["$$question._id", "$questionId"] }
                        }
                    }
                }
            }
            const lookupQuestionCategories = {
                $lookup: {
                    from: "questionCategories",
                    localField: "questionInfo.categoryId",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            };
            const unwindCategoryInfo = { $unwind: "$categoryInfo" };
            const lookupUsers = {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userInfo"
                }
            };
            const unwindUserInfo = { $unwind: "$userInfo" };
            const groupByCategoryAndGender = {
                $group: {
                    _id: { categoryId: "$questionInfo.categoryId", gender: "$userInfo.gender" },
                    categoryName: { $first: "$categoryInfo.categoryName" },
                    total: { $sum: 1 },
                    correct: { $sum: { $cond: { if: { $eq: ["$answerStatus", ANSWER_STATUS.CORRECT] }, then: 1, else: 0 } } }
                },
            };
            const secondGroup = {
                $group: {
                    _id: "$_id.categoryId",
                    categoryName: { $first: "$categoryName" },
                    total: { $sum: "$total" },
                    correct: { $sum: "$correct" },
                    byGender: { $push: { gender: "$_id.gender", correct: "$correct", total: "$total" } }
                }
            };
            const sortById = { $sort: { _id: 1 } };
            if (filters.dateRange) { aggregation.push(matchDateRange(filters.dateRange)) };
            aggregation.push(lookupQuestions, unwindQuestionnaireInfo);
            if (filters.questionnaireId) {
                const matchQuestionnaireId = matchQuestionnaire(new Types.ObjectId(filters.questionnaireId), 'questionnaireInfo._id')
                aggregation.push(matchQuestionnaireId)
            }
            aggregation.push(projectGetQuestion, unwindQuestionInfo, lookupQuestionCategories, unwindCategoryInfo, lookupUsers, unwindUserInfo);
            if (filters.organizationId) {
                const matchOrganizationId = matchOrganization(new Types.ObjectId(filters.organizationId), 'userInfo.organizationId')
                aggregation.push(matchOrganizationId)
            }
            aggregation.push(groupByCategoryAndGender, secondGroup, sortById)
            const results = await this.userAnswerModel.aggregate(aggregation);
            return results;

        }
        catch (err) {
            console.log(err);

            return null;
        }
    }

    //*1) we sort by userId to use the index of userId in userAnswers. 2)we group by users. 3)we get on each user the user data. 4+5) we unwind that data .6) we group by the questionId 
    //* so we get for each question the id, total,total correct and correct answers divided by gender (thx to our users lookup) 
    async getStatsByCategoryNew(questionsByCategory, filters: Filters = {}): Promise<Array<CategoryData>> {
        let aggregation = [];
        try {
            const sort = {
                $sort: { userId: 1 }
            }
            const groupByUser = {
                $group: {
                    _id: "$userId",
                    userAnswersArr: { $push: "$$ROOT" }
                }
            }
            const lookupUserData = {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userData'
                }
            }
            const unwindUser = { $unwind: "$userData" }
            const unwindUserAnswer = { $unwind: "$userAnswersArr" }

            const groupByQuestionId = {
                $group: {
                    _id: "$userAnswersArr.questionId",
                    total: { $sum: 1 },
                    correct: { $sum: { $cond: { if: { $eq: ["$userAnswersArr.answerStatus", ANSWER_STATUS.CORRECT] }, then: 1, else: 0 } } },
                    correctMale: { $sum: { $cond: { if: { $and: [{ $eq: ["$userAnswersArr.answerStatus", ANSWER_STATUS.CORRECT] }, { $eq: ["$userData.gender", "MALE"] }] }, then: 1, else: 0 } } },
                    totalMale: { $sum: { $cond: { if: { $eq: ["$userData.gender", "MALE"] }, then: 1, else: 0 } } },
                    totalFemale: { $sum: { $cond: { if: { $eq: ["$userData.gender", "FEMALE"] }, then: 1, else: 0 } } },
                    totalOther: { $sum: { $cond: { if: { $eq: ["$userData.gender", "OTHER"] }, then: 1, else: 0 } } },
                    correctFemale: { $sum: { $cond: { if: { $and: [{ $eq: ["$userAnswersArr.answerStatus", ANSWER_STATUS.CORRECT] }, { $eq: ["$userData.gender", "FEMALE"] }] }, then: 1, else: 0 } } },
                    correctOther: { $sum: { $cond: { if: { $and: [{ $eq: ["$userAnswersArr.answerStatus", ANSWER_STATUS.CORRECT] }, { $eq: ["$userData.gender", "OTHER"] }] }, then: 1, else: 0 } } },
                }
            }
            aggregation.push(sort)
            if (filters.dateRange) { aggregation.push(matchDateRange(filters.dateRange)) };
            aggregation.push(groupByUser, lookupUserData, unwindUser)
            if (filters.questionnaireId) {
                //* not 100 percent sure about the data correctness after this much when their are multiple questionnaires(more than 2)
                const matchQuestionnaireId = matchQuestionnaire(Types.ObjectId(filters.questionnaireId), 'userData.questionnaireId')
                aggregation.push(matchQuestionnaireId)
            }
            if (filters.organizationId) {
                const matchOrganizationId = matchOrganization(Types.ObjectId(filters.organizationId), 'userData.organizationId')
                aggregation.push(matchOrganizationId)
            }
            aggregation.push(unwindUserAnswer, groupByQuestionId)
            let finalResults: Array<CategoryData>;
            const results = await this.userAnswerModel.aggregate(aggregation);

            const finalData: Array<CategoryData> = questionsByCategory.map(category => {
                let categoryObj = {
                    _id: category._id,
                    categoryName: category.categoryName,
                    correct: 0,
                    total: 0,
                    byGender: [
                        { gender: "MALE", correct: 0, total: 0 },
                        { gender: "FEMALE", correct: 0, total: 0 },
                        { gender: "OTHER", correct: 0, total: 0 }
                    ]
                }
                category.questionsIdArr.map(questionId => {
                    results.map(groupedQuestion => {
                        if (String(questionId) === String(groupedQuestion._id)) {
                            categoryObj.total += groupedQuestion.total;
                            categoryObj.correct += groupedQuestion.correct;
                            categoryObj.byGender[0].correct += groupedQuestion.correctMale;
                            categoryObj.byGender[0].total += groupedQuestion.totalMale;
                            categoryObj.byGender[1].correct += groupedQuestion.correctFemale;
                            categoryObj.byGender[1].total += groupedQuestion.totalFemale;
                            categoryObj.byGender[2].correct += groupedQuestion.correctOther;
                            categoryObj.byGender[2].total += groupedQuestion.totalOther;
                        }
                    })
                })
                //*if the gender has no answers at all remove him
                categoryObj.byGender = categoryObj.byGender.filter(genderStats => genderStats.total)
                return categoryObj
            })
            //* if the category don't have any answers in total we remove it
            finalResults = (finalData.filter(categoryStats => categoryStats.total))
            return finalResults;
        } catch (err) {
            console.log(err);
            return err
        }
    }

    //this function gets all the correct answeres (positions, and the question's info) to all the questions the user answered incorrectly
    async getQuestionsReview(userId: string, device: string, questionnaireId: Types.ObjectId) {

        const match = { $match: { userId: Types.ObjectId(userId), 'answerStatus': { $in: [ANSWER_STATUS.INCORRECT, ANSWER_STATUS.SKIPPED] } } };
        const addQuestionnaireIdField = { $addFields: { questionnaireId: questionnaireId } }
        const project1 = {
            $project: {
                _id: 1,
                'answerPositions': 1,
                questionId: 1,
                questionInfo: {
                    $filter: {
                        input: "$questionInfo.questions",
                        as: "question",
                        cond: { $eq: ["$$question._id", "$questionId"] }
                    }
                },
                multipleChoiceAnswerId: 1,
                answerIndexDDQ: 1
            }
        }
        const sort = { $sort: { 'questionInfo.questionNumber': 1 } }
        const project = {
            $project: {
                '_id': '$questionInfo._id',
                'answerPositions': 1,
                'answerIndexDDQ': 1,
                'multipleChoiceAnswerId': 1,
                'mobileQuestionInfo': '$questionInfo.mobileQuestionInfo',
                'questionStory': '$questionInfo.questionStory',
                'multipleChoiceAnswers': "$questionInfo.multipleChoiceAnswers",
                'questionInstruction': '$questionInfo.questionInstruction',
                'browserQuestionInfo': '$questionInfo.browserQuestionInfo',
                'audioPath': '$questionInfo.audioPath',
                'questionNumber': '$questionInfo.questionNumber',
                'questionType': '$questionInfo.questionType'
            }
        };
        const addFields = addFieldsDestructorDevice(isMobile(device));
        const projectRemoveDevices = projectNoDevicesQuestionInfo; // removes mobile/browser question info
        // const aggregation = [match, lookup, unwind, sort, project, addFields, projectRemoveDevices];
        const aggregation = [match, addQuestionnaireIdField, lookupQuestionnaire, unwindQuestionInfo, project1, unwindQuestionInfo, sort, project, addFields, projectRemoveDevices];
        const results = await this.userAnswerModel.aggregate(aggregation);

        results.forEach((questionInfo) => { deleteUnnecessaryFields(questionInfo, device) })
        return results;
    }

    async deleteAllSQQAnswers(userId: Types.ObjectId, questionnaireId: Types.ObjectId, questionNumber: number) {
        const SQQIds = await this.questionnaireService.getSQQIdsByQuestionNumber(questionnaireId, questionNumber);
        SQQIds.shift(); // remove first.
        return await this.userAnswerModel.deleteMany({ userId: userId, questionId: { $in: SQQIds } });
    }

    async handleUserAnswerFact(userAnswerInfo: UserAnswerInfo, userId: string, questionnaireId: Types.ObjectId) {
        //* Adding answer info to fact table
        if (!userId || !userAnswerInfo || !userAnswerInfo.questionId || !['string', 'object'].includes(typeof userAnswerInfo.questionId) || !userAnswerInfo.answerDevice) {
            console.log("didn't create userAnswerInfo facts. userAnswerInfo: ", userAnswerInfo, "userId: ", userId);
            return
        };

        try {
            const questionInfo = await this.questionnaireService.fetchById(Types.ObjectId(userAnswerInfo.questionId), userAnswerInfo.answerDevice);

            if (!questionInfo || typeof questionInfo !== 'object') return;

            let category = await this.questionCategoryService.returnCategoryById(questionInfo.categoryId);

            if (!category) {
                console.log("in function: handleUserAnswerFact: no category", "\n userAnswerInfo:", userAnswerInfo, "userId: ", userId);
                return
            }
            const factRows = [
                [FACT_TYPES.CATEGORY, category.categoryName, category["_id"]], //questionCategory
                [FACT_TYPES.TYPE_OF_QUESTION, questionInfo.questionType], //questionType
                [FACT_TYPES.ANSWER, userAnswerInfo.answerStatus, userAnswerInfo.questionId], //userAnswerSuccess
                [FACT_TYPES.ORDER, questionInfo.questionNumber] //questionOrder
            ];
            this.factService.addFacts(factRows, userId);
        } catch (error) {
            console.log('error in handleUserAnswerFact ', error);
        }
    };

    async logAllUserAnswers(userId: Types.ObjectId) {
        const res = await this.userAnswerModel.find({ userId: userId });
        console.log("****************************");
        res.forEach(async (ua) => {
            let { questionNumber, SQQInnerOrder } = await this.questionnaireService.fetchByIdBothDevices(ua.questionId);
            console.log(questionNumber, SQQInnerOrder, ua.answerStatus);
        })
        console.log("****************************");
    }

    // async updateManyUserAnsweredToSkipped(userId: string, questionNumber: number) {
    //     const questionnaireId = new Types.ObjectId("606ada841623e2ba3f789e4c");
    //     const aggregation = [
    //         { $match: { userId: Types.ObjectId(userId) } },
    //         { $addFields: { questionnaireId } },
    //         {
    //             $lookup: {
    //                 from: "questionnaires", let: { questionId: "$questionId" },
    //                 pipeline: [{ $match: { $expr: { $eq: ["$_id", questionnaireId] } } },
    //                 {
    //                     $project: {
    //                         _id: 0, question:
    //                             { $filter: { input: "$questions", as: "question", cond: { $eq: ["$$question._id", "$$questionId"] } } }
    //                     }
    //                 },
    //                 { $unwind: "$question" },
    //                 { $replaceWith: "$question" }
    //                 ],
    //                 as: "questionInfo"
    //             }
    //         },
    //         { $unwind: "$questionInfo" },
    //         { $project: { answerStatus: 1, questionId: 1, questionNumber: "$questionInfo.questionNumber" } },
    //     ]
    //     const res = await this.userAnswerModel.aggregate(aggregation); //get all user answers 
    //     //all the question ids from userAnswer that fit to questionNumber
    //     const questionIds = [];

    //     for (let i = 0; i < res.length; i++) {
    //         const userAnswer = res[i];
    //         if (userAnswer.questionNumber === questionNumber) questionIds.push(userAnswer.questionId);
    //     }
    //     await this.userAnswerModel.updateMany({ userId: Types.ObjectId(userId), questionId: { $in: questionIds } }, { answerStatus: ANSWER_STATUS.UNANSWERED })
    // }
};