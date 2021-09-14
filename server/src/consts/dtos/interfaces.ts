import { Types } from "mongoose";
import { QuestionCategory } from "src/schemas/questionCategory.schema";
import { AnswerPositions, AnswerPositionsDDQ, DeviceQuestionInfo, MCQAnswer } from "../classes";
export interface SpecificUserAnswerData {
    questionId: string,
    answerStatus: string,
    answerDuration: number,
    answerPositions?: AnswerPositions
};
export interface SpecificUserData {
    _id?: string
    firstName: string,
    lastName: string,
    age: number,
    gender: string,
    familyStatus: string,
    city: string,
    sector: string,
    organizationName: string,
    DigitalOrientationLevel: string,
    email: string,
    phoneNumber: string,
    totalDuration: number,
    total?: number,
    correct?: number,
    incorrect?: number
};
export interface CityData {
    city: string,
    GOOD: number,
    INTERMEDIATE: number,
    BAD: number,
    total: number
};
export interface QuestionData {
    _id: string,
    total: number,
    correct: number,
    incorrect: number,
    avgTime: number
};
export interface ByGenderData {
    total: number,
    men: number,
    women: number,
    other: number
};
export interface CategoryData {
    _id: string,
    categoryName: string,
    total: number,
    correct: number,
    byGender: Array<{
        gender: string,
        correct: number,
        total: number
    }>
};
export interface AgeRangeData {
    range: {
        low: number,
        high: number
    },
    numberOfGood: number,
    numberOfBad: number,
};
export interface SectorCount {
    sector: string,
    count: number
};
export interface OrganizationCount {
    organization: string,
    count: number
};
export interface SpecificQuestionData {
    _id: string,
    imagePaths: Array<string>,
    questionType: string,
    questionStory?: string,
    questionInstruction?: string
    correctPositions?: Array<AnswerPositions>,
    multipleChoiceAnswers?: MCQAnswer[],
    answerDevice?: string
};
export interface OrganizationData {
    _id?: string,
    organizationName: string,
};
export interface OrganizationDataAndAdmin extends OrganizationData {
    email: string,
};

export interface QuestionInfoReadyForQuestionnaire {
    _id: Types.ObjectId,
    questionType: string,
    audioPath: string,
    questionStory?: string,
    questionInstruction?: string,
    categoryId: Types.ObjectId,
    mobileQuestionInfo: DeviceQuestionInfo,
    browserQuestionInfo: DeviceQuestionInfo,
    multipleChoiceAnswers?: MCQAnswer[],
    questionNumber: number,
    createdAt: Date,
    updatedAt: Date,
    SQQInnerOrder?: number,
};

//  type DDQUserAnswerLabel = {label:string,userAnswerIndex:number}
//  type DDQUserAnswerImage = {imagePath:string,userAnswerIndex:number}
export type DDQUserAnswer = { label: string, userAnswerIndex: number } | { imagePath: string, userAnswerIndex: number }

export type DDQUserAnswer2 = {
    label?: string,
    imagePath?: string,
    userAnswerIndex: number
}

export interface QuestionUnwinded {
    _id: Types.ObjectId,
    questionType: string,
    audioPath: string,
    categoryId: Types.ObjectId,
    questionNumber: number,
    questionStory?: string,
    questionInstruction?: string,
    multipleChoiceAnswers?: MCQAnswer[],
    imagePaths: string[],
    correctPositions?: AnswerPositions[],
    incorrectPositions?: AnswerPositions[],
    ddqPositions?: AnswerPositionsDDQ[],
}

export interface QuestionReadyForUpdate {
    questionType?: string,
    audioPath?: string,
    questionStory?: string,
    questionInstruction?: string,
    categoryId?: Types.ObjectId,
    mobileQuestionInfo?: DeviceQuestionInfo,
    browserQuestionInfo?: DeviceQuestionInfo,
    multipleChoiceAnswers?: MCQAnswer[],
    updatedAt: Date,
};

export interface FilesIdsObject {
    browserImageId?: number,
    mobileImageId?: number,
    audioId?: number,
};

export interface QuestionIdsCategories {
    _id: Types.ObjectId,
    questionsIdArr: Types.ObjectId[]
}

export interface QuestionnaireData {
    _id?: Types.ObjectId, // id must, but made problems
    title: string
}

export interface InitialQuestionnaireInfo {
    totalQuestions: number,
    allQuestionsImagePaths: string[],
    nextQuestionInfo?: QuestionUnwinded | string,
    sqqQuestionsArr?: QuestionUnwinded[] | string,
}