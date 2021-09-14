export const ANSWER_STATUS = {
    SKIPPED: "SKIPPED",
    CORRECT: "CORRECT",
    INCORRECT: "INCORRECT",
    UNANSWERED: "UNANSWERED",
    ANSWERED: "ANSWERED"
}
export const PAGE_NUMBERS = {
    INTRODUCTION_PAGE: 0,
    ORGANIZATION_PAGE: 1,
    PERSONAL_DATA_PAGE: 2,
    SECTOR_PAGE: 3,
    INSTRUCTION_PAGE: 4,
    QUESTION_PAGE: 5,
}


export const QUESTION_TYPES = {
    MCQ: "MULTIPLE CHOICE",
    PSQ: "PLACE SELECTION",
    DDQ: "DRAG AND DROP"
};

export const DRAGGABLE_ITEMS_TYPE = {
    DRAGGABLE_STRING: "draggableString",
    DRAGGABLE_IMG: "draggableImg",
    DRAGGABLE_ELEM: "draggableElem"


}

export const POP_UP_MESSAGE_PROBLEM = "אירעה שגיאה, אנא נסו שנית מאוחר יותר"
export const NO_MORE_QUESTIONS_MESSAGE = "there are no more questions";
export const CANT_GO_TO_ANSWERED_QUESTION_MSG = "לא ניתן לחזור לשאלות עליהן כבר ענית";

export const indexToText = (index) => { // * might need to update
    switch (index) {
        case 1:
            return "ראשון";
        case 2:
            return "שני";
        case 3:
            return "שלישי";
        case 4:
            return "רביעי";
        case 5:
            return "חמישי";
        case 6:
            return "שישי";
        case 7:
            return "שביעי";
        case 8:
            return "שמיני";
        default:
            return ""
    }
}

export const CREATED = "CREATED";
export const UPDATED = "UPDATED";

export const audioImgSrcs = { first: '/icons/Icon-volume-up.svg', replay: '/icons/audio-icon.svg', pause: '/icons/pause.svg' }

export const DEVICES = {
    MOBILE: "MOBILE",
    BROWSER: "BROWSER"
};

export const DONT_MOVE_PROGRESS_BAR = "don't move progress bar";

export const GA_TRACKING_ID = "G-8XBVFLR6RB";
