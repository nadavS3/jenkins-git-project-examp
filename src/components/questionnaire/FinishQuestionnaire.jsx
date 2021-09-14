import React, { useEffect, useState } from "react";
import "../../consts/PhoneHeader.scss";
import "./FinishQuestionnaire.scss";
import { useQuestionsStore } from "../../stores/index.store";
import ResultsFinishQuestionnaire from "./ResultsFinishQuestionnaire"
import { getCookie, OUR_COOKIE } from "../../consts/cookies";
import { observer } from "mobx-react-lite";
import "../../consts/Btns.scss";
import { isMobileOnly } from "react-device-detect";

function FinishQuestionnaire(props) {

  const questionsStore = useQuestionsStore();
  const [resultPage, setResultPage] = useState(false);

  useEffect(() => {
    if (getCookie(OUR_COOKIE)) {
      setResultPage(true)
    } // cookies already exist
    if (!questionsStore.menuInfo || questionsStore.menuInfo.length === 0) {
      questionsStore.fetchMenuInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getSkippedQuestion = (question) => {
    questionsStore.fetchQuestionById(question._id)
  }

  return (
    <>
      {resultPage ? <> <ResultsFinishQuestionnaire setMobileBackgroundId={props.setMobileBackgroundId} />  </> :
        <div id="finish-questionnaire-page" className={`fade-in `}>
          {isMobileOnly && <div className="two-logos">
            <img alt="" src="/logos/phone_logo.png" className="mobile-logo" draggable={false} />
            <img alt="" src="/logos/digital-orientation-logo.png" className="mobile-logo" draggable={false} />
          </div>}
          <div id={isMobileOnly ? "mobile-header" : "phone-header"} className="phone-header">השאלון הסתיים</div>
          <div id='finish-message'>
            {questionsStore.getSkippedQuestions && questionsStore.getSkippedQuestions.length ?
              `לא ענית על ${questionsStore.getSkippedQuestions && questionsStore.getSkippedQuestions.length} שאלות \n האם תרצה לחזור ולענות עליהן?`
              : "סיימת את כל השאלות"}
          </div>
          <div id="skipped-questions-container">
            {questionsStore.getSkippedQuestions && questionsStore.getSkippedQuestions.map((skippedQ, index) =>
              <div key={skippedQ.questionNumber}  className="skipped-question" onClick={() => getSkippedQuestion(skippedQ)}>
                <span className="skipped-q-text">{`שאלה ${skippedQ.questionNumber}`}</span>
              </div>
            )}
          </div>
          <div className="phone-btn form-btn" id="finish-btn" onClick={() => { setResultPage(true) }} >
            {questionsStore.getSkippedQuestions && questionsStore.getSkippedQuestions.length > 0 ?
              "לא תודה, הצג תוצאות" : "הצג תוצאות"}</div>
        </div>
      }
    </>
  );
}

export default observer(FinishQuestionnaire);