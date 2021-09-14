import { Model, Types } from 'mongoose';

export const NO_MORE_QUESTIONS_MESSAGE: string = "there are no more questions";

export const ANSWER_STATUS = {
    SKIPPED: "SKIPPED",
    CORRECT: "CORRECT",
    INCORRECT: "INCORRECT",
    UNANSWERED: "UNANSWERED",
    ANSWERED: "ANSWERED"
}
export const FAILED_CREATING_QUESTION: string = "failed creating question";

export const QUESTION_CREATED: string = "question created suscssesfully";

export const DIGITAL_ORIENTATION_LEVEL = {
    GOOD: "GOOD",
    INTERMEDIATE: "INTERMEDIATE",
    BAD: "BAD",
    UNKNOWN: "UNKNOWN"
}

export const PERSONAL_INFO_ERROR: string = "one of the field in personal info was not valid";
export const DATA_NOT_FOUND: string = "שגיאה במציאת הנתונים";
export const INVALID_USER_ID: string = "userId is not valid";
export const INVALID_QUESTION_ID: string = "questionId is not valid";
export const ERROR: string = "ERROR";
export const NEW_CATEGORY_ERROR: string = "one of the field in the new category info was not valid"

export const CREATED: string = "CREATED";
export const UPDATED: string = "UPDATED";

export const QUESTION_TYPES = {
    MCQ: "MULTIPLE CHOICE",
    PSQ: "PLACE SELECTION",
    DDQ: "DRAG AND DROP"
}

export type Filters = {
    dateRange?: {
        start: Date,
        end: Date,
    },
    digitalOrientationLevel?: string,
    age?: {
        low: number,
        high: number,
    },
    organizationId?: string,
    questionnaireId?: string,
};

export const matchDateRange = (dateRangeFilter: { start: Date, end: Date }, created: string = "createdAt") => { return { $match: { [created]: { $gte: new Date(dateRangeFilter.start), $lte: new Date(dateRangeFilter.end) } } } };
export const matchDigitalOrientationLevel = (DOFilter: string, digitalOrientationLevel: string = "DigitalOrientationLevel") => { return { $match: { [digitalOrientationLevel]: DOFilter } } };
export const matchAge = (ageFilter: { low: number, high: number }, age: string = "age") => { return { $match: { [age]: { $gte: ageFilter.low, $lte: ageFilter.high } } } };
export const matchOrganization = (organizationIdFilter: Types.ObjectId, organizationId: string = 'organizationId') => { return { $match: { [organizationId]: organizationIdFilter } } }
export const matchQuestionnaire = (questionnaireIdFilter: Types.ObjectId, questionnaireId: string = '_id') => { return { $match: { [questionnaireId]: questionnaireIdFilter } } }
export const matchSimpleUser = { $match: { "roles.name": "SIMPLEUSER" } };
export const addFieldsDestructorDevice = (mobileDevice: boolean) => {
    const deviceQuestionInfo = (mobileDevice) ? MOBILE_QUESTION_INFO : BROWSER_QUESTION_INFO;
    const $addFields: any = {
        imagePaths: `$${deviceQuestionInfo}.imagePaths`,
        multipleChoiceAnswers: { $cond: [{ $eq: [`$questionType`, QUESTION_TYPES.MCQ] }, '$multipleChoiceAnswers', null] },
    }
    if (mobileDevice) {
        $addFields.correctPositions = { $cond: [{ $in: [`$questionType`, [QUESTION_TYPES.PSQ, QUESTION_TYPES.DDQ]] }, `$${MOBILE_QUESTION_INFO}.correctPositions`, null] };
        $addFields.incorrectPositions = { $cond: [{ $in: [`$questionType`, [QUESTION_TYPES.PSQ, QUESTION_TYPES.DDQ]] }, `$${MOBILE_QUESTION_INFO}.incorrectPositions`, null] };
    } else { // browser
        $addFields.correctPositions = { $cond: [{ $eq: [`$questionType`, QUESTION_TYPES.PSQ] }, `$${BROWSER_QUESTION_INFO}.correctPositions`, null] };
        $addFields.incorrectPositions = { $cond: [{ $eq: [`$questionType`, QUESTION_TYPES.PSQ] }, `$${BROWSER_QUESTION_INFO}.incorrectPositions`, null] };
        $addFields.ddqPositions = { $cond: [{ $eq: [`$questionType`, QUESTION_TYPES.DDQ] }, `$${BROWSER_QUESTION_INFO}.ddqPositions`, null] };
    }
    return { $addFields };
}



export const MOBILE_QUESTION_INFO = "mobileQuestionInfo";
export const BROWSER_QUESTION_INFO = "browserQuestionInfo";
export const projectNoDevicesQuestionInfo = { $project: { [BROWSER_QUESTION_INFO]: 0, [MOBILE_QUESTION_INFO]: 0 } }


export const isBetween = (num: number, low: number, high: number): boolean => (num >= low && num <= high);

export const DEVICES = {
    MOBILE: "MOBILE",
    BROWSER: "BROWSER"
};
export const isMobile = (device: string): boolean => (device === DEVICES.MOBILE);

export const FACT_TYPES = {
    USER_NAME: 'user_name',
    GENDER: 'gender',
    AGE: 'age',
    CITY: 'city',
    SECTOR: 'sector',
    FAMILY_STATUS: 'family_status',
    ORGANIZATION: 'organization',
    QUESTIONNAIRE: 'questionnaire',
    DIGITAL_ORIENTATION: 'digital_orientation',
    CATEGORY: 'category',
    TYPE_OF_QUESTION: 'type_of_question',
    ANSWER: 'answer',
    ORDER: 'order'
}