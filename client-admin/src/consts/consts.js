export const TIMES = ['היום', 'אתמול', 'ב-7 ימים האחרונים', 'ב-28 ימים האחרונים', 'ב-90 ימים האחרונים', 'טווח מותאם אישית'];

export const AGES = ['18-30', '31-40', '41-50', '51 ומעלה', 'הכל'];
export const AGES_VALUE = [{ low: 18, high: 30, }, { low: 31, high: 40, }, { low: 41, high: 51, }, { low: 51, high: 120, }, ''];

export const DGO_LEVELS = ['מדד נמוך', 'מדד בינוני', 'מדד גבוה', 'באמצע השאלון', 'הכל'];
export const DGO_LEVELS_VALUE = ["BAD", "INTERMEDIATE", "GOOD", "UNKNOWN", ''];

export const DGOLEVEL = {
    GOOD: "גבוהה",
    INTERMEDIATE: "בינוני",
    BAD: "נמוך",
    UNKNOWN: <div className="unknown-level"></div>
}
export const ANSWER_STATUS = {
    SKIPPED: "SKIPPED",
    CORRECT: "CORRECT",
    INCORRECT: "INCORRECT",
    UNANSWERED: "UNANSWERED",
    ANSWERED: "ANSWERED"
}

export const COLORS = {
    red: "#B44923",
    lightBlue: "#97BCDF",
    darkBlue: "#103D6B",
    seaGreen: "#64A489",
}

export const STATS_COLORS = [COLORS.red, COLORS.lightBlue, COLORS.darkBlue, COLORS.seaGreen];

export const GENDER_EN_TO_HEB = {
    men: "גברים",
    women: "נשים",
    other: "אחר",
    male: "גברים", // some places men some male
    female: "נשים",
}

export const STATISTICS_PAGES = {
    DEFAULT: 0,
    ALL_QUESTIONS_PAGE: 1,
    BY_CITY_PAGE: 2
}

export const somethingWentWrong = 'אירעה שגיאה, אנא נסה שנית מאוחר יותר';

//* how many users will be fetched every fetch request at usersPage infinite scroll
export const USERS_TO_FETCH_INFINITE_SCROL = 15;

export const DEVICES = {
    MOBILE: "MOBILE",
    BROWSER: "BROWSER"
};
export const AUDIO = 'AUDIO';

export const USER_ROLE = {
    SUPERADMIN: "SUPERADMIN",
    ADMIN: "ADMIN"
};

export const QUESTION_TYPES = {
    MCQ: "MULTIPLE CHOICE",
    PSQ: "PLACE SELECTION",
    DDQ: "DRAG AND DROP"
};

export const HEBREW_QUESTION_TYPES = ["אמריקאית", "לחיצה על המקום הנכון"]; // ! אמריקאית ראשונה

export const ALL_ORGANIZATIONS_FILTER = { _id: "", organizationName: "כל הארגונים" };


//! todo: questionnaireId hard coded
export const REAL_QUESTIONNAIRE_ID = "606ada841623e2ba3f789e4c"; // hard coded questionnaire id
export const FAKE_QUESTIONNAIRE_ID = "60740f3e50805ebb241505dc"; // hard coded questionnaire id