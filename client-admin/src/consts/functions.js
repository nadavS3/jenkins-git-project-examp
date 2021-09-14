import { TIMES, AGES, AGES_VALUE, DGO_LEVELS, DGO_LEVELS_VALUE, DGOLEVEL } from './consts';
import { useRef, useEffect } from 'react';


export const useIsMount = () => {
    const isMountRef = useRef(true);
    useEffect(() => {
        isMountRef.current = false;
    }, []);
    return isMountRef.current;
};


export const millisToMinutesAndSeconds = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}


export const isOverlapping = (newAnswer, otherAnswer) => {
    return !((newAnswer.left > otherAnswer.right || newAnswer.right < otherAnswer.left) ||
        (newAnswer.top > otherAnswer.bottom || newAnswer.bottom < otherAnswer.top))
}

export const extractAgeFromAgeArr = (inputFromAGE) => {
    var i = AGES.indexOf(inputFromAGE);
    return AGES_VALUE[i];
}

export const extractDGOLevelsFromDGOArr = (inputFromDGO) => {
    var i = DGO_LEVELS.indexOf(inputFromDGO);
    return DGO_LEVELS_VALUE[i];
}

export const checkValidation = (valueToCheck, regexp) => {
    if (regexp.test(valueToCheck)) return true;
    else return false;
}

export const extractFamilyStatus = (familyStatus, gender) => {
    switch (familyStatus) {
        case 'SINGLE':
            return gender === 'MALE' ? 'רווק' : 'רווקה';

        case 'DIVORCED':
            return gender === 'MALE' ? 'גרוש' : 'גרושה';

        case 'MARRIED':
            return gender === 'MALE' ? 'נשוי' : 'נשואה';

        case 'WIDOW':
            return gender === 'MALE' ? 'אלמן' : 'אלמנה';

        case 'OTHER':
            return 'אחר';
        default:
            return 'נתון חסר';

    }
}

export const extractDgoLevel = (DGO_L) => {
    switch (DGO_L) {
        case 'UNKNOWN':
            return DGOLEVEL.UNKNOWN
        case 'GOOD':
            return DGOLEVEL.GOOD
        case 'BAD':
            return DGOLEVEL.BAD
        case 'INTERMEDIATE':
            return DGOLEVEL.INTERMEDIATE
        default:
            return 'נתון חסר'
    }
}

export const toFixedIfNecessary = number => {
    return (number % 1 === 0) ? number : number.toFixed(2);
}

const isBetween = (num, low, high) => (num >= low && num <= high);

const checkAnswersArray = answersArray => {
    if (!answersArray.length) { return false }
    let valid = true;
    answersArray.forEach((answer) => {
        if ('top' in answer && 'bottom' in answer && 'left' in answer && 'right' in answer) {
            Object.keys(answer).forEach((key) => {
                if (!isBetween(answer[key], 0, 1)) {
                    valid = false;
                }
            });
        }
        else {
            valid = false;
        }
    })
    return valid;
}

export const checkAllPSQAnswers = allAnswers => {
    const bc = allAnswers.browser.correctArray.length === 1 && checkAnswersArray(allAnswers.browser.correctArray);
    const bi = checkAnswersArray(allAnswers.browser.incorrectArray);
    const mc = allAnswers.mobile.correctArray.length === 1 && checkAnswersArray(allAnswers.mobile.correctArray);
    const mi = checkAnswersArray(allAnswers.mobile.incorrectArray);
    return bc && bi && mc && mi;
}

export const checkAllMCQAnswers = allAnswers => {
    let numOfCorrects = 0;
    let valid = true;
    allAnswers.forEach((answer) => {
        if (!answer.answerValue) { valid = false }
        if (answer.isCorrect) { numOfCorrects++ }
    })
    return valid && (numOfCorrects === 1);
}

export const filesUploaderChecker = (uploadedFiles, fileId, fileType) => {
    try {
        if (typeof fileId !== 'number') { return false; }
        const index = uploadedFiles.findIndex((file) => {
            return file.id === fileId;
        })
        if (uploadedFiles[index] && uploadedFiles[index].file && uploadedFiles[index].file.type && uploadedFiles[index].file.type.startsWith(fileType)) {
            return true;
        }
        return false;
    }
    catch (e) {
        return false;
    }
}

export const displayCustomRange = selectedTimes => {
    const start_dd = String(selectedTimes.startDate.getDate()).padStart(2, '0');
    const start_mm = String(selectedTimes.startDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    const start_yy = selectedTimes.startDate.getYear() - 100;
    const start = start_dd + '/' + start_mm + '/' + start_yy;
    const end_dd = String(selectedTimes.endDate.getDate()).padStart(2, '0');
    const end_mm = String(selectedTimes.endDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    const end_yy = selectedTimes.endDate.getYear() - 100;
    const end = end_dd + '/' + end_mm + '/' + end_yy;
    return start + '-' + end;
}

export const TimeToDateFilter = selectedTime => {
    let startDate = new Date();
    let endDate = new Date();

    if (typeof selectedTime === "string") { // one of the options (not custom)
        startDate.setHours(0, 0, 0, 0);
        switch (selectedTime) {
            case TIMES[0]: // today
                break;
            case TIMES[1]: // yesterday
                startDate.setDate(startDate.getDate() - 1);
                endDate.setHours(0, 0, 0, 0);
                break;
            case TIMES[2]: // last 7 days
                startDate.setDate(startDate.getDate() - 7);
                break;
            case TIMES[3]: // last 28 days
                startDate.setDate(startDate.getDate() - 28);
                break;
            case TIMES[4]: // last 90 days
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                break;
        }
    }
    else {
        startDate.setDate(selectedTime.startDate.getDate());
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(selectedTime.endDate.getDate() + 1);
        endDate.setHours(0, 0, 0, 0);
    }
    return {
        start: startDate,
        end: endDate
    };
}