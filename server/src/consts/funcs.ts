import { isDateString } from "class-validator";
import { DeviceQuestionInfo, MCQAnswer } from "./classes";
import { BROWSER_QUESTION_INFO, DEVICES, DIGITAL_ORIENTATION_LEVEL, Filters, isBetween, MOBILE_QUESTION_INFO, QUESTION_TYPES } from "./consts";
import { QuestionUnwinded } from "./dtos/interfaces";
import { questionInfoRegExp } from "./RegExps";

export const checkFilters = (filters: Filters): boolean => {

    if (filters.dateRange &&
        (!isDateString(filters.dateRange.start) || !isDateString(filters.dateRange.end))) {
        return false;
    }
    if (filters.digitalOrientationLevel &&
        Object.values(DIGITAL_ORIENTATION_LEVEL).indexOf(filters.digitalOrientationLevel) === -1) {
        return false;
    }
    if (filters.age && (filters.age.low < 18 || filters.age.high > 200)) {
        return false;
    }
    return true;
}
export const replaceRootQuestions = { $replaceWith: "$questions" }

export const deleteUnnecessaryFields = (questionInfo, device: string) => {
    if (questionInfo.questionType === QUESTION_TYPES.PSQ) {
        delete questionInfo.multipleChoiceAnswers;
        delete questionInfo.ddqPositions;
    }
    else if (questionInfo.questionType === QUESTION_TYPES.MCQ) {
        delete questionInfo.ddqPositions;
        delete questionInfo.correctPositions;
        delete questionInfo.incorrectPositions;
    } else if (questionInfo.questionType === QUESTION_TYPES.DDQ) {
        delete questionInfo.multipleChoiceAnswers;
        if (device === DEVICES.BROWSER) {
            delete questionInfo.correctPositions;
            delete questionInfo.incorrectPositions;
        } else {
            delete questionInfo.ddqPositions;
            questionInfo.questionType = QUESTION_TYPES.PSQ; //* in mobile: DDQ question appears as PSQ !
        }
    }
    return questionInfo;
}

export const millisToMinutesAndSeconds = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (Number(seconds) < 10 ? '0' : '') + seconds;
}

export const getUserQuestionnaire = (userId: string) => { }




//! an alternative way to query in one lookup the question from questionModel 
const questionnaireId = "someid"
const lookupQuestionInfo = {
    $lookup: {
        from: "questionnaires",
        let: { questionId: "$questionId" },
        pipeline: [
            {
                $match: {
                    $expr: { $eq: ["$_id", questionnaireId] }

                }
            },
            {
                $project: {
                    _id: 0,
                    question: {
                        $filter: {
                            input: "$questions",
                            as: "question",
                            cond: { $eq: ["$$question._id", "$$questionId"] }
                        }
                    }
                }
            },
            {
                $unwind: "$question"
            },
            {
                $replaceWith: "$question"
            }
        ],
        as: "questionInfo"
    }
};

export const checkPSQAnswers = (devicesQuestionInfo: DeviceQuestionInfo[]): boolean => {
    try {
        devicesQuestionInfo.forEach(dqi => {
            if (dqi.correctPositions && dqi.correctPositions.length === 1) {
                dqi.correctPositions.map((correctPosition) => { // for every correct position in the array
                    if ("top" in correctPosition && "bottom" in correctPosition && "left" in correctPosition && "right" in correctPosition) {
                        Object.keys(correctPosition).forEach((key) => {
                            if (!isBetween(correctPosition[key], 0, 1)) { throw Error("problem with correctPositions") }
                        });
                    }
                    else { throw Error("problem with correctPositions") }
                })
            } else { throw Error("problem with correctPositions") }

            if (dqi.incorrectPositions && dqi.incorrectPositions.length) {
                dqi.incorrectPositions.map((incorrectPosition) => { // for every correct position in the array
                    if ("top" in incorrectPosition && "bottom" in incorrectPosition && "left" in incorrectPosition && "right" in incorrectPosition) {
                        Object.keys(incorrectPosition).forEach((key) => {
                            if (!isBetween(incorrectPosition[key], 0, 1)) { throw Error("problem with incorrectPositions") }
                        });
                    }
                    else { throw Error("problem with incorrectPositions") }
                })
            } else { throw Error("problem with incorrectPositions") }
        });
        return true;
    }
    catch (e) { return false; }
}

export const checkMCQAnswers = (multipleChoiceAnswers: MCQAnswer[]): boolean => {
    try {
        let numOfCorrects = 0;
        multipleChoiceAnswers.forEach((answer) => {
            if (!answer.answerValue) { throw Error("problem with MCQAnswers") }
            if (answer.isCorrect) { numOfCorrects++ }
        })
        if (numOfCorrects !== 1) { throw Error("problem with MCQAnswers") }
        return true;
    }
    catch (e) { return false; }
}

export const checkStoryAndInstruction = (story: string, instruction: string): boolean => {
    try {
        if (!story && !instruction) { throw Error("no story/instruction") }
        if (story) {
            const checkStory = questionInfoRegExp.test(story)
            if (!checkStory) { throw Error("problem with story") }
            if (story.length > 400) { throw Error("story too long") }
        }
        if (instruction) {
            const checkInstruction = questionInfoRegExp.test(instruction)
            if (!checkInstruction) { throw Error("problem with instruction") }
            if (instruction.length > 400) { throw Error("instruction too long") }
        }
        return true;
    }
    catch (e) { return false; }
}

export const lookupQuestionnaire = {
    $lookup: {
        from: "questionnaires",
        localField: "questionnaireId",
        foreignField: "_id",
        as: "questionInfo"
    }
}

export const unwindQuestionInfo = { $unwind: "$questionInfo" };

export const destructorDeviceJS = (questionInfo, device: string): QuestionUnwinded => {
    let deviceLessQuestionInfo = { ...questionInfo };
    delete deviceLessQuestionInfo.mobileQuestionInfo;
    delete deviceLessQuestionInfo.browserQuestionInfo;
    const deviceQuestionInfo = device === DEVICES.BROWSER ? BROWSER_QUESTION_INFO : MOBILE_QUESTION_INFO;
    Object.entries(questionInfo[deviceQuestionInfo]).forEach(([key, value]) => {
        deviceLessQuestionInfo[key] = value;
    })
    return deviceLessQuestionInfo;
}