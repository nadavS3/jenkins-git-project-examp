import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DIGITAL_ORIENTATION_LEVEL, Filters, ANSWER_STATUS, matchDateRange, matchAge, matchDigitalOrientationLevel, matchSimpleUser, matchOrganization, matchQuestionnaire } from '../consts/consts';
import { UserService, UserConfig, MailerInterface } from '@hilma/auth-mongo-nest';
import { Admin, AdminUserDocument } from 'src/schemas/admin.schema';
import { CityData, ByGenderData, SpecificUserData, SectorCount, OrganizationCount, SpecificUserAnswerData } from 'src/consts/dtos/interfaces';
import { parse } from 'json2csv';
import { Buffer } from 'buffer';

@Injectable()
export class AdminService extends UserService {
    constructor(
        @Inject('USER_MODULE_OPTIONS')
        protected config_options: UserConfig,
        @InjectModel(Admin.name)
        protected userRepository: Model<AdminUserDocument>,
        protected readonly jwtService: JwtService,
        protected readonly configService: ConfigService,
        @Inject('MailService')
        protected readonly mailer: MailerInterface
    ) {
        super(config_options, userRepository, jwtService, configService, mailer);
    }

    // admin
    async getAllFinished(filters: Filters = {}): Promise<ByGenderData> { // divide by gender
        try {
            let aggregation = [];
            const matchAllFinished = { $match: { $expr: { $ne: ["$DigitalOrientationLevel", "UNKNOWN"] } } };
            const groupByGender = {
                $group: {
                    _id: "$gender",
                    count: { $sum: 1 },
                }
            };
            const projectNoId = {
                $project: {
                    _id: 0,
                    gender: "$_id",
                    count: 1
                }
            };

            if (filters.questionnaireId) { aggregation.push(matchQuestionnaire(Types.ObjectId(filters.questionnaireId), 'questionnaireId')) };
            if (filters.organizationId) { aggregation.push(matchOrganization(Types.ObjectId(filters.organizationId))) };
            if (filters.dateRange) { aggregation.push(matchDateRange(filters.dateRange)) };
            aggregation.push(matchSimpleUser, matchAllFinished, groupByGender, projectNoId);
            const results = await this.userRepository.aggregate(aggregation);
            let objectResult = {
                total: 0,
                men: 0,
                women: 0,
                other: 0
            }
            results.forEach((g) => {
                switch (g.gender) {
                    case "MALE":
                        objectResult.men = g.count
                        break;
                    case "FEMALE":
                        objectResult.women = g.count
                        break;
                    case "OTHER":
                        objectResult.other = g.count
                        break;
                }
            })
            objectResult.total = objectResult.men + objectResult.women + objectResult.other;
            return objectResult;
        }
        catch (err) {
            return null;
        }
    }
    async getNumberUnfinished(filters: Filters = {}): Promise<number> { //number of unfinished
        try {
            let aggregation = [];
            const matchUnfinished = { $match: { DigitalOrientationLevel: "UNKNOWN" } };
            if (filters.questionnaireId) { aggregation.push(matchQuestionnaire(Types.ObjectId(filters.questionnaireId), 'questionnaireId')) };
            if (filters.organizationId) { aggregation.push(matchOrganization(Types.ObjectId(filters.organizationId))) };
            if (filters.dateRange) { aggregation.push(matchDateRange(filters.dateRange)) };
            aggregation.push(matchSimpleUser, matchUnfinished);
            const results = await this.userRepository.aggregate(aggregation);

            return results.length;
        }
        catch (err) {
            return null;
        }
    }
    async getNumberOfUsersWithSpecificLevel(DOLevel: string, filters: Filters = {}): Promise<ByGenderData> { // param:level, divide by gender
        try {
            let aggregation = [];
            const matchSpecificLevel = { $match: { DigitalOrientationLevel: DOLevel } };
            const groupByGender = {
                $group: {
                    _id: "$gender",
                    count: { $sum: 1 }
                }
            };
            const projectNoId = {
                $project: {
                    _id: 0,
                    gender: "$_id",
                    count: 1
                }
            };
            if (filters.questionnaireId) { aggregation.push(matchQuestionnaire(Types.ObjectId(filters.questionnaireId), 'questionnaireId')) };
            if (filters.organizationId) { aggregation.push(matchOrganization(new Types.ObjectId(filters.organizationId))) };
            if (filters.dateRange) { aggregation.push(matchDateRange(filters.dateRange)) };
            aggregation.push(matchSimpleUser, matchSpecificLevel, groupByGender, projectNoId);
            const results = await this.userRepository.aggregate(aggregation);
            let objectResult = {
                total: 0,
                men: 0,
                women: 0,
                other: 0
            }
            results.forEach((g) => {
                switch (g.gender) {
                    case "MALE":
                        objectResult.men = g.count
                        break;
                    case "FEMALE":
                        objectResult.women = g.count
                        break;
                    case "OTHER":
                        objectResult.other = g.count
                        break;
                }
            })
            objectResult.total = objectResult.men + objectResult.women + objectResult.other;
            return objectResult;
        }
        catch (err) {
            return null;
        }
    }
    async getAvgTotalDuration(filters: Filters = {}): Promise<number> { // ? todo add total time
        try {
            let aggregation = [];
            const matchAllFinished = { $match: { $expr: { $ne: ["$DigitalOrientationLevel", "UNKNOWN"] } } };
            const groupTotalDurations = {
                $group: {
                    _id: null,
                    avgTimeForWholeQuestions: { $avg: "$totalDuration" },
                }
            };
            const projectNoId = {
                $project: {
                    _id: 0
                }
            };
            if (filters.questionnaireId) { aggregation.push(matchQuestionnaire(Types.ObjectId(filters.questionnaireId), 'questionnaireId')) };
            if (filters.organizationId) { aggregation.push(matchOrganization(Types.ObjectId(filters.organizationId))) };
            if (filters.dateRange) { aggregation.push(matchDateRange(filters.dateRange)) };
            aggregation.push(matchSimpleUser, matchAllFinished, groupTotalDurations, projectNoId);
            const results = await this.userRepository.aggregate(aggregation);
            if (results.length > 0) { return results[0].avgTimeForWholeQuestions }
            return 0; // no times
        }
        catch (err) {
            return null;
        }
    }
    async getStatsByAge(from: number, to: number, DOLevel: string, filters: Filters = {}): Promise<number> { // params: from, to include both edges, result: "PASS", "FAIL"
        try {
            let aggregation = [];
            const matchLevelAndAge = { $match: { DigitalOrientationLevel: DOLevel, age: { $gte: from, $lte: to } } };
            if (filters.questionnaireId) { aggregation.push(matchQuestionnaire(Types.ObjectId(filters.questionnaireId), 'questionnaireId')) };
            if (filters.organizationId) { aggregation.push(matchOrganization(new Types.ObjectId(filters.organizationId))) };
            if (filters.dateRange) { aggregation.push(matchDateRange(filters.dateRange)) };
            aggregation.push(matchSimpleUser, matchLevelAndAge);
            const results = await this.userRepository.aggregate(aggregation);
            return results.length; // number of users succeed/failed in specific age
        }
        catch (err) {
            return null;
        }
    }
    async getSpecificUserData(userId: string, userAnswers: Array<SpecificUserAnswerData>): Promise<Array<SpecificUserData>> { // params: from, to include both edges, result: "PASS", "FAIL"
        try {
            let userObjectId = new Types.ObjectId(userId);
            const matchById = { $match: { _id: userObjectId } };
            const lookUpOrganization = {
                $lookup: {
                    from: 'organizations',
                    localField: 'organizationId',
                    foreignField: '_id',
                    as: 'organizationData'
                }
            };
            const unwindOrganization = { $unwind: "$organizationData" };
            const lookupQuestionnaire = {
                $lookup: {
                    from: 'questionnaires',
                    localField: 'questionnaireId',
                    foreignField: '_id',
                    as: 'questionnaireInfo'
                }
            };
            const unwindQuestionnaireInfo = { $unwind: "$questionnaireInfo" }
            const firstProject = {
                $project: {
                    DigitalOrientationLevel: 1,
                    totalDuration: 1,
                    gender: 1,
                    familyStatus: 1,
                    sector: 1,
                    age: 1,
                    phoneNumber: 1,
                    email: 1,
                    questionnaireId: 1,
                    city: 1,
                    firstName: 1,
                    lastName: 1,
                    "organizationName": "$organizationData.organizationName",
                    "questionnaireTitle": "$questionnaireInfo.title",
                }
            };
            //*if the user has some answer in userAnwers it goes to the else 
            let aggregation = [];
            aggregation.push(matchById, lookUpOrganization, unwindOrganization, lookupQuestionnaire, unwindQuestionnaireInfo, firstProject);
            let results = (await this.userRepository.aggregate(aggregation))[0];

            results.total = userAnswers.length;
            results.correct = userAnswers.filter(answer => answer.answerStatus === ANSWER_STATUS.CORRECT).length;
            results.incorrect = results.total - results.correct;

            return results
        }
        catch (err) {
            return null;
        }
    }

