import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from 'react-router';

import { getAccessTokenCookie, OUR_COOKIE, setCookie } from "../../consts/cookies";
import { useQuestionsStore, useUsersStore } from "../../stores/index.store";
import { POP_UP_MESSAGE_PROBLEM } from "../../consts/consts";
import Message from "../../genericComponents/Message";

import "./ResultsFinishQuestionnaire.scss";
import { isMobileOnly } from "react-device-detect";
import { observer } from "mobx-react-lite";

const message0 = "תודה על הזמן שלך!";

function ResultsFinishQuestionnaire(props) {
  const usersStore = useUsersStore();
  const questionsStore = useQuestionsStore();
  const history = useHistory();


  const [thankYouMessage, setThankYouMessage] = useState(true)

  const [messagesArray, setMessagesArray] = useState([])

  const goToQuestionsReview = () => {
    window.gtag("event", "started_review_questions", { event_category: "buttons", event_label: "Started questions review" })
    questionsStore.setReviewMode(true);
    history.push('/questions-review');
  }
  const goToCoursesPage = () => {
    window.gtag("event", "enters_courses_page", { event_category: "buttons", event_label: "Enters courses page" })
    // history.push('/courses-page');
  }


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tempCoursesMessage = useMemo(() => <div>יש <b className="clickable" onClick={goToCoursesPage}><a href="https://campus.gov.il/" target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }} >ללחוץ כאן</a></b> כדי להירשם לקורסים על מנת לשפר את הכישורים הדיגיטליים שלך </div>, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messageLast = useMemo(() => <div>יש <b className="clickable" onClick={goToQuestionsReview}>ללחוץ כאן</b> כדי לראות את התשובות הנכונות לשאלות עליהן ענית לא נכון </div>, []);
  const fetchData = async () => {
    try {
      let res = await usersStore.getUserResults();
      if (typeof res.data === 'string' || Object.keys(res.data).length === 0) {
        setTimeout(() => {
          //we dont want the first popup to run over this popup if exist
          usersStore.showErrorPopUp(POP_UP_MESSAGE_PROBLEM)
        }, 5000);
      }
      else {
        let totalCorrect = 0;
        let total = 0;
        res.data.forEach(elem => {
          totalCorrect += elem.correctAnswers;
          total += elem.numberOfQuestions
        })
        const message1 = `ענית נכון על  ${Math.floor(checkResultsPercentage(total, totalCorrect))}% מהשאלות`
        let tempMSGarr = [<Message
          key={1}
          style={{ animationDelay: `1s` }}
          className="showup-animation"
          message={message1}
          num={1} />]

        res.data.forEach((result, index) => {
          // const correctAnswersPercentage = Math.floor(checkResultsPercentage(result.numberOfQuestions, result.correctAnswers));
          const categorySuccessMsg = <div>
            <img alt="" src={result.iconPath ? result.iconPath : ''} id={`category-icon${index + 2}`} className="category-icons"></img>
            {' ב'}<b>{result.categoryName}</b> {`ענית נכון על ${result.correctAnswers} שאלות מתוך ${result.numberOfQuestions}.\n`}
            {/* {(result.courseLink && typeof result.courseLink === "string" && correctAnswersPercentage < 75) ?
              <div>למעבר אל קורס בנושא <a id="course-link" href={result.courseLink} rel="noopener noreferrer" target="_blank"  >לחץ כאן</a></div> : null} */}
          </div>;

          tempMSGarr.push(<Message
            key={result._id}
            className="showup-animation"
            style={{ animationDelay: `${index + 2}s` }}
            message={categorySuccessMsg}
            num={index + 2} />)
        })
        tempMSGarr.push(<Message // temp message while no courses available
          key={res.data.length + 2}
          className={`showup-animation last-message-${isMobileOnly ? 'mobile' : 'browser'}`}
          style={{ animationDelay: `${res.data.length + 2}s` }}
          message={tempCoursesMessage}
          num={res.data.length + 2} />);

        tempMSGarr.push(<Message
          key={res.data.length + 3}
          className={`showup-animation last-message-${isMobileOnly ? 'mobile' : 'browser'}`}
          style={{ animationDelay: `${res.data.length + 3}s` }}
          message={messageLast}
          num={res.data.length + 3} />);

        setMessagesArray(tempMSGarr)
      }
    }
    catch (err) { usersStore.showErrorPopUp(POP_UP_MESSAGE_PROBLEM); }
  }
  useEffect(() => {
    setTimeout(() => {
      setThankYouMessage(false)
      //! for now we are not using the animation because it sucks
      // isMobileOnly && props.setMobileBackgroundId('shrink-background-mobile')
    }, 4000)
    if (!getAccessTokenCookie(OUR_COOKIE)) {
      setCookie(OUR_COOKIE, "1kdf46Jj15kS!1");
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkResultsPercentage = (total, correctAnswers) => {
    return 100 - ((total - correctAnswers) / total * 100)
  }

  return (
    <div id="finish-questionnaire-page" className="fade-in">
      {
        thankYouMessage ? <Message className="thank-you-animation" message={message0} num={0} /> :
          <>
            {isMobileOnly && <div className="two-logos">
              <img alt="" src="/logos/phone_logo.png" className="mobile-logo" draggable={false} />
              <img alt="" src="/logos/digital-orientation-logo.png" className="mobile-logo" draggable={false} />
            </div>}
            <div id={isMobileOnly ? "mobile-header" : "phone-header"} className="phone-header fade-in">תוצאות המבחן שלך</div>
            <div className="all-messages-container" id={isMobileOnly ? "all-messages-mobile" : "all-messages-browser"} >
              {messagesArray}
            </div>
          </>
      }
    </div>
  );
}

export default observer(ResultsFinishQuestionnaire);