    async getAllUsersData(filters: Filters = {}, limit: number, skip: number): Promise<SpecificUserData[]> { // partial specific user data
        try {
            const lookupOrganization = {
                $lookup: {
                    from: 'organizations',
                    localField: 'organizationId',
                    foreignField: '_id',
                    as: 'organizationInfo'
                }
            };
            const unwindOrganizationInfo = { $unwind: "$organizationInfo" }
            const lookupQuestionnaire = {
                $lookup: {
                    from: 'questionnaires',
                    localField: 'questionnaireId',
                    foreignField: '_id',
                    as: 'questionnaireInfo'
                }
            };
            const unwindQuestionnaireInfo = { $unwind: "$questionnaireInfo" }
            const project = {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    DigitalOrientationLevel: 1,
                    age: 1,
                    organizationName: "$organizationInfo.organizationName",
                    questionnaireTitle: "$questionnaireInfo.title",
                    city: 1,
                    gender: 1,
                    familyStatus: 1,
                    totalDuration: 1,
                }
            };
            const sortById = { $sort: { "_id": 1 } };
            const skipUsers = { $skip: skip }
            const limitNumberOfUsers = { $limit: limit }
            let aggregation: any[] = [matchSimpleUser];
            if (filters.questionnaireId) { aggregation.push(matchQuestionnaire(Types.ObjectId(filters.questionnaireId), 'questionnaireId')) };
            if (filters.organizationId) { aggregation.push(matchOrganization(Types.ObjectId(filters.organizationId))) }
            if (filters.dateRange) { aggregation.push(matchDateRange(filters.dateRange)) };
            if (filters.digitalOrientationLevel) { aggregation.push(matchDigitalOrientationLevel(filters.digitalOrientationLevel)) };
            if (filters.age) { aggregation.push(matchAge(filters.age)) };
            aggregation.push(lookupOrganization, unwindOrganizationInfo, lookupQuestionnaire, unwindQuestionnaireInfo, project, sortById);
            if (skip) { aggregation.push(skipUsers) }
            if (limit) { aggregation.push(limitNumberOfUsers) }
            let results = await this.userRepository.aggregate(aggregation)
            return results;
        }
        catch (err) {
            console.log('err: ', err);
            return [];
        }
    }

    async getExcel(filters: Filters) {
        try {
            console.log('filters: ', filters);
            let results = await this.getAllUsersData(filters, 0, 0);
            results = results.map((user) => {
                delete user._id;
                // user.durationFixedToMinAndSec = millisToMinutesAndSeconds(user.totalDuration);
                user.totalDuration = user.totalDuration / 1000;
                return user;
            })
            const fields = [
                { value: 'totalDuration', label: 'זמן מילוי השאלון (בשניות)' },
                { value: 'DigitalOrientationLevel', label: 'רמת אוריינות דיגיטלית' },
                { value: 'familyStatus', label: 'מצב משפחתי' },
                { value: 'city', label: 'עיר מגורים' },
                { value: 'age', label: 'גיל' },
                { value: 'gender', label: 'מין' },
                { value: 'lastName', label: 'שם משפחה' },
                { value: 'firstName', label: 'שם פרטי' },
                { value: 'organizationName', label: 'ארגון' },
                { value: 'questionnaireTitle', label: 'שאלון' },
            ]
            const csv = parse(results, { fields })
            let buffer = Buffer.from(csv);
            return buffer;
        }
        catch (err) {
            throw err;
        }
    }

    //? not sure if we need that function
    //maybe because can accepts 3 arguments we need an if to check for each one and then do the querys on the output of the if for efficency
    async getUserData(userId: string) {
        try {
            let aggregation = [];
            const matchUser = { $match: { _id: Types.ObjectId(userId) } };
            aggregation.push(matchUser);
            const results = await this.userRepository.aggregate(aggregation);
            return results;
        }
        catch (err) {
            return null;
        }
    }

    async getStatsBySector(filters: Filters = {}): Promise<Array<SectorCount>> { // divide by sector
        try {
            let aggregation = [];
            const groupBySector = {
                $group: {
                    _id: "$sector",
                    count: { $sum: 1 }
                }
            };
            const project = {
                $project: {
                    _id: 0,
                    sector: "$_id",
                    count: 1,
                }
            };
            if (filters.questionnaireId) { aggregation.push(matchQuestionnaire(Types.ObjectId(filters.questionnaireId), 'questionnaireId')) };
            if (filters.organizationId) { aggregation.push(matchOrganization(Types.ObjectId(filters.organizationId))) };
            if (filters.dateRange) { aggregation.push(matchDateRange(filters.dateRange)) };
            aggregation.push(matchSimpleUser, groupBySector, project);
            const results = await this.userRepository.aggregate(aggregation);
            // make "אחר" last
            const otherIndex = results.findIndex((s) => s.sector === 'אחר');
            if (otherIndex !== -1) {
                const otherSector = results[otherIndex];
                results[otherIndex] = results[results.length - 1];
                results[results.length - 1] = otherSector;
            }

            return results;
        }
        catch (err) {
            return null;
        }
    }
    async getStatsByOrganization(filters: Filters = {}): Promise<Array<OrganizationCount>> { // divide by organization
        try {
            let aggregation = [];
            const lookupOrganizations = {
                $lookup: {
                    from: 'organizations',
                    localField: 'organizationId',
                    foreignField: '_id',
                    as: 'organizationInfo'
                }
            };
            const unwind = { $unwind: "$organizationInfo" };
            const groupByOrganization = {
                $group: {
                    _id: "$organizationId",
                    organization: { $first: "$organizationInfo.organizationName" },
                    count: { $sum: 1 }
                }
            };
            const project = {
                $project: {
                    _id: 0,
                    organization: 1,
                    count: 1,
                    sortField: { $cond: [{ $eq: ["$organization", "אחר"] }, 1, 0] } // if "אחר" : one, else : zero
                }
            };
            const sortOtherLast = { $sort: { sortField: 1 } }
            const projectWithOutSortField = {
                $project: {
                    sortField: 0
                }
            };
            if (filters.questionnaireId) { aggregation.push(matchQuestionnaire(Types.ObjectId(filters.questionnaireId), 'questionnaireId')) };
            if (filters.organizationId) { aggregation.push(matchOrganization(Types.ObjectId(filters.organizationId))) };
            if (filters.dateRange) { aggregation.push(matchDateRange(filters.dateRange)) };
            aggregation.push(matchSimpleUser, lookupOrganizations, unwind, groupByOrganization, project, sortOtherLast, projectWithOutSortField);
            const results = await this.userRepository.aggregate(aggregation);
            return results;
        }
        catch (err) {

            return null;
        }
    }
    async getStatsByCity(filters: Filters = {}, limit?: number): Promise<Array<CityData>> {
        try {
            const matchOnlyFinished = { $match: { "DigitalOrientationLevel": { $ne: DIGITAL_ORIENTATION_LEVEL.UNKNOWN }, $comment: "Don't allow negative inputs." } }
            const groupByCity = {
                $group: {
                    _id: "$city",
                    GOOD: { $sum: { $cond: { if: { $eq: ["$DigitalOrientationLevel", DIGITAL_ORIENTATION_LEVEL.GOOD] }, then: 1, else: 0 } } },
                    INTERMEDIATE: { $sum: { $cond: { if: { $eq: ["$DigitalOrientationLevel", DIGITAL_ORIENTATION_LEVEL.INTERMEDIATE] }, then: 1, else: 0 } } },
                    BAD: { $sum: { $cond: { if: { $eq: ["$DigitalOrientationLevel", DIGITAL_ORIENTATION_LEVEL.BAD] }, then: 1, else: 0 } } },
                    total: { $sum: 1 }
                }
            };
            const project = {
                $project: {
                    _id: 0,
                    city: "$_id",
                    GOOD: 1,
                    INTERMEDIATE: 1,
                    BAD: 1,
                    UNKNOWN: 1,
                    total: 1
                }
            }
            const sortByTotalDesc = { $sort: { total: -1 } };
            const limitResults = { $limit: limit };
            let aggregation = [];
            if (filters.questionnaireId) { aggregation.push(matchQuestionnaire(Types.ObjectId(filters.questionnaireId), 'questionnaireId')) };
            if (filters.organizationId) { aggregation.push(matchOrganization(Types.ObjectId(filters.organizationId))) };
            if (filters.dateRange) { aggregation.push(matchDateRange(filters.dateRange)) };
            aggregation.push(matchOnlyFinished, matchSimpleUser, groupByCity, project, sortByTotalDesc);
            if (limit) { aggregation.push(limitResults) };
            const results = await this.userRepository.aggregate(aggregation)
            return results;
        }
        catch (err) {
            console.log(err);

            return null;
        }
    }
    async countAllUsers(): Promise<number | string> {
        try {
            let aggregation = [];

            aggregation.push(matchSimpleUser)
            const results = await this.userRepository.aggregate(aggregation);
            return results.length;
        } catch (err) {
            return null;
        }
    }

    async getOrganizationIdAdmin(userId: Types.ObjectId): Promise<Types.ObjectId> {
        try {
            const matchUser = { $match: { _id: userId } }
            const projectAllButOrganizationId = {
                $project: {
                    _id: 0,
                    organizationId: 1
                }
            }

            const results = await this.userRepository.aggregate([matchUser, projectAllButOrganizationId]);
            return results[0].organizationId;
        } catch (err) {
            return null;
        }
    }
}
